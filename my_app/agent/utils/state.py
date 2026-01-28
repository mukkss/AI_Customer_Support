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
    confidence: float
    clarification_needed: bool
    next_agent: Optional[str]
    escalate_to_human: bool
    escalation_reason: str | None
    clarification_count: int

    filters: Dict[str, Dict[str, Any]]
 
 
    knowledge_result: Optional[Dict[str, Any]]
    catalog_result: Optional[Dict[str, Any]]
    general_result: Optional[AnyMessage]
    order_result: Optional[Dict[str, Any]]