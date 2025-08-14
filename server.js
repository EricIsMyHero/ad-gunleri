import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import webpush from "web-push";
import cors from "cors";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB-ə qoşuldu"))
  .catch((err) => console.error("❌ MongoDB bağlantı xətası:", err));

// Mongoose Schema və Model
const birthdaySchema = new mongoose.Schema({
  name: String,
  date: String, // YYYY-MM-DD formatında
});

const Birthday = mongoose.model("Birthday", birthdaySchema);

// Push Notification üçün açarlar
const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails("mailto:test@example.com", publicVapidKey, privateVapidKey);

// ===== API ROUTES =====

// Bütün ad günlərini gətir
app.get("/birthdays", async (req, res) => {
  try {
    const birthdays = await Birthday.find();
    res.json(birthdays);
  } catch (err) {
    res.status(500).json({ error: "Server xətası" });
  }
});

// Yeni ad günü əlavə et
app.post("/birthdays", async (req, res) => {
  try {
    const { name, date } = req.body;
    const birthday = new Birthday({ name, date });
    await birthday.save();
    res.json(birthday);
  } catch (err) {
    res.status(500).json({ error: "Yadda saxlanmadı" });
  }
});

// Ad günü sil
app.delete("/birthdays/:id", async (req, res) => {
  try {
    await Birthday.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Silinmədi" });
  }
});

// Push subscribe
let subscriptions = [];

app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({});
});

// Test üçün push göndər
app.post("/trigger", async (req, res) => {
  const notificationPayload = JSON.stringify({
    title: "Xatırlatma",
    body: "Bu gün kiminsə ad günüdür 🎉",
  });

  const promises = subscriptions.map((sub) =>
    webpush.sendNotification(sub, notificationPayload).catch((err) => console.error(err))
  );

  await Promise.all(promises);
  res.status(200).json({ message: "Bildirişlər göndərildi" });
});

// Serveri işə sal
app.listen(port, () => {
  console.log(`🚀 Server http://localhost:${port} ünvanında işə düşdü`);
});
