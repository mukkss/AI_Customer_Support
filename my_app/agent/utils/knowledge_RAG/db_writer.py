import psycopg2
from psycopg2 import sql
from psycopg2.extras import Json
import uuid
from my_app.agent.config import PGVECTOR_DB


def get_db_connection():
    try:
        return psycopg2.connect(PGVECTOR_DB)
    except Exception as e:
        print(f"[ERROR] Unable to connect to the database: {e}")
        raise



def ingest_writer(conn, schema, table, content, embedding, metadata):
    try:
        query = sql.SQL("""
            INSERT INTO {}.{} (id, content, embedding, metadata)
            VALUES (%s, %s, %s, %s)
        """).format(
            sql.Identifier(schema),
            sql.Identifier(table)
        )

        with conn.cursor() as cur:
            cur.execute(
                query,
                (
                    str(uuid.uuid4()),
                    content,
                    embedding,
                    Json(metadata)
                )
            )

        conn.commit()

    except Exception as e:
        print(f"[ERROR] Failed to insert data into {schema}.{table}: {e}")
        conn.rollback()
