from langgraph.graph import StateGraph, END
from my_app.agent.subgraphs.orders.state import OrderAgentState
from my_app.agent.subgraphs.orders.nodes import order_tool_node

def build_order_subgraph():
    graph = StateGraph(OrderAgentState)

    graph.add_node("order_tool", order_tool_node)

    graph.set_entry_point("order_tool")
    graph.add_edge("order_tool", END)

    return graph.compile()