from fastapi import FastAPI
from my_app.routes import agent_api
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="My Agent API")

app.include_router(agent_api.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# uv run uvicorn my_app.main:app --host 0.0.0.0 --port 8000 --reload