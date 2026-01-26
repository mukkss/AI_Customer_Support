from langchain_core.messages import AnyMessage
from typing_extensions import TypedDict, Annotated
from langgraph.graph.message import add_messages
from typing import Optional, List, Dict

class AgentState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages()]
    user_query: str
    safe:   bool
    block_reason: Optional[str]
    intents : List[str]
    filters: Dict[str, str]
    clarification_needed : bool
    next_agent : Optional[str]

    knowledge_result: Optional[Dict[str, List[Dict[str, str]]]]