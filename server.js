const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// VAPID açarları
const publicVapidKey = 'SENIN_PUBLIC_VAPID_KEY';
const privateVapidKey = 'SENIN_PRIVATE_VAPID_KEY';

webpush.setVapidDetails('mailto:you@example.com', publicVapidKey, privateVapidKey);

// Hazır test istifadəçiləri
let birthdays = [
  { name: "Ali", day: 13, month: 8 },
  { name: "Leyla", day: 14, month: 8 },
  { name: "Nigar", day: 15, month: 8 }
];

let subscriptions = [];

// Frontend-dən abunə qəbul et
app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  res.status(201).json({});
});

// Yeni ad günü əlavə et
app.post('/add-birthday', (req, res) => {
  const { name, day, month } = req.body;
  if(name && day && month) {
    birthdays.push({ name, day, month });
    res.status(201).json({ message: `${name} əlavə edildi!` });
  } else {
    res.status(400).json({ message: 'Bütün sahələr doldurulmalıdır!' });
  }
});

// Ad günü yoxlama və göndərmə
cron.schedule('* * * * *', () => { // test üçün hər dəqiqə
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;

  birthdays.forEach(b => {
    if(b.day === day && b.month === month) {
      const payload = JSON.stringify({
        title: "Ad günü!",
        body: `${b.name}ın ad günüdür!`
      });

      subscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(err => console.error(err));
      });
    }
  });
});

app.listen(3000, () => console.log('Server 3000 portunda işləyir'));
