from langchain_core.tools import tool
from langchain_tavily import TavilySearch
from my_app.agent.config import TAVILY_API_KEY
import os

os.environ["TAVILY_API_KEY"] = TAVILY_API_KEY

search_engine = TavilySearch(
    max_results=5,
    topic="general",
    include_raw_content=False,
    include_answer=True,
)

@tool
def web_search_tool(query: str) -> str:
    """
    Search the public web for general, non-commercial model-building information.
    """
    return search_engine.invoke(query)
