from langgraph.graph import StateGraph, END
from my_app.agent.utils.state import AgentState
from my_app.agent.utils.nodes.supervisor_node import supervisor_node
from my_app.agent.utils.nodes.general_node import general_agent_node
from my_app.agent.utils.nodes.reponse_node import response_generator_node
from my_app.agent.utils.nodes.knowledge_node import knowledge_agent_node
from my_app.agent.utils.nodes.product_node import product_agent_node
from my_app.agent.utils.nodes.customer_node import customer_agent_node
from my_app.agent.utils.nodes.supervisor_node import clarify_agent_node

def route_from_supervisor(state: AgentState) -> str:
    """
    LangGraph routing function.
    Must return a node name or END.
    """
    next_agent = state.get("next_agent")

    if next_agent == "knowledge_agent":
        return "knowledge_agent"
    if next_agent == "customer_agent":
        return "customer_agent"
    if next_agent == "product_agent":
        return "product_agent"
    if next_agent == "general_agent":
        return "general_agent"
    if next_agent == "clarify":
        return "clarify_agent"
    return END



def build_graph():
    graph = StateGraph(AgentState)

    # Nodes
    graph.add_node("supervisor", supervisor_node)
    graph.add_node("knowledge_agent", knowledge_agent_node)
    graph.add_node("customer_agent", customer_agent_node)
    graph.add_node("product_agent", product_agent_node)
    graph.add_node("general_agent", general_agent_node)
    graph.add_node("clarify_agent", clarify_agent_node)

    graph.add_node("response_generator", response_generator_node)

    # Entry point
    graph.set_entry_point("supervisor")

    # Conditional routing
    graph.add_conditional_edges(
        "supervisor",
        route_from_supervisor,
        {
            "knowledge_agent": "knowledge_agent",
            "customer_agent": "customer_agent",
            "product_agent": "product_agent",
            "general_agent": "general_agent",
            "clarify_agent": "clarify_agent",
            END: END,
        },
    )

    # Agents go to response generator
    graph.add_edge("knowledge_agent", "response_generator")
    graph.add_edge("customer_agent", "response_generator")
    graph.add_edge("product_agent", "response_generator")
    graph.add_edge("general_agent", "response_generator")
    graph.add_edge("clarify_agent", "response_generator")

    # Response generator ends the graph
    graph.add_edge("response_generator", END)


    return graph.compile()


def main():
    graph = build_graph()

    result = graph.invoke({
        "user_query": "My order 45821 hasn’t arrived yet."
    })

    print(result)

if __name__ == "__main__":
    main()