# Deployment Guide — Render (PostgreSQL)

This project is a **Django backend + React (Vite) frontend**. These steps deploy
the Django backend with a managed PostgreSQL database on Render, and — if you
want — the React frontend as a Render Static Site.

---

## What was already prepared

| File | Purpose |
|---|---|
| `Procfile` | Starts Django with **gunicorn** |
| `runtime.txt` | Pins **Python 3.11.9** |
| `render.yaml` | Render Blueprint (web service + Postgres) |
| `requirements.txt` | Added `dj-database-url`, `gunicorn` |
| `settings.py` | Uses **Postgres when `DATABASE_URL` is set**, SQLite otherwise |
| `data.json` | **Full dump of your current SQLite data** (users, packages, payments, etc.) |

---

## Option A — Deploy via `render.yaml` (Blueprints) + keep local SQLite

1. Create a **new repository** (or push the existing one) containing all files,
   **including** `data.json` and `render.yaml`. Make sure the DB and media are
   still git-ignored — they are (see `.gitignore`).

2. In the **Render dashboard → New → Blueprint**, choose the GitHub repo.
   Render reads `render.yaml`, creates the **Postgres database** and the
   **Django web service** automatically, and injects `DATABASE_URL`.

3. Render will run the **Build Command**:
   ```
   pip install -r requirements.txt
   python manage.py collectstatic --noinput
   ```
   then **migrate + load your data** (run once — see below).

---

## Migrate your existing data (choose this to keep users/payments)

After the web service is created and its Postgres is ready, run these once
against the live database. Render exposes the Postgres connection string as
`DATABASE_URL` on the web service.

**Via the Render web service shell** (most reliable):

```bash
# 1. Create all tables from migrations
python manage.py migrate

# 2. Load the data you dumped from SQLite
python manage.py loaddata data.json
```

That's it — your **13 users (with passwords), 3 trainers, packages, categories,
596 payments (~$1M revenue), equipment and exercises** are now in PostgreSQL.

> Note: `data.json` excludes permissions/contenttypes/sessions (excluded in the
> dump). The dump used `--natural-foreign`, so FK relations load cleanly.

---

## Option B — Deploy backend manually (web service)

1. **New → Web Service → pick the GitHub repo**.
2. Set:
   - **Runtime:** Python
   - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command:** `gunicorn fitness_first_gym.wsgi --log-file -`
3. **Add a Postgres database:** New → PostgreSQL (uses `DATABASE_URL` env var
   automatically on the linked service).
4. Add env vars: `SECRET_KEY`, `DEBUG=false`,
   `ALLOWED_HOSTS=.onrender.com,localhost`, `CORS_ALLOW_ALL_ORIGINS=true`.
5. After first deploy, run `migrate` + `loaddata data.json` (as above).

---

## Deploy the React frontend (optional)

Render can also serve the built frontend as a **Static Site**:

1. **New → Static Site → pick the repo**, set **Root Directory** to `FEG`.
2. **Build Command:** `npm install && npm run build`
3. **Publish Directory:** `dist`
4. Add env var **`VITE_API_URL`** = your backend URL, e.g.
   `https://<your-backend-name>.onrender.com`

**Important — point the frontend at the live API.** The frontend currently calls
`/api` and `/media` on `localhost:8000` in development. For production it must
read `VITE_API_URL`. (If you want, I can update the frontend's API base URL to
use `import.meta.env.VITE_API_URL` with the localhost fallback.)

---

## Environment variables (backend)

| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | *(auto from Render Postgres)* | Empty locally → SQLite |
| `SECRET_KEY` | *(long random)* | Render: generate |
| `DEBUG` | `false` | Never true in prod |
| `ALLOWED_HOSTS` | `.onrender.com,localhost` | |
| `CORS_ALLOW_ALL_ORIGINS` | `true` | For the separate frontend origin |
| `PYTHON_VERSION` | `3.11.9` | Matches `runtime.txt` |

---

## If you change the schema later

Run `python manage.py makemigrations` locally, commit, and Render runs
`migrate` (add it to the build/start command or run it in the shell after
deploy).
