from langgraph.graph import StateGraph, END
from my_app.agent.utils.state import AgentState
from my_app.agent.nodes.supervisor_pre import supervisor_pre_node
from my_app.agent.subgraphs.knowledge.graph import build_knowledge_subgraph
from my_app.agent.subgraphs.catalog.graph import build_catalog_subgraph
from my_app.agent.subgraphs.general.graph import build_general_subgraph
from my_app.agent.nodes.supervisor_post import supervisor_post_node
# from my_app.agent.utils.nodes.order_retrieval import order_agent_node


VALID_ROUTES = {
    "knowledge_retrieval",
    "catalog_retrieval",
    "order_retrieval",
    "general_agent",
    "supervisor_post"
}

def route_from_supervisor_pre(state: AgentState) -> str:
    next_agent = state.get("next_agent")
    if next_agent in VALID_ROUTES:
        return next_agent
    return END



def build_graph():
    graph = StateGraph(AgentState)

    knowledge_subgraph = build_knowledge_subgraph()
    catalog_subgraph = build_catalog_subgraph()
    general_subgraph = build_general_subgraph()

    graph.add_node("supervisor_pre", supervisor_pre_node)
    graph.add_node("knowledge_retrieval", knowledge_subgraph)
    graph.add_node("catalog_retrieval", catalog_subgraph)
    # graph.add_node("order_retrieval", order_agent_node)
    graph.add_node("general_agent", general_subgraph)
    graph.add_node("supervisor_post", supervisor_post_node)


    graph.set_entry_point("supervisor_pre")

    graph.add_conditional_edges(
        "supervisor_pre",
        route_from_supervisor_pre,
        {
            "knowledge_retrieval": "knowledge_retrieval",
            "catalog_retrieval": "catalog_retrieval",
            # "order_retrieval": "order_retrieval",
            "general_agent": "general_agent",
            "supervisor_post": "supervisor_post",
            END: END,
        },
    )

    graph.add_edge("knowledge_retrieval", "supervisor_post")
    graph.add_edge("catalog_retrieval", "supervisor_post")
    # graph.add_edge("order_retrieval", "supervisor_post")
    graph.add_edge("general_agent", "supervisor_post")

    graph.add_edge("supervisor_post", END)
    # graph.add_edge("response_formatter", END)

    return graph.compile()
