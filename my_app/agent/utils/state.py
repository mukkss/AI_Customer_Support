from langchain_core.messages import AnyMessage
from typing_extensions import TypedDict, Annotated
from langgraph.graph.message import add_messages
from typing import Optional, List, Dict, Any


class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages()]
    user_query: str

    # Supervisor decisions
    safe: bool
    block_reason: Optional[str]
    intents: List[str]
    clarification_needed: bool
    next_agent: Optional[str]

    filters: Dict[str, Dict[str, Any]]
 
 
    knowledge_result: Optional[Dict[str, Any]]
    catalog_result: Optional[Dict[str, Any]]
