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
        "How should I store decal sheets safely?",
        "Do you have 1/72 scale RAF decals?",
        "List WWII tank decals from Germany",
    ]

    for q in queries:
        print("\nQ:", q)
        print("A:", run_agent(q))