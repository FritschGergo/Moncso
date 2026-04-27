# Macska Akadémia - Online Oktatási Platform

Ez egy modern, React-alapú online oktatási platform, kifejezetten macskaviselkedési kurzusokhoz tervezve. Tartalmaz egy adminisztrációs felületet a tanulók és tananyagok kezeléséhez, valamint Google Drive integrációt a házi feladatok feltöltéséhez.

## Funkciók

- **Tanulói Dashboard**: Kövesd nyomon a haladásodat és a leckék feloldását.
- **Admin Felület**: Kezeld a tanulókat, bírálj el házi feladatokat, és állítsd be a kurzusokat.
- **Drip Content**: Idő- és feladatfüggő leckefeloldási logika.
- **Google Drive Integráció**: Házi feladatok automatikus feltöltése a tanuló saját Drive fiókjáról.
- **Email Értékesítés**: Automatikus értesítés az adminnak vásárlási szándék esetén.

## Technológiai Stack

- **Frontend**: React + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Express.js (proxy és email küldéshez)
- **Database/Auth**: Firebase (Firestore & Auth)
- **File Upload**: Google Drive API

## Beállítások

1. Klónozd a repót:
   ```bash
   git clone <repo-url>
   cd <repo-name>
   ```

2. Telepítsd a függőségeket:
   ```bash
   npm install
   ```

3. Másold le a `.env.example` fájlt `.env`-re:
   ```bash
   cp .env.example .env
   ```

4. Töltsd ki a `.env` fájlt a saját értékeiddel (Firebase kulcsok, Google Client ID, SMTP adatok).

5. Indítsd el a fejlesztői szervert:
   ```bash
   npm run dev
   ```

## Környezeti változók (.env)

| Változó | Leírás |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase API kulcs |
| `VITE_ADMIN_EMAIL` | Az adminisztrátor email címe (aki admin jogosultságot kap) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID a Drive feltöltéshez |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `SMTP_HOST` | SMTP szerver cím (opcionális, vásárlási emailekhez) |

## Licenc

Ez a projekt saját használatra készült, minden jog fenntartva.
