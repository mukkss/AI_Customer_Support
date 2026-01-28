from langchain.tools import tool
from my_app.agent.utils.knowledge_RAG.db_writer import get_db_connection


ALLOWED_ORDER_FILTERS = {
    "order_id",
    "order_status",
    "has_return",
}


def sanitize_order_filters(filters: dict | None):
    if not filters:
        return {}

    return {
        k: v for k, v in filters.items()
        if k in ALLOWED_ORDER_FILTERS and v is not None
    }


def build_order_query(customer_id: str, filters: dict):
    """
    Build a safe SQL query for order + return lookup.
    """
    base_query = """
        SELECT
            o.order_id,
            o.order_status,
            o.order_date,
            o.expected_delivery,
            o.total_amount,
            r.return_id,
            r.return_status,
            r.refund_amount
        FROM orders.orders o
        LEFT JOIN orders.returns r
          ON r.order_id = o.order_id
        WHERE o.customer_id = %s
    """

    where_clauses = []
    values = [customer_id]

    if "order_id" in filters:
        where_clauses.append("o.order_id = %s")
        values.append(filters["order_id"])

    if "order_status" in filters:
        where_clauses.append("o.order_status = %s")
        values.append(filters["order_status"])

    if "has_return" in filters:
        if filters["has_return"] is True:
            where_clauses.append("r.return_id IS NOT NULL")
        else:
            where_clauses.append("r.return_id IS NULL")

    query = base_query

    if where_clauses:
        query += " AND " + " AND ".join(where_clauses)

    query += "\nORDER BY o.order_date DESC"
    query += "\nLIMIT 10"

    return query, values

def fetch_order_items(conn, order_id: str):
    query = """
        SELECT
            oi.product_id,
            oi.quantity,
            oi.unit_price
        FROM orders.order_items oi
        WHERE oi.order_id = %s
    """

    with conn.cursor() as cur:
        cur.execute(query, (order_id,))
        rows = cur.fetchall()

    return [
        {
            "product_id": r[0],
            "quantity": r[1],
            "unit_price": float(r[2]) if r[2] is not None else None,
        }
        for r in rows
    ]

def retrieve_orders(conn, customer_id: str, raw_filters: dict | None):
    filters = sanitize_order_filters(raw_filters)
    query, values = build_order_query(customer_id, filters)

    with conn.cursor() as cur:
        cur.execute(query, values)
        rows = cur.fetchall()

    items = []
    for r in rows:
        order_id = r[0]

        order_data = {
            "order_id": order_id,
            "order_status": r[1],
            "order_date": r[2],
            "expected_delivery": r[3],
            "total_amount": float(r[4]) if r[4] is not None else None,
            "return": (
                {
                    "return_id": r[5],
                    "return_status": r[6],
                    "refund_amount": float(r[7]) if r[7] is not None else None,
                }
                if r[5] is not None
                else None
            ),
        }

        if "order_id" in filters:
            order_data["items"] = fetch_order_items(conn, order_id)

        items.append(order_data)

    return {
        "items": items,
        "count": len(items)
    }



@tool
def order_retrieval_tool(
    customer_id: str,
    filters: dict | None = None
) -> dict:
    """
    Retrieve orders (and return status if present) for a customer.
    """
    conn = get_db_connection()
    try:
        result = retrieve_orders(
            conn=conn,
            customer_id=customer_id,
            raw_filters=filters
        )
    finally:
        conn.close()

    return result
