# import os
# from dotenv import load_dotenv
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session

# from app.database import engine, Base, SessionLocal
# from app.models import user, invite          # import models so Base sees them
# from app.models.user import User, UserRole
# from app.routes import auth
# from app.core.security import hash_password

# load_dotenv()

# # ─────────────────────────────────────────
# # APP INSTANCE
# # ─────────────────────────────────────────

# app = FastAPI(
#     title="Builder Site Management API",
#     description="Invite-only construction site management backend.",
#     version="1.0.0",
# )


# # ─────────────────────────────────────────
# # CORS — allow frontend to talk to backend
# # ─────────────────────────────────────────

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",   # Vite dev server default port
#         "http://localhost:3000",   # fallback
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],           # GET, POST, PUT, DELETE etc.
#     allow_headers=["*"],           # Authorization header must be allowed
# )


# # ─────────────────────────────────────────
# # ROUTERS
# # ─────────────────────────────────────────

# app.include_router(auth.router)

# # Phase 2 routers go here:
# # app.include_router(users.router)
# # app.include_router(projects.router)


# # ─────────────────────────────────────────
# # DATABASE SETUP + ADMIN SEED
# # ─────────────────────────────────────────

# def seed_admin(db: Session):
#     """
#     Creates the admin account on first run if it doesn't exist.
#     Reads credentials from .env — never hardcoded.
#     This is the only account that bypasses the invite system.
#     """
#     admin_phone = os.getenv("ADMIN_PHONE")
#     admin_email = os.getenv("ADMIN_EMAIL")
#     admin_password = os.getenv("ADMIN_PASSWORD")

#     # Only seed if no admin exists yet
#     existing = db.query(User).filter(User.role == UserRole.admin).first()
#     if existing:
#         print("✓ Admin account already exists — skipping seed.")
#         return

#     admin = User(
#         full_name       = "Admin",
#         phone           = admin_phone,
#         email           = admin_email,
#         hashed_password = hash_password(admin_password),
#         role            = UserRole.admin,
#     )
#     db.add(admin)
#     db.commit()
#     print(f"✓ Admin account seeded → phone: {admin_phone}")


# @app.on_event("startup")
# def on_startup():
#     """
#     Runs automatically every time the server starts.
#     1. Creates all tables in PostgreSQL (safe — skips existing tables)
#     2. Seeds the admin account if not already present
#     """
#     print("Starting up...")

#     # Scans all models that inherit from Base and creates their tables
#     # If the table already exists, it leaves it untouched
#     Base.metadata.create_all(bind=engine)
#     print("✓ Database tables ready.")

#     # Seed admin using a fresh DB session
#     db = SessionLocal()
#     try:
#         seed_admin(db)
#     finally:
#         db.close()

#     print("✓ Server ready.")


# # ─────────────────────────────────────────
# # HEALTH CHECK
# # ─────────────────────────────────────────

# @app.get("/health", tags=["Health"])
# def health_check():
#     """
#     Simple endpoint to confirm the server is alive.
#     Hit this first after starting the server.
#     """
#     return {"status": "ok", "message": "Builder API is running."}

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import engine, Base, SessionLocal
from app.models import user, invite          # Phase 1 models
from app.models import attendance, project   # Phase 2 models
from app.models.user import User, UserRole
from app.routes import auth
from app.routes import admin, attendance as attendance_routes, projects
from app.core.security import hash_password

load_dotenv()

# ─────────────────────────────────────────
# APP INSTANCE
# ─────────────────────────────────────────

app = FastAPI(
    title="Builder Site Management API",
    description="Invite-only construction site management backend.",
    version="2.0.0",
)


# ─────────────────────────────────────────
# CORS
# ─────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────
# ROUTERS
# ─────────────────────────────────────────

app.include_router(auth.router)               # /auth/*
app.include_router(admin.router)              # /admin/*
app.include_router(attendance_routes.router)  # /attendance/*
app.include_router(projects.router)           # /projects/*


# ─────────────────────────────────────────
# STARTUP — tables + admin seed
# ─────────────────────────────────────────

def seed_admin(db: Session):
    admin_phone    = os.getenv("ADMIN_PHONE")
    admin_email    = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    existing = db.query(User).filter(User.role == UserRole.admin).first()
    if existing:
        print("✓ Admin account already exists — skipping seed.")
        return

    admin_user = User(
        full_name       = "Admin",
        phone           = admin_phone,
        email           = admin_email,
        hashed_password = hash_password(admin_password),
        role            = UserRole.admin,
        is_active       = True,
    )
    db.add(admin_user)
    db.commit()
    print(f"✓ Admin account seeded → phone: {admin_phone}")


@app.on_event("startup")
def on_startup():
    print("Starting up...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables ready.")

    db = SessionLocal()
    try:
        seed_admin(db)
    finally:
        db.close()

    print("✓ Server ready.")


# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Builder API v2 is running."}