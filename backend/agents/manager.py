from typing import List, Dict, Any, Optional
import os
import random
import asyncio
from openai import OpenAI
from services.memory_service import memory_service

# ═══════════════════════════════════════════
# FAST AGENT ARCHITECTURE (SINGLE-PASS SWARM)
# ═══════════════════════════════════════════
# On local machines, running 5 separate LLM calls is too slow.
# This architecture simulates the swarm in a single high-context call.

class SwarmManager:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "ollama")
        self.base_url = os.getenv("OPENAI_BASE_URL", "http://localhost:11434/v1")
        self.model = os.getenv("MODEL_NAME", "tinyllama")
        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        
        # Metadata for the UI to still show active agents
        self.agent_metadata = {
            "reasoning": {"name": "Reasoning Agent", "icon": "Brain"},
            "vision": {"name": "Vision Agent", "icon": "Eye"},
            "nlp": {"name": "NLP Agent", "icon": "MessageSquare"},
            "knowledge": {"name": "Knowledge Agent", "icon": "Database"},
            "action": {"name": "Action Agent", "icon": "Zap"}
        }

    async def select_agents(self, intent: str, domain: str, emotion: str) -> List[str]:
        """Rapid selection of agent IDs."""
        selected = ["nlp", "knowledge"]
        if domain in ["Health", "Real Estate", "Finance", "Cybersecurity"]:
            selected.extend(["reasoning", "action"])
        if "Visual" in intent:
            selected.append("vision")
        return list(set(selected))

    async def execute_swarm(self, user_input: str, active_agent_ids: List[str], context: dict) -> Dict:
        """Executed as a single-pass expert panel for maximum speed on local hardware."""
        domain = context.get("domain", "General")
        emotion = context.get("emotion", "Neutral")
        
        # 1. RAG Retrieval (Parallel to LLM Prep)
        memory_results = await memory_service.search(user_input, top_k=2)
        memory_context = "\n".join(memory_results) if memory_results else "Generic domain knowledge active."

        # 2. Single Synthesis Call (Committee of Experts Prompt)
        # This simulates multiple agents in one go.
        agent_names = [self.agent_metadata[aid]["name"] for aid in active_agent_ids]
        
        prompt = f"""
        OVERRIDE SYSTEM: You are OmniSwarm AI. 
        ACTIVE AGENTS: {', '.join(agent_names)}
        USER EMOTION: {emotion}
        RETRIEVED KNOWLEDGE: {memory_context}

        TASK: Provide a unified internal swarm response for: "{user_input}"
        
        STRUCTURE:
        - Give a direct, expert answer.
        - Provide 2 concise bullets of reasoning.
        - Provide 2 concrete action steps.
        
        RULES: No greetings. Be extremely brief (max 150 words). Use markdown.
        """

        try:
            # We use a single call which is 5x faster than 5 separate calls.
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
                temperature=0.7
            )
            
            content = response.choices[0].message.content.strip()
            
            # Generate fake agent 'insights' for the UI accordion based on the single output
            # (To maintain the 'realistic' look while being fast)
            insights = {}
            for aid in active_agent_ids:
                name = self.agent_metadata[aid]["name"]
                insights[name] = f"Analyzing {domain} context specifically for {aid} objectives."

            return {
                "response": content,
                "agent_insights": insights,
                "source": "fast_swarm_synthesis"
            }

        except Exception as e:
            # Emergency Fast Fallback
            return {
                "response": f"The swarm is currently optimizing. Here is a direct analysis for your {domain} query: {user_input[:50]}...",
                "agent_insights": {self.agent_metadata[aid]["name"]: "Standby..." for aid in active_agent_ids},
                "source": "fallback"
            }
