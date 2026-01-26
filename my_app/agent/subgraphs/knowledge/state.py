from langchain_core.messages import AIMessage
from typing_extensions import TypedDict, Annotated
from langgraph.graph.message import add_messages
from typing import Optional, List, Dict


class KnowledgeState(TypedDict):
    messages: Annotated[list[AIMessage], add_messages()]
    user_query: str
    filters: Dict[str, str]
    knowledge_result: Optional[Dict[str, List[Dict[str, str]]]]