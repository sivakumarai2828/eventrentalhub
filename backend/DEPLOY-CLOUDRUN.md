# Deploy the backend to Google Cloud Run

The FastAPI backend ships with a `Dockerfile`, so Cloud Run can build and host
it with one command. Easiest path: **Google Cloud Shell** (already signed in as
you — no local `gcloud`/Docker needed).

## 1. Open Cloud Shell
In the Google Cloud Console (project **rentalapp-499703**), click the terminal
icon (top-right) to open Cloud Shell.

## 2. Clone the repo and deploy
```bash
git clone https://github.com/sivakumarai2828/eventrentalhub.git
cd eventrentalhub/backend

gcloud config set project rentalapp-499703
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

gcloud run deploy eventrenthub-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```
After ~2–3 minutes it prints:
```
Service URL: https://eventrenthub-api-XXXXXXXXXX-uc.a.run.app
```
**That URL is your backend.** Use it as `VITE_API_BASE_URL` in Vercel.

## 3. Set environment variables
The deployed app needs Supabase Postgres + auth config. Run (replace the
placeholders — keep the `^|^` so commas inside values don't break parsing):
```bash
gcloud run services update eventrenthub-api --region us-central1 \
  --set-env-vars "^|^DATABASE_URL=postgresql+psycopg://postgres.lpruaqxecqoewzeuhcdc:YOUR_DB_PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres|SUPABASE_URL=https://lpruaqxecqoewzeuhcdc.supabase.co|SUPABASE_ANON_KEY=YOUR_ANON_KEY|CORS_ORIGINS=https://YOUR-APP.vercel.app"
```
- **DATABASE_URL** — Supabase → Settings → Database → Connection string → URI
  (use the **Transaction pooler**, port 6543). Change the prefix to
  `postgresql+psycopg://`. Required — Cloud Run is stateless, so SQLite won't
  persist.
- **SUPABASE_ANON_KEY** — the legacy anon key from `backend/.env`.
- **CORS_ORIGINS** — your Vercel URL (set this after the frontend is deployed).

> Tip: you can also set these in the Console → Cloud Run → eventrenthub-api →
> Edit & Deploy New Revision → Variables & Secrets.

## 4. Verify
```bash
curl https://eventrenthub-api-XXXXXXXXXX-uc.a.run.app/api/health
# {"status":"ok","service":"eventrenthub"}
```

## Order of operations (avoids the CORS chicken-and-egg)
1. Deploy backend → copy the Cloud Run URL.
2. Deploy frontend to Vercel with `VITE_API_BASE_URL = <Cloud Run URL>`.
3. Copy the Vercel URL → update `CORS_ORIGINS` on Cloud Run (step 3) to it.
