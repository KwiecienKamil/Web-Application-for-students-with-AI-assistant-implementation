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

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  console.log("Webhook received:", req.body);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Błąd weryfikacji podpisu webhooka:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Webhook event received:", event.type);

  const updateUserPremium = (googleId, isPremium) => {
    return new Promise((resolve, reject) => {
      db.query(
        "UPDATE users SET is_premium = ? WHERE google_id = ?",
        [isPremium, googleId],
        (err, results) => {
          if (err) {
            console.error("❌ Błąd aktualizacji użytkownika:", err.message);
            return reject(err);
          }
          console.log(
            `[Premium] ${googleId} → ${isPremium ? "premium" : "nie-premium"}`
          );
          resolve(results);
        }
      );
    });
  };

  const allowedEvents = [
    "checkout.session.completed",
    "payment_intent.succeeded",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
  ];

  if (!allowedEvents.includes(event.type)) {
    console.log(`ℹNieobsługiwany event: ${event.type}`);
    return res.status(200).send("Event zignorowany");
  }

  (async () => {
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const googleId = session.client_reference_id;
          if (!googleId) {
            console.warn("Brak client_reference_id w sesji Stripe.");
            break;
          }
          await updateUserPremium(googleId, true);
          break;
        }

        case "payment_intent.succeeded": {
          const paymentIntent = event.data.object;
          const googleId = paymentIntent.metadata?.googleId;
          if (!googleId) {
            console.warn("Brak metadata.googleId w PaymentIntent.");
            break;
          }
          await updateUserPremium(googleId, true);
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const googleId = subscription.metadata?.googleId;
          if (!googleId) {
            console.warn("Brak metadata.googleId w subskrypcji.");
            break;
          }
          const isActive = subscription.status === "active";
          await updateUserPremium(googleId, isActive);
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const googleId = subscription.metadata?.googleId;
          if (!googleId) {
            console.warn("Brak metadata.googleId w subskrypcji (usunięcie).");
            break;
          }
          await updateUserPremium(googleId, false);
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          const googleId = invoice.metadata?.googleId;
          if (googleId) {
            await updateUserPremium(googleId, true);
          } else {
            console.warn("invoice.payment_succeeded bez metadata.googleId");
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const googleId = invoice.metadata?.googleId;
          if (googleId) {
            console.warn(`Płatność nieudana dla użytkownika: ${googleId}`);
          } else {
            console.warn("invoice.payment_failed bez metadata.googleId");
          }
          break;
        }

        default:
          console.log(`Nieobsługiwany typ eventu: ${event.type}`);
      }
    } catch (e) {
      console.error("Błąd w obsłudze webhooka:", e);
    } finally {
      res.status(200).send("Webhook received");
    }
  })();
});

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
  const { googleId } = req.body;

  if (!googleId) {
    return res.status(400).json({ error: "Brak googleId w żądaniu" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "pln",
      amount: 1999,
      payment_method_types: ["card", "blik", "p24"],
      metadata: {
        googleId,
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

app.post("/create-subscription-session", async (req, res) => {
  const { customerEmail, googleId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: customerEmail,
      client_reference_id: googleId,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/premium-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/premium-cancelled`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Błąd tworzenia sesji Stripe:", error.message);
    res.status(500).json({ error: "Nie udało się utworzyć sesji płatności" });
  }
});

app.get("/check-subscription/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );
    if (session.payment_status === "paid") {
      const googleId = session.client_reference_id;
      if (!googleId) {
        return res
          .status(400)
          .json({ error: "Brak client_reference_id w sesji" });
      }

      db.query(
        "UPDATE users SET is_premium = 1 WHERE google_id = ?",
        [googleId],
        (err) => {
          if (err) {
            console.error("Błąd aktualizacji premium:", err);
            return res.status(500).json({ error: "Błąd aktualizacji bazy" });
          }
          return res.json({ success: true });
        }
      );
    } else {
      return res.json({ success: false });
    }
  } catch (err) {
    console.error("Błąd sprawdzania subskrypcji:", err.message);
    return res.status(500).json({ error: "Błąd sprawdzania płatności" });
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
