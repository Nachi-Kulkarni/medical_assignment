from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings
import os

# Get the absolute path for the database
db_path = settings.database_url.replace("sqlite:///", "")
if db_path.startswith("./"):
    db_path = os.path.abspath(db_path)

# Ensure data directory exists
data_dir = os.path.dirname(db_path)
if data_dir and not os.path.exists(data_dir):
    os.makedirs(data_dir, exist_ok=True)

# Use absolute path for SQLite
db_url = f"sqlite:///{db_path}"

engine = create_engine(
    db_url,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    # Import models to register them with Base
    from models.conversation import Conversation
    from models.message import Message

    Base.metadata.create_all(bind=engine)
