import json
from my_app.agent.utils.state import AgentState
from langchain_core.messages import AIMessage


def knowledge_agent_node(state: AgentState) -> dict:
    # Dummy knowledge retrieval
    filters = state["filters"]
    docs = [f"Doc about {filters.get('category', 'various topics')}"]
    return {
        "knowledge_result": {
            "docs": docs,
            "confidence": 0.8
        }
    }
