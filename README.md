# Zorvyn Dashboard

Zorvyn is a modern, high-performance financial technology admin dashboard designed with a sophisticated dark-mode UI. It features a scalable dual-architecture utilizing a **FastAPI (Python)** backend and a **React/Vite (TypeScript)** frontend. 

## Features
- **Role-Based Access Control (RBAC):** Distinct roles (`Admin`, `Analyst`, `Viewer`) limit user permissions and access conditionally across actions and UI scopes.
- **User Management System:** Admins can adjust profiles, manipulate roles dynamically, and enforce remote password resets through interactive, dynamically-positioned modal interfaces.
- **Records Repository:** Supports real-time CRUD operations over relational datasets.
- **KPI Dashboards:** Aggregates macro stats using optimized data queries to deliver robust top-level overviews on total users, active accounts, and activity flow.
- **Smooth Animations:** Integrated with `Framer Motion` extensively bridging layout pops and table flow updates interactively.

## Repository Structure

The project represents a strict monorepo segmented heavily by execution boundary:
- `/frontend`: The Vite/React application utilizing Tailwind CSS and Framer Motion contextually.
- `/backend`: The FastAPI application utilizing SQLAlchemy, Pydantic, and strictly-typed Py-Route bindings.

## Deployment Roadmap
Target environments for production topology:
1. **Frontend Deployment:** Vercel (via `/frontend` directory mappings).
2. **Backend Deployment:** Render (via `/backend` directory bindings connecting a managed PostgreSQL database).

Please observe the `README.md` inside both `/frontend` and `/backend` recursively for specific deployment workflows and startup conditions.
