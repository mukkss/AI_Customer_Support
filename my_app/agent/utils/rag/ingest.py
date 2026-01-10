import psycopg2
import uuid
from ...config import PGVECTOR_DB

def get_db_connection():
    try:
        conn = psycopg2.connect(PGVECTOR_DB)
        return
    except Exception as e:
        print(f"[ERROR] Unable to connect to the database: {e}")
        raise




