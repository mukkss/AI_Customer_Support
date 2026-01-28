from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import uuid

from my_app.agent.router import run_agent

router = APIRouter(prefix="/agent", tags=["agent"])

class AgentRequest(BaseModel):
    user_query: str
    thread_id: str | None = None

@router.post("/run")
def run_agent_endpoint(request: AgentRequest):
    try:
        thread_id = request.thread_id or str(uuid.uuid4())
        response = run_agent(request.user_query, thread_id = thread_id)

        return {
            "answer": response
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))