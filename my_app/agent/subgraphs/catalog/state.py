from langchain_core.messages import AIMessage
from typing_extensions import TypedDict, Annotated
from langgraph.graph.message import add_messages
from typing import Any, Optional, List, Dict


class CatalogState(TypedDict):
    filters: Dict[str, Dict[str, Any]]
    catalog_result: Optional[Dict[str, Any]]