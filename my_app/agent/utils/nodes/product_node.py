import json
from my_app.agent.utils.state import AgentState
from langchain_core.messages import AIMessage


def product_agent_node(state: AgentState) -> dict:
    return {
        "messages": [
            AIMessage(content=f"[ProductAgent] handled query: {state['user_query']}")
        ]
    }