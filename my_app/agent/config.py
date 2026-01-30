import os 
from dotenv import load_dotenv

load_dotenv()

PGVECTOR_DB = os.getenv("PGVECTOR_DB")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
GAURDRAILS_AI_API_KEY = os.getenv("GAURDRAILS_AI_API_KEY")