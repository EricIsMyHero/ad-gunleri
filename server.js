const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const cron = require('node-cron');
const path = require('path');

const app = express();
app.use(bodyParser.json());
// index.html və digər statik faylları təqdim etmək üçün
app.use(express.static(path.join(__dirname)));


// VAPID açarlarını dəyişməyi unutmayın!
const publicVapidKey = 'SENIN_PUBLIC_VAPID_KEY';
const privateVapidKey = 'SENIN_PRIVATE_VAPID_KEY';

webpush.setVapidDetails('mailto:you@example.com', publicVapidKey, privateVapidKey);

// Test üçün ad günləri. Real proyektlərdə bu məlumatlar verilənlər bazasında saxlanılmalıdır.
let birthdays = [
  { name: "Əli Vəliyev", day: 13, month: 8 },
  { name: "Leyla Quliyeva", day: 14, month: 8 },
  { name: "Nigar Məmmədova", day: 15, month: 8 }
];

// Abunəliklər burada saxlanılır. Bu da verilənlər bazasında olmalıdır.
let subscriptions = [];

// Route: Əsas səhifə
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: Abunəlikləri qəbul et
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  console.log('Yeni abunəlik:', subscription);
  res.status(201).json({ message: 'Abunəlik qəbul edildi' });
});

// Route: Yeni ad günü əlavə et
app.post('/add-birthday', (req, res) => {
  const { name, day, month } = req.body;
  if(name && day && month) {
    birthdays.push({ name, day, month });
    console.log('Yeni ad günü əlavə edildi:', { name, day, month });
    res.status(201).json({ message: `${name} adlı şəxsin ad günü uğurla əlavə edildi!` });
  } else {
    res.status(400).json({ message: 'Bütün sahələr doldurulmalıdır!' });
  }
});

// YENİ Route: Bütün ad günlərini qaytar
app.get('/birthdays', (req, res) => {
    res.status(200).json(birthdays);
});

// Hər gün səhər saat 9-da yoxlamaq üçün cron job (test üçün '* * * * *')
cron.schedule('0 9 * * *', () => {
  console.log('Ad günü yoxlaması başladı...');
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;

  const todayBirthdays = birthdays.filter(b => b.day === day && b.month === month);

  if (todayBirthdays.length > 0) {
    todayBirthdays.forEach(b => {
        const payload = JSON.stringify({
            title: "🎉 Ad Günü Xatırlatması! 🎉",
            body: `Bu gün ${b.name}ın ad günüdür! Təbrik etməyi unutma! 🥳`
        });

        console.log(`Bildiriş göndərilir: ${b.name}`);
        subscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => {
                console.error('Bildiriş göndərilə bilmədi', err);
            });
        });
    });
  } else {
      console.log('Bu gün üçün ad günü tapılmadı.');
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda işə düşdü`));
