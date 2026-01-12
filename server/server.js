const express = require("express");
const cors = require("cors");
require("dotenv").config();
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const app = express();
const { OpenAI } = require("openai");
const { createClient } = require("@supabase/supabase-js/dist/index.cjs");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

// Stripe

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const userId = intent.metadata?.userId;

      if (userId) {
        await supabase
          .from("profiles")
          .update({ is_premium: true })
          .eq("id", userId);
      }
    }

    res.json({ received: true });
  }
);

app.use(express.json());

app.post("/create-payment-intent", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1999,
      currency: "pln",
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate-quiz", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Brak tekstu" });

  const prompt = `
Na podstawie poniższego tekstu wygeneruj jak najwięcej sensownych pytań quizowych (minimum 15, jeśli się da) z odpowiedziami.
Format odpowiedzi powinien być JSON:
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
      max_tokens: 1000,
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
