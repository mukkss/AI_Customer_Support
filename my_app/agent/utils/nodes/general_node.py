import json
from my_app.agent.utils.state import AgentState
from langchain_core.messages import AIMessage

def general_agent_node(state: AgentState) -> dict:
    return {
        "messages": [
            AIMessage(content=f"[GeneralAgent] handled query: {state['user_query']}")
        ]
    }