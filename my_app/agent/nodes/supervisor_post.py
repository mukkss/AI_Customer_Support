from langchain_core.messages import AIMessage
from my_app.agent.utils.state import AgentState
from my_app.agent.utils.model import get_text_llm


def supervisor_post_node(state: AgentState) -> dict:
    llm = get_text_llm()
    

    if state.get("escalated") is True:
        reason = state.get("escalation_reason", "support_required")

        if reason == "user_requested_human":
            message = "I’ll connect you with a Customer support to help you further."
        else:
            message = (
                "I’m not fully confident I understood your request, "
                "so I’m passing this to a Customer support."
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
            You are a precise and polite customer support assistant.

            The user's question is unclear or incomplete, and you must ask for clarification.

            Rules:
            - Ask for clarification in EXACTLY ONE short, clear sentence.
            - Ask ONLY ONE question.
            - Be polite and professional.
            - Do NOT guess the user's intent.
            - Do NOT provide answers, suggestions, or explanations.
            - Do NOT mention policies, context, or why clarification is needed.
            - If possible, reference the user's original question naturally.

            User question:
            {context}

            One-sentence clarification question:
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

        context_parts = []
        for item in items[:2]:
            content = item.get("content", "").strip()
            if content:
                context_parts.append(content)

        context = "\n\n".join(
            context_parts
        )

        user_query = state.get("user_query", "").strip()

        prompt = f"""
            You are a precise and reliable customer support assistant.

            Your task:
            - Answer the user's question using ONLY the reference information provided.
            - Respond in EXACTLY TWO short, clear, and complete sentence.
            - Do NOT add explanations, assumptions, or extra details.
            - Do NOT mention documents, policies, sources, or "reference information".
            - If the answer cannot be determined from the reference, say: "I'm sorry, I don't have enough information to answer that."

            User question:
            {user_query}

            Reference information:
            {context}

            Final two-sentence answer:
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
                
                1. Provide a one-sentence summary.
                2. List the items in the order (Product Name, Quantity, Price).

                Rules:
                    - Do NOT use prefixes like "Summary:" at the start.
                    - Write naturally.  
                User question: {state["user_query"]}
                Order ID: {order_id}
                Items data: {order["items"]}
            """

            answer = llm.invoke(prompt).content.strip()
            return {"messages": [AIMessage(content=answer)]}

        # Case 3: Specific order WITHOUT items → status-focused
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
                ALWAYS state the expected delivery date if it exists in the data.
                Rules:
            - Do NOT use prefixes like "Summary:" at the start.
            - Write naturally.

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
            
            1. Provide a one-sentence summary.
            2. List the orders with their ID, Status, Date, Total Amount, 
                AND Expected Delivery Date (if available).
            
            Rules:
            - Do NOT use prefixes like "Summary:" at the start.
            - Write naturally.
            
            User question: {state["user_query"]}
            Number of orders: {order_count}
            Orders data: {orders}
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
    