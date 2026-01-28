from typing_extensions import TypedDict
from langchain_core.messages import AnyMessage, ToolMessage
from typing import Optional, Dict, Any,List

class GeneralAgentState(TypedDict):
    user_query: str
    tool_results: Optional[List[ToolMessage]]
    general_result: Optional[str]   
    web_search_success : bool   