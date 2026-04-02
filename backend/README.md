# Zorvyn Backend API

This directory contains the FastAPI-driven REST service powering the Zorvyn platform. It is highly structured using SQLAlchemy for remote object mapping (via `psycopg2`), JWT securely injected for session validation, and strict Pydantic schemas validating all data ingress.

## Requirements
- Python 3.10+
- PostgreSQL Server 

## Local Development
1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Establish your `.env` configuration mapping the database.
4. Launch the Uvicorn Dev Server:
   ```bash
   uvicorn main:app --reload
   ```


