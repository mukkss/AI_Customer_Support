from langchain_core.messages import AIMessage
from my_app.agent.graph import build_graph

graph = build_graph()

def run_agent(user_input: str, customer_id: str):
    result_state = graph.invoke(
        {
            "user_query": user_input,
            "customer_id": customer_id,
            "messages": []
        }
    )

    messages = result_state.get("messages", [])

    if not messages:
        return "No answer generated."

    last_msg = messages[-1]

    if isinstance(last_msg, AIMessage):
        return last_msg.content.strip()

    return "No answer generated."



if __name__ == "__main__":
    queries = [
        # ("What glue is best for resin models?", "C001"),
        # ("Do you have 1/72 scale RAF decals?", "C002"),
        # ("What is your return policy for decal sets?", "C003"),
        ("Do I have any orders?", "C001"),
        ("What is the status of order O1001?", "C001"),
        ("What items are in my order O1001?", "C001"),
        ("Do I have any returns for order O1002?", "C002"),
        ("What about my order?", "C003"),
        ("I want to talk to a human agent about my order", "C001"),
    ]

    for q, cid in queries:
        print("\nQ:", q)
        print("Customer:", cid)
        print("A:", run_agent(q, cid))
