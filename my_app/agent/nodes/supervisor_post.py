from langchain_core.messages import AIMessage
from my_app.agent.utils.state import AgentState
from my_app.agent.utils.model import get_text_llm


def supervisor_post_node(state: AgentState) -> dict:
    llm = get_text_llm()

    # Case 1: We have retrieved knowledge
    if state.get("knowledge_result") and state["knowledge_result"].get("items"):
        items = state["knowledge_result"]["items"]

        context = "\n\n".join(
            item["content"] for item in items[:2]  # top 2 is enough
        )

        prompt = f"""
        You are a customer support assistant.

        Answer the user's question in ONE short, clear sentence.
        Do not add extra details.
        Do not mention policies, documents, or sections explicitly.

        User question:
        {state["user_query"]}

        Reference information:
        {context}

        One-sentence answer:
        """

        answer = llm.invoke(prompt).content.strip()

        return {
            "messages": [AIMessage(content=answer)]
        }

    # Case 2: No knowledge found → clarification
    clarification = (
        "I couldn’t find a clear answer to that. "
        "Could you please clarify your question?"
    )

    return {
        "messages": [AIMessage(content=clarification)]
    }
