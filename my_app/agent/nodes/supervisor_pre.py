import json
from langgraph.graph import END
from my_app.agent.utils.model import get_json_llm
from my_app.agent.utils.prompts import SUPERVISOR_PROMPT


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

    if not data.get("safe", False):
        return {
            "safe": False,
            "block_reason": data.get("block_reason"),
            "next_agent": END
        }

    confidence = data.get("confidence", 0.0)
    intents = data.get("intents", [])
    raw_filters = data.get("filters", {}) or {}


    if data.get("clarification_needed") or confidence < 0.6:
        return {
            "safe": True,
            "block_reason": None,
            "intents": intents,
            "filters": {},
            "clarification_needed": True,
            "next_agent": END
        }

    if "PRODUCT_SEARCH" in intents:
        return {
            "safe": True,
            "block_reason": None,
            "intents": intents,
            "filters": {
                "product": raw_filters  
            },
            "clarification_needed": False,
            "next_agent": "catalog_retrieval"
        }

    if any(i in intents for i in ("POLICY_LOOKUP", "GENERAL_GUIDE")):
        knowledge_filters = raw_filters.copy()

        # Default doc_type if missing
        if "doc_type" not in knowledge_filters:
            if "POLICY_LOOKUP" in intents:
                knowledge_filters["doc_type"] = "policy"
            elif "GENERAL_GUIDE" in intents:
                knowledge_filters["doc_type"] = "guide"

        return {
            "safe": True,
            "block_reason": None,
            "intents": intents,
            "filters": {
                "knowledge": knowledge_filters 
            },
            "clarification_needed": False,
            "next_agent": "knowledge_retrieval"
        }

    if "CUSTOMER_QUERY" in intents:
        return {
            "safe": True,
            "block_reason": None,
            "intents": intents,
            "filters": {},
            "clarification_needed": False,
            "next_agent": "order_retrieval"
        }

    return {
        "safe": True,
        "block_reason": None,
        "intents": intents,
        "filters": {},
        "clarification_needed": True,
        "next_agent": END
    }
