from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]  


INGEST_CONFIG = {
    "policy": {
        "schema": "knowledge",
        "table": "items",
        "path": str(BASE_DIR / "data" / "Policies"),
        "chunk_size": 1000,
        "overlap": 200
    },
    "faq": {
        "schema": "knowledge",
        "table": "items",
        "path": str(BASE_DIR / "data" / "FAQ"),
        "chunk_size": 1000,
        "overlap": 200
    },
    "guide": {
        "schema": "knowledge",
        "table": "items",
        "path": str(BASE_DIR / "data" / "Guides"),
        "chunk_size": 1000,
        "overlap": 200
    }
}

RETRIEVAL_TABLES = {
    "policy": {
        "schema": "knowledge",
        "table": "items",
    },
    "faq": {
        "schema": "knowledge",
        "table": "items",
    },
    "guide": {
        "schema": "knowledge",
        "table": "items",
    },
}
