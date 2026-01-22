import json
from my_app.agent.utils.state import AgentState
from langchain_core.messages import AIMessage

def customer_agent_node(state: AgentState) -> dict:
    return {
        "messages": [
            AIMessage(content=f"[CustomerAgent] handled query: {state['user_query']}")
        ]
    }