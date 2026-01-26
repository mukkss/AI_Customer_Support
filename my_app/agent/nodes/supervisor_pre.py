import json
from langgraph.graph import END
from my_app.agent.utils.model import get_json_llm
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


def supervisor_pre_node(state) -> dict:
    user_query = state["user_query"]

    safe, reason = hard_guardrail_check(user_query)
    if not safe:
        return {
            "safe": False,
            "block_reason": reason,
            "next_agent": END
        }

    llm = get_json_llm()
    response = llm.invoke(
        SUPERVISOR_PROMPT + "\nUser query:\n" + user_query
    )

    # print("RAW SUPERVISOR OUTPUT:\n", response.content)

    try:
        data = json.loads(response.content)
    except Exception:
        return {
            "safe": False,
            "block_reason": "Supervisor JSON parsing failure",
            "next_agent": END
        }

    if not data["safe"]:
        return {
            "safe": False,
            "block_reason": data["block_reason"],
            "next_agent": END
        }

    confidence = data.get("confidence", 0.0)
    filters = data.get("filters", {}) or {}

    if "doc_type" not in filters:
        if "POLICY_LOOKUP" in data["intents"]:
            filters["doc_type"] = "policy"
        elif "GENERAL_GUIDE" in data["intents"]:
            filters["doc_type"] = "guide"

    if data["clarification_needed"] or confidence < 0.6:
        next_agent = END
    elif data["needs"]["customer"]:
        next_agent = END
    else:
        next_agent = "knowledge_retrieval"

    return {
        "safe": True,
        "block_reason": None,
        "intents": data["intents"],
        "filters": filters,
        "clarification_needed": data["clarification_needed"],
        "next_agent": next_agent
    }


