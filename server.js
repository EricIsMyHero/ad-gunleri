const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cron = require('node-cron');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// VAPID açarları (öncə generate et)
// web-push generate-vapid-keys
const publicVapidKey = 'SENIN_PUBLIC_VAPID_KEY';
const privateVapidKey = 'SENIN_PRIVATE_VAPID_KEY';

webpush.setVapidDetails('mailto:you@example.com', publicVapidKey, privateVapidKey);

// Test istifadəçiləri (ad günləri)
let birthdays = [
  { name: "Ali", day: 13, month: 8 },
  { name: "Leyla", day: 14, month: 8 },
  { name: "Nigar", day: 15, month: 8 }
];

let subscriptions = []; // istifadəçi subscription-ları

// Frontend-dən abunə qəbul et
app.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  res.status(201).json({});
});

// Ad günü yoxlama və göndərmə
cron.schedule('* * * * *', () => { // hər dəqiqə yoxlayır (test üçün)
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
