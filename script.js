// --- Firebase Konfiqurasiyası ---
const firebaseConfig = {
    apiKey: "AIzaSyDWhvfx-7CiVGxdHFgR_kE2xVBAmOm6yrc",
    authDomain: "device-streaming-36e0d1e5.firebaseapp.com",
    databaseURL: "https://device-streaming-36e0d1e5-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "device-streaming-36e0d1e5",
    storageBucket: "device-streaming-36e0d1e5.firebasestorage.app",
    messagingSenderId: "565227952193",
    appId: "1:565227952193:web:6a36fdf14e5800c2864ec0"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// --- DOM Elementləri ---
const form = document.getElementById('file-form');
const slider = document.getElementById('slider');
const videoListAll = document.getElementById('video-list-all');
const audioListAll = document.getElementById('audio-list-all');
const myFilesList = document.getElementById('my-files-list');
const navButtonsContainer = document.querySelector('.nav-buttons');

// --- İstifadəçi ID ---
let currentUser = localStorage.getItem('userId');
if (!currentUser) {
    currentUser = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', currentUser);
}

// --- Yardımçı funksiyalar ---
const isAudioUrl = (url) => /\.(mp3|wav|ogg|aac)$/i.test(url);
const isYouTubeUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);

function getYouTubeEmbedUrl(url) {
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/;
    const match = url.match(regExp);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function createFileCard(fileData, fileId) {
    const isAudio = isAudioUrl(fileData.url);
    const isYouTube = isYouTubeUrl(fileData.url);
    const isOwner = fileData.ownerId === currentUser;

    const card = document.createElement('div');
    card.className = 'media-card';
    
    let mediaElement = '';
    if (isAudio) {
        mediaElement = `<audio controls src="${fileData.url}"></audio>`;
    } else {
        if (isYouTube) {
            const embedUrl = getYouTubeEmbedUrl(fileData.url);
            mediaElement = `<iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        } else {
            mediaElement = `<video controls src="${fileData.url}"></video>`;
        }
    }

    const deleteBtnHTML = isOwner ? `<button class="delete-btn" data-id="${fileId}">×</button>` : '';

    card.innerHTML = `
        ${mediaElement}
        <h3 class="media-title">${fileData.title}</h3>
        ${deleteBtnHTML}
    `;
    return card;
}

function renderFiles(filesObject) {
    videoListAll.innerHTML = '';
    audioListAll.innerHTML = '';
    myFilesList.innerHTML = '';

    if (!filesObject) {
        videoListAll.innerHTML = 'Heç bir video tapılmadı.';
        audioListAll.innerHTML = 'Heç bir səs faylı tapılmadı.';
        myFilesList.innerHTML = 'Heç bir faylınız yoxdur.';
        return;
    }

    for (const fileId in filesObject) {
        const fileData = filesObject[fileId];
        const card = createFileCard(fileData, fileId);
        
        if (isAudioUrl(fileData.url)) {
            audioListAll.prepend(card.cloneNode(true));
        } else {
            videoListAll.prepend(card.cloneNode(true));
        }

        if (fileData.ownerId === currentUser) {
            myFilesList.prepend(card);
        }
    }

    if (videoListAll.innerHTML === '') videoListAll.innerHTML = 'Heç bir video tapılmadı.';
    if (audioListAll.innerHTML === '') audioListAll.innerHTML = 'Heç bir səs faylı tapılmadı.';
    if (myFilesList.innerHTML === '') myFilesList.innerHTML = 'Heç bir faylınız yoxdur.';
}

function navigateToPage(pageIndex) {
    slider.style.transform = `translateX(-${pageIndex * 25}%)`;
    const buttons = navButtonsContainer.querySelectorAll('.nav-btn');
    buttons.forEach((btn, index) => {
        btn.classList.toggle('active', index === pageIndex);
    });
}

// --- Hadisə Dinləyiciləri ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const url = document.getElementById('url').value;

    const fileData = {
        title,
        url,
        ownerId: currentUser,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    database.ref('files').push(fileData);

    form.reset();
    navigateToPage(2);
});

document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const fileId = e.target.dataset.id;
        if (confirm("Bu faylı silmək istədiyinizə əminsiniz?")) {
            database.ref('files/' + fileId).remove();
        }
    }

    const navBtn = e.target.closest('.nav-btn');
    if (navBtn) {
        const pageIndex = parseInt(navBtn.dataset.page, 10);
        navigateToPage(pageIndex);
    }
});

// --- Realtime DB ---
database.ref('files').on('value', (snapshot) => {
    const files = snapshot.val();
    renderFiles(files);
});
