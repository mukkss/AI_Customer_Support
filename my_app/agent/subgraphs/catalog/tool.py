from langchain.tools import tool
from my_app.agent.subgraphs.catalog.filter_map import FILTER_JOIN_MAP, DIRECT_FILTERS
from my_app.agent.utils.knowledge_RAG.db_writer import get_db_connection


ALLOWED_PRODUCT_FILTERS = {
    "category",
    "subcategory",
    "topic",
    "subject",
    "country",
    "unit",
    "event",
    "scale_denominator",
    "product_type",
    "year_from",
    "year_to",
}

def sanitize_product_filters(filters: dict | None):
    if not filters:
        return {}

    clean = {
        k: v for k, v in filters.items()
        if k in ALLOWED_PRODUCT_FILTERS and v is not None
    }
    return clean


def build_product_query(filters: dict):
    """
    Build a safe, deterministic SQL query for product search.
    """
    base_query = """
        SELECT DISTINCT
            p.product_id,
            p.title,
            p.product_type,
            p.scale_label,
            p.scale_denominator,
            p.year_reference_release,
            p.reference_url,
            p.dimensions_mm,
            p.weight_g,
            p.box_content
        FROM catalog.products p
    """

    joins = []
    where_clauses = []
    values = []

    # JOIN-based filters
    for key, cfg in FILTER_JOIN_MAP.items():
        if key in filters:
            joins.append(cfg["join"])
            where_clauses.append(f"{cfg['column']} = %s")
            values.append(filters[key])

    # Direct column filters
    for key, column in DIRECT_FILTERS.items():
        if key in filters:
            where_clauses.append(f"{column} = %s")
            values.append(filters[key])

    # Range filters
    if "year_from" in filters:
        where_clauses.append("p.year_reference_release >= %s")
        values.append(filters["year_from"])

    if "year_to" in filters:
        where_clauses.append("p.year_reference_release <= %s")
        values.append(filters["year_to"])

    query = base_query

    if joins:
        query += "\n" + "\n".join(joins)

    if where_clauses:
        query += "\nWHERE " + " AND ".join(where_clauses)

    query += "\nORDER BY p.title ASC"
    query += "\nLIMIT 20"

    return query, values


def retrieve_products(conn, raw_filters: dict, limit: int = 20):
    filters = sanitize_product_filters(raw_filters)
    query, values = build_product_query(filters)

    with conn.cursor() as cur:
        cur.execute(query, values)
        rows = cur.fetchall()

    items = [
        {
            "product_id": r[0],
            "title": r[1],
            "product_type": r[2],
            "scale_label": r[3],
            "scale_denominator": r[4],
            "year_reference_release": r[5],
            "reference_url": r[6],
            "dimensions_mm": r[7],
            "weight_g": r[8],
            "box_content": r[9],
        }
        for r in rows
    ]

    return {
        "items": items,
        "count": len(items)
    }




@tool
def catalog_retrieval_tool(
    filters: dict | None = None,
    limit: int = 20
) -> dict:
    """
    Retrieve products from the catalog using structured relational filters.
    Returns structured product rows.
    """
    conn = get_db_connection()
    try:
        result = retrieve_products(
            conn=conn,
            raw_filters=filters,
            limit=limit
        )
    finally:
        conn.close()

    return result

