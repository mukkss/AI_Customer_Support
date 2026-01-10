from my_app.agent.utils.rag.preprocessor import load_and_split_markdown
from my_app.agent.utils.rag.embedder import embed_text
from my_app.agent.utils.rag.db_writer import get_db_connection, ingest_writer
from my_app.agent.utils.rag.ingest_config import INGEST_CONFIG




def ingestion_pipeline():
    conn = get_db_connection()

    for doc_type, cfg in INGEST_CONFIG.items():
        print(f"[INFO] Ingesting {doc_type}")

        chunks = load_and_split_markdown(
            folder_path=cfg["path"],
            doc_type=doc_type,
            chunk_size=cfg["chunk_size"],
            chunk_overlap=cfg["overlap"]
        )

        schema = cfg["schema"]
        table = cfg["table"]

        for doc in chunks:
            embedding = embed_text(doc.page_content)

            ingest_writer(
                conn=conn,
                schema=schema,
                table=table,
                content=doc.page_content,
                embedding=embedding,
                metadata=doc.metadata
            )

    conn.close()

def main():
    ingestion_pipeline()

if __name__ == "__main__":
    main()