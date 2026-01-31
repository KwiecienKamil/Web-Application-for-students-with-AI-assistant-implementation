const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const app = express();
const validator = require("validator");
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const { OpenAI } = require("openai");
const supabase = require("./lib/supabaseClient");

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Nie udało się połączyć z bazą:", err.message);
    process.exit(1);
  }
  console.log("Połączono z bazą danych (pool)");
  connection.release();
});

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

app.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send("Webhook error");
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;

    const [rows] = await db.promise().query(
      "SELECT id FROM payments WHERE stripe_pi_id = ?",
      [paymentIntent.id]
    );

    if (rows.length === 0) {
      await db.promise().query(
        "INSERT INTO payments (stripe_pi_id, user_id, amount) VALUES (?, ?, ?)",
        [paymentIntent.id, userId, paymentIntent.amount]
      );

      await db.promise().query(
        "UPDATE users SET is_premium = 1 WHERE supabase_id = ?",
        [userId]
      );
    }
  }

  res.json({ received: true });
});


app.use(bodyParser.json());

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// Stripe

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Brak userId w żądaniu" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "pln",
      amount: 3999,
      payment_method_types: ["card", "blik", "p24"],
      metadata: {
        userId,
      },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
});

// Nodemailer

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/send-reminder", (req, res) => {
  const { to, subject, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Błąd przy wysyłaniu maila:", err);
      return res.status(500).json({ error: "Nie udało się wysłać maila" });
    } else {
      console.log("Email wysłany:", info.response);
      return res.status(200).json({ message: "Email wysłany pomyślnie" });
    }
  });
});

cron.schedule("0 5 * * *", () => {
  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const formattedDate = oneWeekLater.toISOString().split("T")[0];

  const query = `
    SELECT exams.*, users.email, users.name
    FROM exams
    JOIN users ON exams.user_id = users.google_id
    WHERE DATE(exams.date) = ?
  `;

  db.query(query, [formattedDate], (err, results) => {
    if (err) {
      console.error("Błąd przy pobieraniu egzaminów:", err);
      return;
    }

    if (results.length === 0) {
      return;
    }

    results.forEach((exam) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: exam.email,
        subject: `Przypomnienie: egzamin z ${exam.subject} za 7 dni!`,
        text: `Cześć ${
          exam.name || "Student"
        }!\n\nMasz zaplanowany egzamin z przedmiotu "${exam.subject}" w dniu ${
          exam.date
        } (termin: ${
          exam.term
        }).\n\nPowodzenia i nie zapomnij się przygotować!\n\nZespół Ogarnijto.org`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(`Nie udało się wysłać maila do ${exam.email}:`, err);
        } else {
          console.log(`Przypomnienie wysłane do ${exam.email}`);
        } 
      });
    });
  });
});

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const token = authHeader.split(" ")[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.error("Supabase auth error:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("Auth middleware crash:", err);
    return res.status(500).json({ error: "Auth middleware error" });
  }
};



app.post("/save-user", requireAuth, (req, res) => {
  const { email, name, picture, is_beta_tester } = req.body;
  const supabaseId = req.user.id;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).send("Invalid user data");
  }

  const safeName = name ?? null;
  const safePicture = picture ?? null;
  const isBetaTesterValue = is_beta_tester ? 1 : 0;

  db.query(
    "SELECT id FROM users WHERE supabase_id = ?",
    [supabaseId],
    (err, rows) => {
      if (err) return res.status(500).send("DB error");

      if (rows.length > 0) {
        db.query(
          `UPDATE users 
           SET email = ?, name = ?, picture = ?, isBetaTester = ?
           WHERE supabase_id = ?`,
          [email, safeName, safePicture, isBetaTesterValue, supabaseId],
          () => res.status(200).send("User updated")
        );
      } else {
        db.query(
          `INSERT INTO users 
           (supabase_id, email, name, picture, isBetaTester)
           VALUES (?, ?, ?, ?, ?)`,
          [supabaseId, email, safeName, safePicture, isBetaTesterValue],
          () => res.status(201).send("User created")
        );
      }
    }
  );
});



