# LeetCode Tracker (PWA)

Lightweight, installable Progressive Web App to log LeetCode solves, view a calendar heatmap, track streaks, repeats, and daily progress. Built with **React + Vite + Tailwind CSS + Lucide icons + Firebase (Auth + Firestore)**.

## Features

- **Manual entry form** — title, LeetCode URL (slug auto-parsed), difficulty, date picker (defaults to today), notes.
- **URL parser** (`src/lib/leetcode.js`) — extracts `slug` from any `leetcode.com/problems/<slug>/...` URL, normalizes it.
- **Calendar heatmap** — month view, tap a day to filter history; intensity scales with solves.
- **Dashboard** — Done Today (count + titles), Total Solved (unique), Repeated (2+ attempts with ×count), Current Streak (consecutive active days).
- **Repeated section** — click a repeated question to see all its attempts.
- **Search + filters** — by title/slug/notes, date, or question.
- **PWA** — manifest + service worker (via `vite-plugin-pwa`), installable on desktop/mobile, offline app-shell caching.

> Requires Firebase — data lives in Cloud Firestore per user. No local/demo storage.

## Quick start

```bash
npm install
npm run dev      # local dev
npm run build    # production build (also generates service worker)
npm run preview  # preview the production build
```

## Connect Firebase (`firebase-config.js`)

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project** (any name; Analytics optional).
2. **Build → Authentication → Sign-in method** → enable:
   - **Google**, and
   - **Email/Password**.
   - Under **Settings → Authorized domains**, add your deploy domain (e.g. `your-app.vercel.app`) plus `localhost`.
3. **Build → Firestore Database → Create database** → start in **production mode**, pick a region.
4. **Project Settings (⚙) → Your apps → Web (`</>`)** → register app → copy the `firebaseConfig` object.
5. Open `src/firebase-config.js` and paste your values:

```js
const firebaseConfig = {
  apiKey: 'AIza…',
  authDomain: 'my-project.firebaseapp.com',
  projectId: 'my-project',
  storageBucket: 'my-project.appspot.com',
  messagingSenderId: '123…',
  appId: '1:123…:web:abc…'
}
```

6. **Firestore → Rules** — private per-user data (recommended, works with the app's `users/{uid}/entries` layout):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid}/entries/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

7. `npm run dev` → sign in with Google or Email/Password. Entries are stored at `users/{uid}/entries/{autoId}`:

```json
{
  "title": "Two Sum",
  "slug": "two-sum",
  "url": "https://leetcode.com/problems/two-sum/",
  "difficulty": "Easy | Medium | Hard",
  "date": "2026-09-16",
  "notes": "...",
  "timeSpent": "45",
  "acceptanceRate": 54.2,
  "createdAt": "2026-09-16T…"
}
```

Data persists indefinitely in Firestore — safe for multi-year tracking.

## Auto-fill from URL (LeetCode GraphQL)

Pasting a URL extracts the slug locally. The **“Auto-fill title, difficulty & ID”** button (`src/lib/leetcodeApi.js`) then queries LeetCode's public GraphQL endpoint with that slug:

```graphql
query questionData($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    questionFrontendId   # ← the problem number
    title
    difficulty           # Easy | Medium | Hard
    topicTags { name }
  }
}
```

It fills title (only if empty), difficulty, problem #, and shows topic tags. Two things to know:

1. **Instant offline fallback** — “Use … as title” prettifies the slug (`two-sum` → `Two Sum`) with zero network.
2. **Browsers may block the direct call** (LeetCode sends no CORS headers, and it rate-limits datacenter IPs). `fetchQuestionInfo()` tries a **three-tier fallback chain** before giving up:
   - direct `POST` to LeetCode GraphQL,
   - two public CORS mirrors (`api.allorigins.win`, `corsproxy.io`),
   - a public REST mirror (`alfa-leetcode-api.onrender.com`).
   If all tiers fail, you'll see a friendly message and can still use the suggested title. For guaranteed auto-fill, point the app at a same-origin proxy:

```bash
# .env — picked up automatically, no code change needed
VITE_LC_GRAPHQL_URL=https://your-proxy.example.com/graphql
```

Dev-only proxy example (`vite.config.js` → `server.proxy`):

```js
server: {
  proxy: {
    '/lc-api': { target: 'https://leetcode.com', changeOrigin: true, rewrite: (p) => p.replace(/^\/lc-api/, '') }
  }
}
// then: VITE_LC_GRAPHQL_URL=/lc-api/graphql
```

For production, any tiny function that forwards the POST body to `https://leetcode.com/graphql` works (Firebase Cloud Function, Vercel/Netlify function).

## Project structure

```
├── index.html
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.png
│   └── pwa-512x512.png
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── firebase-config.js      # ← paste Firebase web config here
│   ├── lib/
│   │   ├── leetcode.js         # URL parser, entryKey, date helpers
│   │   └── stats.js            # groupByDate, groupByQuestion, calcStreak
│   ├── hooks/
│   │   ├── useAuth.js          # Firebase Auth
│   │   └── useEntries.js       # Firestore subscription + mutations
│   └── components/
│       ├── AuthScreen.jsx
│       ├── EntryForm.jsx
│       ├── StatsBar.jsx
│       ├── CalendarView.jsx
│       ├── EntryList.jsx
│       └── RepeatedSection.jsx
└── vite.config.js              # PWA manifest + workbox config
```

## Deploy

Any static host works (`dist/` after `npm run build`): Vercel, Netlify, Firebase Hosting, GitHub Pages. Remember to add the production domain to Firebase Auth authorized domains.

## Notes

- Streak counts consecutive local days with ≥1 solve, ending today (or yesterday if today is empty).
- "Total Solved" counts unique questions (dedupe by slug → title → URL).
- Repeats = questions with attempt count ≥ 2.
