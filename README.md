# Zorvyn Dashboard

Zorvyn is a full-stack financial dashboard system built to demonstrate scalable backend architecture, clean frontend design, and real-world role-based access control. It combines a **FastAPI (Python)** backend with a **React + Vite (TypeScript)** frontend to deliver a responsive, production-style application.

This project goes beyond a UI demo - it is a complete system handling authentication, authorization, financial data management, and analytics in a structured and maintainable way.

> **Assignment note:** This project was built prior to and independently of the assignment. It covers all core requirements - user/role management, financial records, dashboard summary APIs, access control, validation, and persistence - and has been documented below with that mapping in mind.

---

## 🗂️ How This Maps to the Assignment

| Requirement | Implementation |
|---|---|
| User & Role Management | JWT auth, bcrypt hashing, 3-tier RBAC (Viewer / Analyst / Admin) |
| Financial Records | Full CRUD with type, category, date, notes; soft delete; ownership checks |
| Dashboard Summary APIs | Income/expense totals, net balance, category breakdown, monthly trends |
| Access Control | Role guards on every endpoint; frontend route protection |
| Validation & Error Handling | Pydantic validation, structured error responses, appropriate HTTP status codes |
| Data Persistence | PostgreSQL via Supabase (production-ready relational DB) |
| Optional - Pagination & Search | Implemented on records listing |
| Optional - Soft Delete | Implemented |
| Optional - API Documentation | FastAPI auto-generates Swagger UI at `/docs` |

---

## 🚀 Core Features

### 🔐 Authentication & Security
- JWT-based authentication (access tokens)
- Secure password hashing with bcrypt
- Protected routes on both frontend and backend
- Role-based access enforcement at the API layer

### 👥 Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **Viewer** | CRUD on own records only |
| **Analyst** | Read-only access to all records + analytics |
| **Admin** | Full access - manage users, records, and advanced dashboard insights |

### 📊 Dashboard & Analytics
- Total income, total expenses, net balance
- Category-wise breakdown
- Monthly trends
- Admin-only metrics (total users, active users)

### 🗂️ Records Management
- Full CRUD (create, read, update, delete)
- Fields: amount, type (income/expense), category, date, notes
- Pagination, filtering by date/category/type, and search
- Soft delete with ownership validation

### ⚙️ User Management (Admin only)
- Change user roles
- Activate / deactivate users
- Edit user details

### 🎨 Frontend
- React + Vite + TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Dark UI with responsive layout

---

## 🧱 Project Structure

```
Zorvyn/
├── backend/
│   ├── app/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic layer
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── auth/         # JWT utilities and role guards
│   │   └── main.py       # App entry point
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── services/     # Axios API layer
    │   └── context/      # Auth context + route guards
    └── package.json
```

**Architecture:** Routes → Services → Models. Business logic lives in the service layer, keeping route handlers thin and models focused on data representation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | FastAPI, SQLAlchemy, PostgreSQL (Supabase), Pydantic, python-jose (JWT), bcrypt |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, Framer Motion, Axios |

---

## ⚙️ Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/zorvyn-dashboard.git
cd zorvyn-dashboard
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```
DATABASE_URL=your_supabase_postgres_url
JWT_SECRET_KEY=your_secret_key
```

Run the server:
```bash
uvicorn app.main:app --reload
```

API docs available at: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:
```
VITE_API_URL=http://localhost:8000
```

Run the dev server:
```bash
npm run dev
```

---

## 🔗 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive JWT token |

### Records
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/records` | Viewer+ | List records (with pagination, filters) |
| POST | `/records` | Viewer | Create a record |
| PUT | `/records/{id}` | Owner / Admin | Update a record |
| DELETE | `/records/{id}` | Owner / Admin | Soft delete a record |

### Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard/summary` | Analyst+ | Income, expenses, net balance |
| GET | `/dashboard/category` | Analyst+ | Category-wise totals |
| GET | `/dashboard/trends` | Analyst+ | Monthly/weekly trends |

### Users (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | List all users |
| PUT | `/users/{id}/role` | Update user role |
| PUT | `/users/{id}/status` | Activate / deactivate user |

---

## 🧠 Design Decisions & Assumptions

- **Clean architecture** — routes handle HTTP concerns only; all business logic is in the service layer; models are pure data definitions.
- **RBAC enforced at backend** — role checks are applied via dependency injection on each endpoint, not just on the frontend.
- **Soft delete** — records are marked inactive rather than permanently removed, preserving audit trails.
- **Centralized API client** — Axios instance with interceptors handles token injection and 401 redirects.
- **Assumption on Viewer role** — Viewers can create and manage their own records (personal finance use case), while Analysts have read-only access to all records for reporting purposes.
- **Supabase as managed PostgreSQL** — chosen for ease of setup without sacrificing relational data integrity.

---

## 🚀 Future Improvements

- WebSocket support for real-time balance updates
- Advanced analytics (forecasting, budget tracking)
- Email reset system
- Unit and integration tests

---

## 👨‍💻 Author

Built as a full-stack project demonstrating backend architecture, access control design, and frontend engineering.

---

## 📄 License

Educational / demonstration use.
