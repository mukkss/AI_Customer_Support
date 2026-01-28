from my_app.agent.subgraphs.orders.state import OrderAgentState
from my_app.agent.subgraphs.orders.tool import order_retrieval_tool


def order_tool_node(state: OrderAgentState) -> dict:
    customer_id = state.get("customer_id")


    # Supervisor should guarantee this, but double safety is fine
    if not customer_id:
        return {
            "order_result": {
                "items": [],
                "count": 0,
                "error": "unauthenticated"
            }
        }

    order_filters = state["filters"].get("order", {})

    result = order_retrieval_tool.invoke({
        "customer_id": customer_id,
        "filters": order_filters
    })

    return {
        "order_result": result
    }
