# Rep Legend — Agency Handoff

## File Map

| File | What it is |
|------|-----------|
| `index.html` | Main PWA workout app (single file, ~3500 lines) |
| `landing.html` | Marketing landing page with 3-tier pricing |
| `auth.html` | Sign in / Sign up / Google OAuth page |
| `checkout.html` | Stripe checkout with plan + billing toggle |
| `manifest.json` | PWA manifest (icons, theme color, display mode) |
| `sw.js` | Service worker — offline caching |
| `icons/` | PWA icons: 192×192 and 512×512 |

## User Flow

```
landing.html
  ↓ "Start for Free"
auth.html?mode=signup
  ↓ on success → localStorage rl_user set
index.html (the app)

landing.html
  ↓ "Get Pro / Elite"
auth.html?mode=signup&next=checkout.html?plan=pro
  ↓ on success
checkout.html?plan=pro
  ↓ on payment
index.html (PRO unlocked, localStorage hevy_pro=true)
```

## Before Going Live — Required Config

### 1. Firebase (auth.html)
Replace the `FIREBASE_CONFIG` block at the top of `auth.html`:
```js
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
};
```
Get this from: **Firebase Console → Project Settings → Your Apps → Web**

Also enable in Firebase Console → Authentication → Sign-in providers:
- ✅ Email/Password
- ✅ Google

### 2. Stripe (checkout.html)
Replace two values at the top of `checkout.html`:
```js
const STRIPE_KEY = 'pk_live_YOUR_PUBLISHABLE_KEY';

const PRICE_IDS = {
  pro:   { monthly: 'price_xxx', annual: 'price_xxx' },
  elite: { monthly: 'price_xxx', annual: 'price_xxx' },
};
```
Create the 4 Price objects in **Stripe Dashboard → Products**.

Also wire the backend endpoint `POST /api/create-subscription` — returns a
`clientSecret` for Stripe subscription confirmation. Stripe's Node.js quickstart
covers this in ~30 lines.

### 3. Hosting
All files are static — deploy the entire folder to any host:
- **Netlify**: Drag & drop the folder at app.netlify.com/drop
- **Vercel**: `vercel --prod` from this folder
- **Firebase Hosting**: `firebase deploy`

The PWA service worker requires HTTPS (any of the above provide it).

## Pricing Reference

| Plan | Monthly | Annual | Stripe Price ID |
|------|---------|--------|-----------------|
| Free | $0 | $0 | — |
| Pro | $4.99/mo | $3.99/mo ($47.88/yr) | Set in checkout.html |
| Elite | $9.99/mo | $7.99/mo ($95.88/yr) | Set in checkout.html |

## Design Tokens

| Token | Value | Used for |
|-------|-------|---------|
| `--accent` | `#FF6B35` | Primary orange |
| `--bg` | `#000000` | Page background |
| `--bg3` | `#111111` | Cards |
| `--text` | `#FFFFFF` | Body text |
| Font | `-apple-system, SF Pro Display` | All UI |

## Notes for Dev
- The app stores all workout data in `localStorage` (key prefix: `hevy_*`)
- Pro status flag: `localStorage.hevy_pro = "true"`
- Logged-in user: `localStorage.rl_user` (JSON: uid, name, email, photo)
- Auto-Rep uses `DeviceMotionEvent` — requires HTTPS + user permission prompt
- Dark/light mode: `localStorage.hevy_dark` (`"true"` / `"false"`)
