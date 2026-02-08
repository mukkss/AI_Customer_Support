import json
from langchain_core.messages import AIMessage, ToolMessage, SystemMessage
from my_app.agent.subgraphs.general.state import GeneralAgentState
from my_app.agent.subgraphs.general.tool import web_search_tool
from my_app.agent.utils.model import get_text_llm





llm = get_text_llm()
llm_with_tools = llm.bind_tools([web_search_tool])

def general_agent_node(state: GeneralAgentState):
    system_prompt = """
    You are a general knowledge assistant.

    RULES (STRICT):
    - Answer general informational questions only
    - Use web_search_tool if external info is needed
    - Do NOT mention SkySkale
    - Do NOT mention buying, selling, prices, or availability
    - Avoid dangerous or highly technical instructions
    - Do NOT mention tools or sources explicitly
    """

    messages = [
        SystemMessage(content=system_prompt),
        SystemMessage(content=state["user_query"])
    ]

    response = llm_with_tools.invoke(messages)

    return {
        "messages": [response]
    }



def general_tool_executor(state: GeneralAgentState) -> dict:
    messages = state.get("messages", [])
    if not messages:
        return {}

    last_msg = messages[-1]

    if not isinstance(last_msg, AIMessage) or not last_msg.tool_calls:
        return {}

    results: list[ToolMessage] = []

    for call in last_msg.tool_calls:
        if call["name"] == "web_search_tool":
            output = web_search_tool.invoke(call["args"])
            results.append(
                ToolMessage(
                    content=json.dumps(output),
                    tool_call_id=call["id"]
                )
            )

    return {
        "tool_results": results
    }


def general_final_node(state: GeneralAgentState) -> dict:
    llm = get_text_llm()

    tool_outputs = state.get("tool_results", [])

    context = "\n\n".join(m.content for m in tool_outputs)

    prompt = f"""
    Answer the user's question using the information below.

    Rules:
    - General informational advice only
    - No SkySkale mention
    - No buying, prices, or availability
    - One line answer

    Question:
    {state["user_query"]}

    Information:
    {context}
    """

    answer = llm.invoke(prompt).content.strip()

    return {
        "general_result": answer,
        "web_search_success": bool(answer and len(answer) > 0)
    }
