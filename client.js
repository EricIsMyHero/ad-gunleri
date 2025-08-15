const VAPID_PUBLIC_KEY = "BASt6f1XmZe44Y10HFHSekP5qQQzV2yIy1QTO2qhrarM3-LyYKGrJ6o_Ge3VarD484IDckGl2zmMAs8v2-xsI0o";
const backendUrl = 'https://ad-gunleri.onrender.com';

const form = document.getElementById('birthday-form');
const nameInput = document.getElementById('name');
const dateInput = document.getElementById('date');
const list = document.getElementById('birthday-list');
const notificationBtn = document.getElementById('enable-notifications');

// Service Worker-i qeydiyyatdan keçir
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker qeydiyyatdan keçdi:', registration);
            
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                notificationBtn.textContent = 'Bildirişlər aktivdir';
                notificationBtn.disabled = true;
            }
        } catch (error) {
            console.error('Service Worker qeydiyyatı uğursuz oldu:', error);
        }
    }
}

// URL Base64-ü Uint8Array-ə çevir
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

// Bildiriş düyməsinə klik
notificationBtn.addEventListener('click', async () => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        alert("Push bildirişlərinə icazə vermədiniz.");
        return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await fetch(`${backendUrl}/api/subscribe`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' },
    });

    notificationBtn.textContent = 'Bildirişlər aktivdir';
    notificationBtn.disabled = true;
    alert('Push bildirişlərinə uğurla abunə oldunuz!');
});

// Ad günlərini yüklə və siyahıya əlavə et
async function loadBirthdays() {
    try {
        const res = await fetch(`${backendUrl}/api/birthdays`);
        const data = await res.json();

        list.innerHTML = '';
        if (!data.length) {
            list.innerHTML = '<p style="text-align:center;">Heç bir ad günü tapılmadı. Yeni birini əlavə edin!</p>';
            return;
        }

        data.forEach(b => {
            const card = document.createElement('div');
            card.className = 'birthday-card';

            const nameEl = document.createElement('p');
            nameEl.className = 'name';
            nameEl.textContent = b.name;

            const dateEl = document.createElement('p');
            dateEl.className = 'date';
            const formattedDate = new Date(b.date).toLocaleDateString('az-AZ', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            dateEl.textContent = formattedDate;

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.textContent = 'X';
            delBtn.title = 'Sil';
            delBtn.onclick = async () => {
                if (confirm(`'${b.name}' adlı ad gününü silmək istədiyinizə əminsiniz?`)) {
                    await fetch(`${backendUrl}/api/birthdays/${b._id}`, { method: 'DELETE' });
                    loadBirthdays(); // Dərhal yenilə
                }
            };

            card.appendChild(delBtn);
            card.appendChild(nameEl);
            card.appendChild(dateEl);
            list.appendChild(card);
        });
    } catch (error) {
        list.innerHTML = `<p>Xəta baş verdi: ${error.message}</p>`;
    }
}

// Formanı göndərmə
form.addEventListener('submit', async e => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const date = dateInput.value;

    if (!name || !date) {
        alert("Ad və tarix daxil edin!");
        return;
    }

    await fetch(`${backendUrl}/api/birthdays`, {
        method: 'POST',
        body: JSON.stringify({ name, date }),
        headers: { 'Content-Type': 'application/json' },
    });

    e.target.reset();
    loadBirthdays(); // Dərhal siyahıya əlavə et
});

// Səhifə yüklənəndə
registerServiceWorker();
loadBirthdays();
