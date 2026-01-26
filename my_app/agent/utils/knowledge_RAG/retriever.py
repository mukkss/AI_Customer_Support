from psycopg2 import sql
from my_app.agent.utils.knowledge_RAG.db_writer import get_db_connection
from my_app.agent.utils.knowledge_RAG.embedder import embed_text

ALLOWED_METADATA_KEYS = {"doc_type", "section", "source_file"}

def sanitize_filters(filters: dict | None):
    if not filters:
        return None

    clean = {
        k: v for k, v in filters.items()
        if k in ALLOWED_METADATA_KEYS and v is not None
    }
    return clean or None

def build_retrieval_query(schema, table, metadata_filters=None):
    base = sql.SQL("""
        SELECT content, metadata
        FROM {}.{}
    """).format(
        sql.Identifier(schema),
        sql.Identifier(table),
    )

    where_clauses = []
    values = []

    if metadata_filters:
        for key, val in metadata_filters.items():
            where_clauses.append(
                sql.SQL("metadata ->> {} = %s").format(sql.Literal(key))
            )
            values.append(val)

    if where_clauses:
        base += sql.SQL(" WHERE ") + sql.SQL(" AND ").join(where_clauses)

    base += sql.SQL(" ORDER BY embedding <=> %s::vector LIMIT %s")

    return base, values


def retrieve_knowledge(
    conn,
    user_query: str,
    filters: dict | None,
    k: int = 5
):
    query_embedding = embed_text(user_query)
    filters = sanitize_filters(filters)
    query, values = build_retrieval_query(
        schema="knowledge",
        table="items",
        metadata_filters=filters
    )

    values.extend([query_embedding, k])

    with conn.cursor() as cur:
        cur.execute(query, values)
        rows = cur.fetchall()

    return [
        {
            "content": content,
            "metadata": metadata
        }
        for content, metadata in rows
    ]


# def main():
#     conn = get_db_connection()

#     test_cases = [
#         {
#             "query": "What is your return policy?",
#             "filters": {"doc_type": "policy"}
#         },
#         {
#             "query": "How can I track my order?",
#             "filters": {"doc_type": "faq"}
#         },
#         {
#             "query": "How do I take care of my model kits?",
#             "filters": {"doc_type": "guide"}
#         },
#     ]

#     for case in test_cases:
#         print("\n" + "=" * 60)
#         print(f"QUERY: {case['query']}")

#         results = retrieve_knowledge(
#             conn=conn,
#             user_query=case["query"],
#             filters=case["filters"],
#             k=3
#         )

#         print(f"Retrieved {len(results)} chunks\n")

#         for i, r in enumerate(results, start=1):
#             print(f"[{i}] section={r['metadata'].get('section')}")
#             print(r["content"][:200].replace("\n", " "), "...\n")

#     conn.close()

# if __name__ == "__main__":
#     main()