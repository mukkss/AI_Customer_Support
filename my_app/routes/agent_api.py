from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import asyncio

from my_app.agent.router import run_agent

router = APIRouter(prefix="/agent", tags=["agent"])


class AgentRequest(BaseModel):
    user_query: str
    customer_id: str


@router.post("/run")
async def run_agent_endpoint(request: AgentRequest):
    try:
        result = await asyncio.to_thread(
            run_agent,
            request.user_query,
            request.customer_id,
        )

        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Agent execution failed"
        )
