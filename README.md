# Ad Günü Xatırladıcı Tətbiqi

Bu, ad günlərini qeyd etmək və yaxınlaşan ad günləri barədə push bildirişləri almaq üçün sadə bir veb-tətbiqdir. Tətbiq Node.js, Express, MongoDB və Web Push texnologiyaları ilə qurulmuşdur.

## Xüsusiyyətləri

-   Ad günlərini əlavə etmək, görmək və silmək.
-   Təmiz və müasir istifadəçi interfeysi.
-   Ad günü gəldikdə brauzer vasitəsilə push bildirişləri göndərir.
-   Bildirişlər gündə bir dəfə avtomatik olaraq yoxlanılır.
-   Adaptiv dizayn (mobil və masaüstü cihazlar üçün).

## Texnologiyalar

-   **Backend:** Node.js, Express.js
-   **Verilənlər Bazası:** MongoDB (Mongoose ilə)
-   **Frontend:** HTML, CSS, Vanilla JavaScript
-   **Push Bildirişləri:** Web Push Protocol, Service Workers
-   **Planlaşdırılmış Tapşırıqlar:** `node-cron`

## Qurulum və İşə Salma

1.  **Repo-nu klonlayın:**
    ```bash
    git clone [https://github.com/your-username/ad-gunleri-main.git](https://github.com/your-username/ad-gunleri-main.git)
    cd ad-gunleri-main
    ```

2.  **Asılılıqları quraşdırın:**
    ```bash
    npm install
    ```

3.  **`.env` faylını yaradın:**
    `.env.example` faylının adını `.env` olaraq dəyişin və içindəki dəyərləri öz məlumatlarınızla əvəz edin:
    -   `MONGODB_URI`: Sizin MongoDB qoşulma sətriniz.
    -   `PUBLIC_VAPID_KEY` və `PRIVATE_VAPID_KEY`: VAPID açarlarınız. `npx web-push generate-vapid-keys` əmri ilə yeni açarlar yarada bilərsiniz.
    -   `PORT`: Tətbiqin işləyəcəyi port (məsələn, 3000).

4.  **Tətbiqi işə salın:**
    ```bash
    npm start
    ```

    Server `http://localhost:3000` ünvanında işə düşəcək.
