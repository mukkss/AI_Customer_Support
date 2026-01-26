from langchain_core.messages import AIMessage
from my_app.agent.graph import build_graph

graph = build_graph()

def run_agent(user_input: str):
    result_state = graph.invoke(
        {
            "user_query": user_input,
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
        "What is your return policy?",
        "How do I cancel an order?",
        "Do you accept returns for custom models?",
    ]

    for q in queries:
        print("\nQ:", q)
        print("A:", run_agent(q))