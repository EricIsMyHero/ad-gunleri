import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
// DƏYİŞİKLİK BURADADIR: Statik fayllar ana qovluqdan ("./") oxunur
app.use(express.static('.')); 

// MongoDB qoşulması
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB-ə qoşuldu"))
  .catch(err => console.error("❌ MongoDB xətası:", err));

// Mongoose Schema
const birthdaySchema = new mongoose.Schema({
    name: String,
    date: String
});

const Birthday = mongoose.model("Birthday", birthdaySchema);

// GET /api/birthdays – bütün ad günləri
app.get("/api/birthdays", async (req, res) => {
    try {
        const birthdays = await Birthday.find();
        res.json(birthdays);
    } catch (err) {
        res.status(500).json({ error: "Server xətası" });
    }
});

// POST /api/birthdays – yeni ad günü əlavə et
app.post("/api/birthdays", async (req, res) => {
    try {
        const { name, date } = req.body;
        if (!name || !date) return res.status(400).json({ error: "Ad və tarix tələb olunur" });

        const newBirthday = new Birthday({ name, date });
        await newBirthday.save();
        res.status(201).json({ success: true, birthday: newBirthday });
    } catch (err) {
        res.status(500).json({ error: "Server xətası" });
    }
});

// DELETE /api/birthdays/:id – ad gününü sil
app.delete("/api/birthdays/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Birthday.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: "Ad günü tapılmadı" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Server xətası" });
    }
});

// Serveri işə sal
app.listen(PORT, () => {
    console.log(`🚀 Server http://localhost:${PORT} ünvanında işə düşdü`);
});
