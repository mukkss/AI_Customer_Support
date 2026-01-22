import json
from my_app.agent.utils.state import AgentState
from my_app.agent.utils.model import get_llm
from my_app.agent.utils.prompts import SUPERVISOR_PROMPT
from langchain_core.messages import AIMessage


def hard_guardrail_check(text: str):
    lowered = text.lower()

    forbidden_terms = [
        "password", "api key", "credential",
        "internal data", "database dump",
        "hack", "bypass"
    ]

    sql_patterns = [
        "drop table",
        "select * from",
        "insert into",
        "delete from",
        "update set"
    ]

    for term in forbidden_terms:
        if term in lowered:
            return False, f"Blocked term detected: {term}"

    for pattern in sql_patterns:
        if pattern in lowered:
            return False, "SQL-like request detected"

    return True, None


def supervisor_node(state) -> dict:
    user_query = state["user_query"]

    # Hard guardrails
    safe, reason = hard_guardrail_check(user_query)
    if not safe:
        return {
            "safe": False,
            "block_reason": reason,
            "next_agent": "end"
        }

    # LLM reasoning
    llm = get_llm()
    response = llm.invoke(
        SUPERVISOR_PROMPT + "\nUser query:\n" + user_query
    )

    print("RAW SUPERVISOR OUTPUT:\n", response.content)

    try:
        data = json.loads(response.content)
    except Exception:
        return {
            "safe": False,
            "block_reason": "Supervisor JSON parsing failure",
            "next_agent": "end"
        }
    if not data["safe"]:
        return {
            "safe": False,
            "block_reason": data["block_reason"],
            "next_agent": "end"
        }

    # Routing logic (defensive)
    confidence = data.get("confidence", 0.0)

    if data["clarification_needed"] or confidence < 0.6:
        next_agent = "clarify"
    elif data["needs"]["customer"]:
        next_agent = "customer_agent"
    else:
        next_agent = "knowledge_agent"

    return {
        "safe": True,
        "block_reason": None,
        "intents": data["intents"],
        "filters": data.get("filters", {}),
        "clarification_needed": data["clarification_needed"],
        "next_agent": next_agent
    }







#Dummy clarify agent
def clarify_agent_node(state: AgentState) -> dict:
    return {
        "messages": [
            AIMessage(content=f"[ClarifyAgent] handled query: {state['user_query']}")
        ]
    }




