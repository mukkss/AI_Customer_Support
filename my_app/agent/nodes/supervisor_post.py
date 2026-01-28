from langchain_core.messages import AIMessage
from my_app.agent.utils.state import AgentState
from my_app.agent.utils.model import get_text_llm


def supervisor_post_node(state: AgentState) -> dict:
    llm = get_text_llm()

    if state.get("catalog_result") and state["catalog_result"].get("items"):
        items = state["catalog_result"]["items"]

        product_lines = []
        for p in items[:3]:  
            product_lines.append(
                f"- {p['title']} ({p.get('scale_label', 'N/A')})"
            )

        context = "\n".join(product_lines)

        prompt = f"""
            You are a customer support assistant.

            Answer the user's question in ONE short, clear sentence.
            Mention availability if relevant.
            Do NOT list many items.
            Do NOT add extra details.

            User question:
            {state["user_query"]}

            Available products:
            {context}

            One-sentence answer:
        """

        answer = llm.invoke(prompt).content.strip()
        return {"messages": [AIMessage(content=answer)]}

    if state.get("knowledge_result") and state["knowledge_result"].get("items"):
        items = state["knowledge_result"]["items"]

        context = "\n\n".join(
            item["content"] for item in items[:2]
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
        return {"messages": [AIMessage(content=answer)]}

    return {
        "messages": [
            AIMessage(
                content="I couldn’t find a clear answer to that. Could you please clarify your question?"
            )
        ]
    }