app.post("/exams", (req, res) => {
  const { user_id, subject, date, term, note } = req.body;

  if (!user_id || !subject || !date || !term) {
    return res.status(400).json({ error: "Brak wymaganych danych" });
  }

  const query =
    "INSERT INTO exams (user_id, subject, date, term, note) VALUES (?, ?, ?, ?, ?)";

  db.query(query, [user_id, subject, date, term, note || ""], (err, result) => {
    if (err) {
      console.error("Błąd przy zapisie egzaminu:", err);
      return res.status(500).json({ error: "Błąd zapisu egzaminu" });
    }

    if (result.affectedRows === 1) {
      const insertedExam = {
        id: result.insertId,
        user_id,
        subject,
        date,
        term,
        note: note || "",
      };
      return res.status(201).json(insertedExam);
    } else {
      return res.status(500).json({ error: "Nie udało się zapisać egzaminu" });
    }
  });
});

app.get("/exams/:user_id", (req, res) => {
  const userId = req.params.user_id;

  db.query("SELECT * FROM exams WHERE user_id = ?", [userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.delete("/exams/:id", (req, res) => {
  const examId = req.params.id;

  db.query("DELETE FROM exams WHERE id = ?", [examId], (err, result) => {
    if (err) {
      console.error("Błąd podczas usuwania egzaminu:", err);
      return res.status(500).json({ error: "Błąd podczas usuwania egzaminu" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Egzamin nie znaleziony" });
    }

    res.status(200).json({ message: "Egzamin usunięty" });
  });
});

app.get("/user/:googleId", (req, res) => {
  const googleId = req.params.googleId;

  db.query(
    "SELECT name, email, picture, google_id, is_premium, terms_accepted, isBetaTester, isProfilePublic FROM users WHERE google_id = ?",
    [googleId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0) {
        return res.status(404).json({ error: "Użytkownik nie znaleziony" });
      }

      res.json(results[0]);
    },
  );
});

app.delete("/delete/:googleId", (req, res) => {
  const googleId = req.params.googleId;

  db.query("DELETE FROM exams WHERE user_id = ?", [googleId], (err) => {
    if (err) return res.status(500).json({ error: err.message });

    db.query(
      "DELETE FROM users WHERE google_id = ?",
      [googleId],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.affectedRows === 0) {
          return res
            .status(404)
            .json({ success: false, error: "Użytkownik nie znaleziony" });
        }

        res.json({
          success: true,
          message: "Konto i powiązane dane zostały usunięte",
        });
      },
    );
  });
});

app.put("/user/settings", (req, res) => {
  const { googleId, username, isProfilePublic } = req.body;
  if (!googleId) return res.status(400).json({ error: "Brak googleId" });

  db.query(
    "UPDATE users SET name = ?, isProfilePublic = ? WHERE google_id = ?",
    [username, isProfilePublic ? 1 : 0, googleId],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: "Ustawienia zapisane" });
    },
  );
});

app.post("/accept-terms", (req, res) => {
  const { google_id } = req.body;

  if (!google_id) {
    return res.status(400).json({ error: "Brak google_id w żądaniu" });
  }

  const sql = "UPDATE users SET terms_accepted = 1 WHERE google_id = ?";

  db.query(sql, [google_id], (err, result) => {
    if (err) {
      console.error("Błąd aktualizacji terms_accepted:", err);
      return res.status(500).json({ error: "Błąd serwera" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Użytkownik nie znaleziony" });
    }

    res.json({ message: "Regulamin zaakceptowany" });
  });
});

app.put("/exams/:id", (req, res) => {
  const examId = req.params.id;

  db.query("SELECT * FROM exams WHERE id = ?", [examId], (err, rows) => {
    if (err) {
      console.error("Błąd podczas pobierania egzaminu:", err);
      return res.status(500).json({ error: "Błąd serwera" });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: "Egzamin nie znaleziony" });
    }

    const existingExam = rows[0];

    const updatedExam = {
      subject: req.body.subject ?? existingExam.subject,
      date: req.body.date ?? existingExam.date,
      term: req.body.term ?? existingExam.term,
      note: req.body.note ?? existingExam.note,
      completed:
        req.body.completed !== undefined
          ? req.body.completed
            ? 1
            : 0
          : existingExam.completed,
    };

    if (!updatedExam.subject || !updatedExam.date || !updatedExam.term) {
      return res
        .status(400)
        .json({ error: "Brak wymaganych danych: subject, date, term" });
    }

    const queryUpdate = `
      UPDATE exams
      SET subject = ?, date = ?, term = ?, note = ?, completed = ?
      WHERE id = ?
    `;

    db.query(
      queryUpdate,
      [
        updatedExam.subject,
        updatedExam.date,
        updatedExam.term,
        updatedExam.note,
        updatedExam.completed,
        examId,
      ],
      (err2, result) => {
        if (err2) {
          console.error("Błąd podczas aktualizacji egzaminu:", err2);
          return res
            .status(500)
            .json({ error: "Błąd podczas aktualizacji egzaminu" });
        }

        db.query(
          "SELECT * FROM exams WHERE id = ?",
          [examId],
          (err3, rows2) => {
            if (err3) {
              console.error(
                "Błąd podczas pobierania egzaminu po update:",
                err3,
              );
              return res.status(500).json({ error: "Błąd serwera" });
            }

            res.json(rows2[0]);
          },
        );
      },
    );
  });
});

