from langchain_groq import ChatGroq
from my_app.agent.config import GROQ_API_KEY



def get_json_llm():
    return ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.2,
        api_key=GROQ_API_KEY,
        response_format={"type": "json_object"}
    )

def get_text_llm():
    return ChatGroq(
        model="llama-3.1-8b-instant",
        temperature=0.2,
        api_key=GROQ_API_KEY
    )
