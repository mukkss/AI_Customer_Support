from langgraph.graph import StateGraph, END
from my_app.agent.subgraphs.knowledge.state import KnowledgeState
from my_app.agent.subgraphs.knowledge.nodes import knowledge_tool_node

def build_knowledge_subgraph():
    graph = StateGraph(KnowledgeState)

    graph.add_node("knowledge_tool", knowledge_tool_node)

    graph.set_entry_point("knowledge_tool")
    graph.add_edge("knowledge_tool", END)

    return graph.compile()
