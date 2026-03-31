from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn
import os
from dotenv import load_dotenv

from services.analysis import EmotionDetector, IntentAnalyzer
from agents.manager import SwarmManager

load_dotenv()

app = FastAPI(title="OmniSwarm AI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

emotion_detector = EmotionDetector()
intent_analyzer = IntentAnalyzer()
swarm_manager = SwarmManager()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    user_id: str
    message: str
    history: List[Message] = []

class ChatResponse(BaseModel):
    response: str
    intent: str
    emotion: str
    domain: str
    active_agents: List[str]
    agent_insights: Dict[str, str] = {}
    metadata: dict = {}

@app.get("/")
async def root():
    return {"status": "online", "version": "2.0.0", "message": "OmniSwarm AI Backend Running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agents": 5, "model": os.getenv("MODEL_NAME", "tinyllama")}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        # 1. Emotion Detection
        emotion = await emotion_detector.detect(request.message)

        # 2. Intent & Domain Analysis
        analysis = await intent_analyzer.analyze(request.message)
        intent = analysis.get("intent", "General Query")
        domain = analysis.get("domain", "General")

        # 3. Context bundle
        context = {"emotion": emotion, "domain": domain, "intent": intent}

        # 4. Agent Selection (now emotion-aware)
        active_ids = await swarm_manager.select_agents(intent, domain, emotion)
        agent_names = [swarm_manager.agent_metadata[aid]["name"] for aid in active_ids]

        # 5. Fast Swarm Execution
        swarm_result = await swarm_manager.execute_swarm(request.message, active_ids, context)

        return {
            "response": swarm_result["response"],
            "intent": intent,
            "emotion": emotion,
            "domain": domain,
            "active_agents": agent_names,
            "agent_insights": swarm_result.get("agent_insights", {}),
            "metadata": {
                "session_id": request.user_id,
                "source": swarm_result.get("source", "unknown"),
                "agents_count": len(agent_names)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8001)))
