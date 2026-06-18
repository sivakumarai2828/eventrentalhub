# EventRentHub

A production-ready **event rental marketplace** MVP. Owners list decoration items
(backdrops, furniture, drapes, lighting, floral) and customers browse, estimate
costs, and send rental requests. **No online payments** — customers pay owners
directly at pickup.

| Layer    | Stack                                                              |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 19 · Vite · TypeScript · Tailwind · React Router · React Query |
| Backend  | FastAPI · SQLAlchemy 2 · Pydantic v2                               |
| Database | Supabase PostgreSQL                                                |
| Auth     | Supabase Auth (email/password), verified server-side via JWT      |
| Storage  | Supabase Storage (item images)                                    |
| Deploy   | Frontend → Vercel · Backend → Render                              |

---

## Project structure

```
Rental_App/
├── backend/                      # FastAPI service
│   ├── app/
│   │   ├── main.py               # app + CORS + startup seed
│   │   ├── config.py             # env settings (pydantic-settings)
│   │   ├── database.py           # engine/session
│   │   ├── db_types.py           # portable UUID type
│   │   ├── models.py             # users, categories, items, images,
│   │   │                         #   availability, booking_requests, booking_items
│   │   ├── schemas.py            # Pydantic request/response models
│   │   ├── auth.py               # Supabase JWT verification + RBAC deps
│   │   ├── services.py           # availability + pricing logic
│   │   ├── email_service.py      # SMTP notifications (off by default)
│   │   ├── storage.py            # Supabase Storage helpers
│   │   ├── seed.py               # seed starter categories
│   │   └── routers/              # users, categories, items, images,
│   │                             #   availability, bookings, admin
│   ├── migrations/               # 0001_init / 0002_seed / 0003_storage_and_rls
│   ├── requirements.txt
│   ├── render.yaml               # Render blueprint
│   └── .env.example
├── frontend/                     # React + Vite + TS
│   ├── src/
│   │   ├── pages/                # Home, Browse, ItemDetail, Cart, Login,
│   │   │                         #   Register, Profile, MyBookings, owner/*, admin/*
│   │   ├── components/           # ItemCard, ImageGallery, ImageUploader,
│   │   │                         #   BookingCard, layout/*, ui/*
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── lib/                  # supabase, api, services, storage, format
│   │   └── types/
│   ├── package.json
│   ├── vite.config.ts            # proxies /api -> http://localhost:8000
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── .env.example
└── README.md
```

---

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the migrations in order:
   - `backend/migrations/0001_init.sql`
   - `backend/migrations/0002_seed_categories.sql`
   - `backend/migrations/0003_storage_and_rls.sql`
   This creates all tables, seeds the five categories, creates the public
   `item-images` storage bucket, and installs a trigger that mirrors every new
   `auth.users` row into `public.users`.
3. **Authentication → Providers → Email**: enable Email. For the smoothest local
   testing, turn **off** "Confirm email" so sign-up returns a session immediately.
4. Collect these values (**Project Settings → API**):
   - Project URL
   - `anon` public key
   - `service_role` key
   - **JWT Secret** (Project Settings → API → JWT Settings)

### Creating an admin

Sign up a user through the app, then in the SQL editor:

```sql
update public.users set role = 'admin' where email = 'you@example.com';
```

---

## 2. Backend (FastAPI)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env        # then fill in values (see below)
uvicorn app.main:app --reload # http://localhost:8000  (docs at /docs)
```

`.env` keys:

```
DATABASE_URL=postgresql+psycopg://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_JWT_SECRET=...          # required — used to verify access tokens
CORS_ORIGINS=http://localhost:5173
EMAILS_ENABLED=false
```

> **No Supabase yet?** Leave `DATABASE_URL=sqlite:///./eventrenthub.db`. The app
> creates tables and seeds categories automatically. You still need
> `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_JWT_SECRET` for auth to work.

---

## 3. Frontend (React)

```powershell
cd frontend
npm install
copy .env.example .env         # fill VITE_SUPABASE_* values
npm run dev                    # http://localhost:5173
```

`.env` keys:

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=...
VITE_SUPABASE_STORAGE_BUCKET=item-images
VITE_API_BASE_URL=             # blank in dev (Vite proxies /api)
```

The dev server proxies `/api` to the backend, so just open
http://localhost:5173.

---

## Roles & flows

- **Customer** — browse, search, check availability, build a rental cart, submit a
  booking request, track status.
- **Owner** — create/edit/delete listings, upload up to 20 images (drag & drop,
  set primary), manage inventory, approve/reject/complete requests.
- **Admin** — manage categories (with cover images), users (roles), and moderate
  listings.

Pick **Customer** or **Owner** at sign-up; switch anytime on the Profile page.

### Availability logic

Each item has a `quantity_available`. When a request is submitted, the API sums
the quantities reserved by overlapping `PENDING`/`APPROVED` bookings and blocks
overbooking. The item page shows remaining units for a chosen date range, and the
next estimated free date when fully booked.

---

## API overview

| Method | Path                                   | Role     |
| ------ | -------------------------------------- | -------- |
| GET    | `/api/health`                          | public   |
| GET    | `/api/me` · PUT `/api/me`              | auth     |
| GET    | `/api/categories`                      | public   |
| POST/PATCH/DELETE `/api/categories...` | admin    |          |
| GET    | `/api/items` (filters, search, paging) | public   |
| GET    | `/api/items/{id}`                      | public   |
| GET    | `/api/items/{id}/availability`         | public   |
| POST/PATCH/DELETE `/api/items...`      | owner    |          |
| POST/DELETE `/api/items/{id}/images...`| owner    |          |
| POST   | `/api/bookings`                        | customer |
| GET    | `/api/bookings?role=customer\|owner`   | auth     |
| PATCH  | `/api/bookings/{id}/status`            | owner    |
| GET/PATCH `/api/admin/...`             | admin    |          |

Interactive docs: http://localhost:8000/docs

---

## Deployment

### Backend → Render

The repo includes `backend/render.yaml`. In Render: **New → Blueprint**, point it
at this repo, and set the secret env vars (`DATABASE_URL`, `SUPABASE_*`,
`SUPABASE_JWT_SECRET`, `CORS_ORIGINS=https://your-app.vercel.app`). Render runs:

```
buildCommand: pip install -r requirements.txt
startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend → Vercel

Import the repo, set **Root Directory** to `frontend`. Vercel auto-detects Vite
(`npm run build` → `dist`). Add env vars `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_STORAGE_BUCKET`, and
`VITE_API_BASE_URL=https://your-api.onrender.com`. `vercel.json` rewrites all
routes to `/` for client-side routing.

After deploy, add the Vercel URL to the backend's `CORS_ORIGINS`.

---

## Notes & MVP scope

- Email notifications are logged to the console unless `EMAILS_ENABLED=true` and
  SMTP is configured.
- A cart spanning multiple owners is split into one booking request per owner.
- Authorization is enforced in the FastAPI layer (service-role DB access); see
  `migrations/0003_storage_and_rls.sql` if you prefer browser-direct PostgREST
  with table RLS.
```
