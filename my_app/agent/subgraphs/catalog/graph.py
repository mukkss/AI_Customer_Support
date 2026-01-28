from langgraph.graph import StateGraph, END
from my_app.agent.subgraphs.catalog.state import CatalogState
from my_app.agent.subgraphs.catalog.nodes import catalog_tool_node

def build_catalog_subgraph():
    graph = StateGraph(CatalogState)

    graph.add_node("catalog_tool", catalog_tool_node)

    graph.set_entry_point("catalog_tool")
    graph.add_edge("catalog_tool", END)

    return graph.compile()