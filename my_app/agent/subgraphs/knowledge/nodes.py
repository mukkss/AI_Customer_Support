from my_app.agent.subgraphs.knowledge.state import KnowledgeState
from my_app.agent.subgraphs.knowledge.tool import knowledge_retrieval_tool

def knowledge_tool_node(state: KnowledgeState) -> dict:
    knowledge_filters = state["filters"].get("knowledge", {})
    result = knowledge_retrieval_tool.invoke({
        "user_query": state["user_query"],
        "filters": knowledge_filters,
        "k": 5
    })

    return {
        "knowledge_result": result,
        "rag_success": bool(result and result.get("items"))
    }
