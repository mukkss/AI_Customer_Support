from langchain.tools import tool
from my_app.agent.utils.knowledge_RAG.retriever import retrieve_knowledge
from my_app.agent.utils.knowledge_RAG.db_writer import get_db_connection

@tool
def knowledge_retrieval_tool(
    user_query: str,
    filters: dict | None = None,
    k: int = 5
) -> dict:
    """
    Retrieve relevant knowledge chunks from the knowledge base.
    Returns structured results (content + metadata).
    """
    conn = get_db_connection()
    try:
        results = retrieve_knowledge(
            conn=conn,
            user_query=user_query,
            filters=filters,
            k=k
        )
    finally:
        conn.close()

    return {
        "items": results,
        "count": len(results)
    }
