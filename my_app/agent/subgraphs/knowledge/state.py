from typing_extensions import TypedDict
from typing import Any, Optional, Dict


class KnowledgeState(TypedDict):
    user_query: str
    filters: Dict[str, Dict[str, Any]]
    knowledge_result: Optional[Dict[str, Any]]
    rag_success: bool