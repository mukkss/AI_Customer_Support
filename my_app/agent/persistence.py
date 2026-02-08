import psycopg
from langgraph.checkpoint.postgres import PostgresSaver
from my_app.agent.config import PGVECTOR_DB

conn = psycopg.connect(PGVECTOR_DB, autocommit=True)

checkpointer = PostgresSaver(conn)

checkpointer.setup()

