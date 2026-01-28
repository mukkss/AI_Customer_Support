from my_app.agent.utils.state import AgentState
from my_app.agent.subgraphs.catalog.tool import catalog_retrieval_tool


def catalog_tool_node(state: AgentState) -> dict:
    catalog_filters = state["filters"].get("catalog", {})

    result = catalog_retrieval_tool.invoke({
        "filters": catalog_filters,
        "limit": 20
    })

    return {
        "catalog_result": result,
        "ret_success": bool
    }
