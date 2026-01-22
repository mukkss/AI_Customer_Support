import json
from my_app.agent.utils.state import AgentState
from langchain_core.messages import AIMessage


def response_generator_node(state: AgentState) -> dict:
    last_msg = state["messages"][-1]
    return {
        "messages": [last_msg]
    }