# Cashora

Your everyday cash, made visible.

Cashora is an iPhone-first Progressive Web App for students and young adults who track **physical cash** (baon / allowances). It is not a wallet or bank app.

## Features (MVP)

- Starting cash per day
- Add expense / add savings
- **Safe to Spend** = Starting ΓêÆ Spent ΓêÆ Saved
- Cash Timeline
- Today's progress
- History, Goals, light Insights
- In-app Daily Cash Check (no iOS web push)
- Local-first storage (data stays on device)

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- `localStorage` persistence
- PWA manifest + Add to Home Screen (Safari)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Landing + iPhone install tips: `/`
- App: `/app` (onboarding on first visit)

## Deploy free (Vercel)

Cashora is **local-first** (no Supabase / no env secrets required).

### Option A ΓÇö GitHub + Vercel Dashboard (recommended)

1. Initialize git and push to GitHub (ask the agent to commit/push if you want help):
   ```bash
   git init
   git add .
   git commit -m "Initial Cashora PWA"
   gh repo create cashora --private --source=. --remote=origin --push
   ```
2. Open [vercel.com/new](https://vercel.com/new) ΓåÆ import the `cashora` repo.
3. Framework Preset: **Next.js**. Leave Environment Variables empty.
4. Click **Deploy**.
5. Copy your live URL: `https://<project>.vercel.app`

### Option B ΓÇö Vercel CLI (from this folder)

```bash
npx vercel login
npx vercel
npx vercel --prod
```

Follow prompts (link to your Vercel account / team). Production URL prints at the end.

### After deploy

1. Open the URL on iPhone **Safari**
2. Share ΓåÆ **Add to Home Screen**
3. Optional: QR code for the same URL

### QR for testers

1. Deploy to Vercel
2. Generate a QR for `https://your-app.vercel.app`
3. Friends scan ΓåÆ Safari ΓåÆ **Share ΓåÆ Add to Home Screen**

## Install on iPhone

1. Open the site in **Safari**
2. Tap **Share**
3. Tap **Add to Home Screen**
4. Tap **Add**

Works best in Safari.

## Brand colors

| Token | Hex |
|-------|-----|
| Deep Blue | `#294C60` |
| Soft Blue | `#8FAFC0` |
| Warm Brown | `#8B6248` |
| Cream | `#F6F0E6` |
| Off White | `#FFFDF8` |

Copy lives in `src/lib/content.ts`. Data types in `src/lib/types.ts`.

## Privacy

MVP stores all data in the browser on the device. No account, no server database.
