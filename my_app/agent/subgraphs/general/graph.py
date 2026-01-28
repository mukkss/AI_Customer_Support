from langgraph.graph import StateGraph, END
from my_app.agent.subgraphs.general.state import GeneralAgentState
from my_app.agent.subgraphs.general.nodes import (general_agent_node,general_tool_executor, general_final_node)
def build_general_subgraph():
    graph = StateGraph(GeneralAgentState)

    graph.add_node("general_agent", general_agent_node)
    graph.add_node("general_tool_executor", general_tool_executor)
    graph.add_node("general_final_node", general_final_node)

    graph.set_entry_point("general_agent")
    graph.add_edge("general_agent", "general_tool_executor")
    graph.add_edge("general_tool_executor", "general_final_node")
    graph.add_edge("general_final_node", END)

    return graph.compile()