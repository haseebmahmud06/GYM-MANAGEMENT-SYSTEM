# 🏋️ Fitness First Gym — Gym Management System

A full-stack Gym Management System: **Django REST API** backend + **React
(TypeScript)** frontend. Manage members, packages, trainers, bookings,
payments, attendance, workouts, and more — with a Vercel-inspired light/dark UI.

## ✨ Live Deployment (free stack)

| Component | URL |
|---|---|
| 🌐 **Frontend** | https://gym-management-system-iota-five.vercel.app |
| 🔌 **Backend API** | https://fitness-first-gym-backend.onrender.com |
| 🗄️ **Database** | Supabase (free Postgres) |

**Admin login:** `mahmudabdulhaseeb2006@gmail.com` / `Adminhaseeb123!`

## 🧰 Stack
- **Backend:** Django 5 · DRF · SimpleJWT · PostgreSQL (Supabase) · gunicorn · WhiteNoise · Pillow
- **Frontend:** React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · TanStack Query · Zustand · Recharts
- **Hosting:** Render (backend) · Supabase (DB) · Vercel (frontend) — all free

## 📦 Features
- **Guest:** browse gym/trainers/equipment/packages; contact inquiry
- **Member:** register, login, bookings, payments, profile, change password,
  workout & fitness tracking
- **Admin:** dashboard, manage categories/package-types/packages/bookings/
  payments, CSV reports, analytics

## 📁 Docs
- `PROJECT_REPORT.md` — full formal project report
- `DEPLOYMENT.md` — deployment guide
- `PYTHONANYWHERE.md` — (legacy) PythonAnywhere guide

## 🚀 Local Dev
```bash
# Backend
python -m venv .venv && .venv\Scripts\activate   # (win)
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate && python manage.py runserver 8000

# Frontend
cd FEG && npm install && npm run dev   # http://localhost:3000
```
