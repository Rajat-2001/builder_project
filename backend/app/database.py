import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load variables from .env file into Python environment
load_dotenv()

# Grab the database connection string from .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Create the SQLAlchemy engine — this is the actual connection to PostgreSQL
engine = create_engine(DATABASE_URL)

# SessionLocal is a factory — every time you call SessionLocal()
# you get a fresh database session (like a temporary workspace)
SessionLocal = sessionmaker(
    autocommit=False,  # we control when changes are saved
    autoflush=False,   # we control when queries are synced
    bind=engine        # tied to our PostgreSQL engine
)

# Base is the parent class all your models will inherit from
# When you write class User(Base), SQLAlchemy knows to treat
# User as a database table definition
Base = declarative_base()


# --- Dependency for FastAPI routes ---
# This function is injected into every route that needs DB access
# It opens a session, hands it to the route, then closes it cleanly
# whether the route succeeds or throws an error
def get_db():
    db = SessionLocal()
    try:
        yield db        # route runs here with the db session
    finally:
        db.close()      # always closes, even if route crashed