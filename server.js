const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB qoşulma
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB qoşuldu'))
    .catch(err => console.error('❌ MongoDB xətası:', err));

// Model
const BirthdaySchema = new mongoose.Schema({
    name: String,
    date: String
});
const Birthday = mongoose.model('Birthday', BirthdaySchema);

// API routes
app.get('/api/birthdays', async (req, res) => {
    const birthdays = await Birthday.find();
    res.json(birthdays);
});

app.post('/api/birthdays', async (req, res) => {
    const { name, date } = req.body;
    const newBirthday = new Birthday({ name, date });
    await newBirthday.save();
    res.json(newBirthday);
});

app.delete('/api/birthdays/:id', async (req, res) => {
    await Birthday.findByIdAndDelete(req.params.id);
    res.json({ message: 'Silindi' });
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server ${PORT} portunda işə düşdü`));
