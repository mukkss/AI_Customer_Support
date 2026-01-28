from langchain_core.messages import AnyMessage
from typing_extensions import TypedDict, Annotated
from langgraph.graph.message import add_messages
from typing import Optional, List, Dict, Any

class OrderAgentState(TypedDict):
    user_query: str
    customer_id: str
    filters: Dict[str, Dict[str, Any]]
    order_result: Optional[Dict[str, Any]]