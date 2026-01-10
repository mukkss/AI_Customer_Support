from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]  


INGEST_CONFIG = {
    "policy": {
        "schema": "public",
        "table": "policy_table",
        "path": str(BASE_DIR / "data" / "Policies"),
        "chunk_size": 1000,
        "overlap": 200
    },
    "faq": {
        "schema": "public",
        "table": "faq_table",
        "path": str(BASE_DIR / "data" / "FAQ"),
        "chunk_size": 1000,
        "overlap": 200
    },
    "guide": {
        "schema": "public",
        "table": "guide_table",
        "path": str(BASE_DIR / "data" / "Guides"),
        "chunk_size": 1000,
        "overlap": 200
    }
}