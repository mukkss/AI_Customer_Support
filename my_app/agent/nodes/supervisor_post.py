from langchain_core.messages import AIMessage
from my_app.agent.utils.state import AgentState
from my_app.agent.utils.model import get_text_llm


def supervisor_post_node(state: AgentState) -> dict:
    llm = get_text_llm()
    

    if state.get("escalate_to_human") == True:
        reason = state.get("escalation_reason", "support_required")

        if reason == "user_requested_human":
            message = (
                "I’ll connect you with a human support agent to help you further."
            )
        else:
            message = (
                "I’m not fully confident I understood your request, so I’m passing this to a human support agent."
            )

        return {
            "messages": [
                AIMessage(content=message)
            ]
        }


    if state.get("clarification_needed") == True:
        context = state["user_query"]
        prompt = f"""
            You are a customer support assistant.

            The user's question is unclear. 
            Politely ask for clarification in ONE short sentence.
            Do NOT ask multiple questions.
            Do NOT suggest answers.

            User question:
            {context}

            Clarification request:
        """
        answer = llm.invoke(prompt).content.strip()

        return {
            "messages": [
                AIMessage(
                    content=answer
                )
            ]
        }

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
        return {
            "messages": [
                AIMessage(
                    content=answer
                )
            ]
        }
    
    
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

    if state.get("general_result"):
        return {
            "messages": [
                AIMessage(content=state["general_result"])
            ]
        }

    return {
        "messages": [
            AIMessage(
                content="I couldn’t find a clear answer to that. Could you please clarify your question?"
            )
        ]
    }
