import os 
from dotenv import load_dotenv

load_dotenv()

PGVECTOR_DB = os.getenv("PGVECTOR_DB")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")