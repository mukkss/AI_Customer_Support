from langchain_core.messages import AIMessage
from my_app.agent.utils.state import AgentState
from my_app.agent.utils.model import get_text_llm


def supervisor_post_node(state: AgentState) -> dict:
    llm = get_text_llm()
    

    if state.get("escalated") is True:
        reason = state.get("escalation_reason", "support_required")

        if reason == "user_requested_human":
            message = "I’ll connect you with a human support agent to help you further."
        else:
            message = (
                "I’m not fully confident I understood your request, "
                "so I’m passing this to a human support agent."
            )

        return {
            "messages": [AIMessage(content=message)],
            "escalated": True,
            "escalation_reason": reason,
            "confidence": state.get("confidence"),
            "last_agent_route": "supervisor_post"
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
    
    if state.get("order_result") and state["order_result"].get("items"):
        orders = state["order_result"]["items"]

        # Case 1: Return status inquiry
        if len(orders) == 1:
            order = orders[0]
            return_info = order.get("return")

            if return_info:
                prompt = f"""
                    You are a customer support assistant.

                    The user asked about a return.
                    Answer the user's question in ONE short, clear sentence.
                    State the return status clearly.
                    
                    User question:
                    {state["user_query"]}

                    Return status: {return_info['return_status']}
                    Refund amount: {return_info.get('refund_amount')}

                    One-sentence answer:
                """

                answer = llm.invoke(prompt).content.strip()
                return {"messages": [AIMessage(content=answer)]}


        # Case 2: Specific order WITH items
        if (
            len(orders) == 1
            and orders[0].get("items")
        ):
            order = orders[0]

            order_id = order["order_id"]
            item_count = len(order["items"])

            prompt = f"""
                You are a customer support assistant.

                The user asked about the ITEMS in their order.
                Answer the user's question in ONE short, clear sentence.
                Mention the number of items.
                Do NOT talk about order status unless asked.
                User question:
                    {state["user_query"]}

                Order ID: {order_id}
                Number of items: {item_count}

                One-sentence answer:
            """

            answer = llm.invoke(prompt).content.strip()
            return {"messages": [AIMessage(content=answer)]}

        # Case 2️3: Specific order WITHOUT items → status-focused
        if len(orders) == 1:
            order = orders[0]

            order_id = order["order_id"]
            status = order["order_status"]
            delivery = order.get("expected_delivery")

            prompt = f"""
                You are a customer support assistant.

                The user asked about the STATUS of their order.
                Answer the user's question in ONE short, clear sentence.
                State the order status explicitly.
                Mention expected delivery ONLY if available.

                User question:
                    {state["user_query"]}
                Order ID: {order_id}
                Status: {status}
                Expected delivery: {delivery}

                One-sentence answer:
            """

            answer = llm.invoke(prompt).content.strip()
            return {"messages": [AIMessage(content=answer)]}

        # Case 3: Multiple orders found
        order_count = len(orders)

        prompt = f"""
            You are a customer support assistant.

            Answer the user's question in ONE short, clear sentence.
            State how many orders were found.
            Do NOT list order IDs.
            Do NOT add extra details.
            User question:
                    {state["user_query"]}

            Number of orders: {order_count}

            One-sentence answer:
        """

        answer = llm.invoke(prompt).content.strip()
        return {"messages": [AIMessage(content=answer)]}


    
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
                content="I’m not able to find the information for that request right now. Please Contact Customer Care"
            )
        ]
    }
    