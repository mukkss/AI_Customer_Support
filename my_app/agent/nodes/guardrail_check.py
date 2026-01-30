from langgraph.graph import END
from langchain_core.messages import AIMessage
from my_app.agent.utils.state import AgentState
from guardrails import Guard
from guardrails.hub import BanList, SecretsPresent, UnusualPrompt


BANNED_BUSINESS_TERMS = [
    "internal pricing",
    "supplier cost",
    "admin password",
    "database dump",
    "employee data",
    "internal policy",
    "internal system",
]

guard = Guard().use_many(
    BanList(
        banned_words=BANNED_BUSINESS_TERMS,
        max_l_dist=1,
        on_fail="noop"  
    ),
    SecretsPresent()    
)

def guardrails_input_node(state: AgentState) -> dict:
    user_query = state["user_query"]

    result = guard.validate(user_query)

    if not result.validation_passed:
        return {
            "safe": False,
            "block_reason": "guardrails_violation",
            "escalate_to_human": False,
            "messages": [
                AIMessage(
                    content="I can’t help with that request."
                )
            ],
            "next_agent": END
        }
    
    return {}
