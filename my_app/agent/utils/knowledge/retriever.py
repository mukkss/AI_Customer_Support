from psycopg2 import sql
from my_app.agent.utils.knowledge.ingest_config import RETRIEVAL_TABLES
from my_app.agent.utils.knowledge.db_writer import get_db_connection
from my_app.agent.utils.knowledge.embedder import embed_text

def detect_intent(query: str) -> str:
    q = query.lower()

    policy_keywords = ["return", "refund", "privacy", "terms", "shipping", "warranty"]
    faq_keywords = ["order", "payment", "track", "cancel", "account"]
    guide_keywords = ["how to", "care", "maintenance", "use", "tips"]

    scores = {
        "policy": sum(k in q for k in policy_keywords),
        "faq": sum(k in q for k in faq_keywords),
        "guide": sum(k in q for k in guide_keywords),
    }

    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "fallback"



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

    # 👇 THIS IS THE FIX
    base += sql.SQL(" ORDER BY embedding <=> %s::vector LIMIT %s")

    return base, values




def retrieve_from_table(
    conn,
    schema,
    table,
    query_embedding,
    k=5,
    metadata_filters=None
):
    query, values = build_retrieval_query(
        schema=schema,
        table=table,
        metadata_filters=metadata_filters
    )

    values.extend([query_embedding, k])

    with conn.cursor() as cur:
        cur.execute(query, values)
        rows = cur.fetchall()

    return [
        {"content": c, "metadata": m}
        for c, m in rows
    ]


def hybrid_retrieve(conn, user_query, k=5):
    intent = detect_intent(user_query)
    query_embedding = embed_text(user_query)

    print(f"[DEBUG] intent={intent}")

    if intent in RETRIEVAL_TABLES:
        cfg = RETRIEVAL_TABLES[intent]

        rows = retrieve_from_table(
            conn=conn,
            schema=cfg["schema"],
            table=cfg["table"],
            query_embedding=query_embedding,
            k=k,
        )

        if len(rows) >= 2:
            for r in rows:
                r["source"] = intent
            return rows

    # fallback path
    results = []
    for intent_name, cfg in RETRIEVAL_TABLES.items():
        rows = retrieve_from_table(
            conn,
            cfg["schema"],
            cfg["table"],
            query_embedding,
            k=2,
        )
        for r in rows:
            r["source"] = intent_name
            results.append(r)

    return results



def main():
    conn = get_db_connection()

    test_queries = [
        "What is your return policy?",
        "How can I track my order?",
        "How do I take care of my model kits?",
    ]

    for q in test_queries:
        print("\n" + "=" * 60)
        print(f"QUERY: {q}")

        results = hybrid_retrieve(
            conn=conn,
            user_query=q,
            k=3
        )

        print(f"Retrieved {len(results)} chunks\n")

        for i, r in enumerate(results, start=1):
            source = r.get("source")
            section = r["metadata"].get("section")

            print(f"[{i}] source={source}, section={section}")
            print(r["content"][:200].replace("\n", " "), "...\n")

    conn.close()


if __name__ == "__main__":
    main()