app.post("/quiz-result", (req, res) => {
  const { userId, score, total, percentage, answers } = req.body;

  db.query(
    `INSERT INTO quiz_results (user_id, score, total_questions, percentage)
     VALUES (?, ?, ?, ?)`,
    [userId, score, total, percentage],
    (err, result) => {
      if (err) {
        console.error("Błąd SQL:", err);
        return res.status(500).json({ error: "Błąd zapisu wyniku" });
      }

      const quizResultId = result.insertId;

      if (!answers || answers.length === 0) {
        return res.json({ success: true, quizResultId });
      }

      const values = answers.map((a) => [
        quizResultId,
        a.question,
        a.correct,
        a.user,
        a.isCorrect ? 1 : 0,
      ]);

      db.query(
        `INSERT INTO quiz_answers
         (quiz_result_id, question, correct_answer, user_answer, is_correct)
         VALUES ?`,
        [values],
        (err2) => {
          if (err2) {
            console.error("Błąd SQL:", err2);
            return res
              .status(500)
              .json({ error: "Błąd zapisu odpowiedzi quizu" });
          }

          return res.json({ success: true, quizResultId });
        },
      );
    },
  );
});

app.get("/quiz-results/:userId", (req, res) => {
  const { userId } = req.params;

  const sql = `
    SELECT id, score, total_questions, percentage, created_at AS date
    FROM quiz_results
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `;

  db.query(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Błąd pobierania wyników:", err);
      return res.status(500).json({ error: "Błąd pobierania wyników" });
    }

    res.json(rows);
  });
});

app.get("/quiz-result-details/:quizResultId", (req, res) => {
  const { quizResultId } = req.params;

  db.query(
    `SELECT question, correct_answer, user_answer, is_correct
     FROM quiz_answers
     WHERE quiz_result_id = ?`,
    [quizResultId],
    (err, rows) => {
      if (err) {
        console.error("Błąd pobierania szczegółów quizu:", err);
        return res
          .status(500)
          .json({ error: "Błąd pobierania szczegółów quizu" });
      }

      return res.json(rows);
    },
  );
});

app.get("/me", (req, res) => {
  const googleId = req.headers["x-google-id"];

  if (!googleId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  db.query(
    "SELECT name, email, picture, google_id, is_premium, terms_accepted FROM users WHERE google_id = ?",
    [googleId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Użytkownik nie znaleziony" });
      }

      const user = results[0];
      user.terms_accepted = !!user.terms_accepted;
      user.is_premium = !!user.is_premium;

      res.json(user);
    },
  );
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate-quiz", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Brak tekstu" });

  const prompt = `
Na podstawie poniższego tekstu wygeneruj jak najwięcej sensownych pytań quizowych (minimum 15, jeśli się da) z odpowiedziami.
Finalna tablica niech się nazywa questions. Format odpowiedzi powinien być JSON:
[
  {"question": "Pytanie 1?", "answer": "Odpowiedź 1"},
  {"question": "Pytanie 2?", "answer": "Odpowiedź 2"},
  ...
]

Tekst:
${text}
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    let contentClean = content.trim();

    if (contentClean.startsWith("```json")) {
      contentClean = contentClean.slice(7).trim();
    }

    if (contentClean.endsWith("```")) {
      contentClean = contentClean.slice(0, -3).trim();
    }

    const quizItems = JSON.parse(contentClean);
    res.json({ quizItems });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Błąd generowania quizu" });
  }
});

app.get("/", (req, res) => {
  res.send("Serwer działa poprawnie!");
});

app.listen(process.env.PORT || 8081, () => {
  console.log("listening");
});
