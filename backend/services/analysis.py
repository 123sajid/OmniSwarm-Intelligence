import re
import random
from typing import Dict

class EmotionDetector:
    """Rule-based emotion detection with keyword analysis and scoring."""

    EMOTION_PATTERNS = {
        "Panic": {
            "keywords": ["help", "emergency", "urgent", "fire", "flood", "attack", "hack", "breach",
                         "dying", "danger", "critical", "immediately", "asap", "sos", "crisis",
                         "earthquake", "tornado", "shooting", "explosion", "threat"],
            "patterns": [r"help\s*me", r"what\s+do\s+i\s+do", r"i\s+don'?t\s+know\s+what",
                         r"please\s+help", r"someone\s+help", r"need\s+help\s+now"],
            "weight": 1.5
        },
        "Confusion": {
            "keywords": ["confused", "don't understand", "what is", "how does", "explain",
                         "unclear", "lost", "unsure", "not sure", "what do you mean",
                         "complicated", "overwhelmed", "stuck", "struggling", "difficult"],
            "patterns": [r"i\s+don'?t\s+(get|understand)", r"what\s+does\s+.+\s+mean",
                         r"can\s+you\s+explain", r"i'?m\s+(so\s+)?confused", r"i'?m\s+not\s+sure"],
            "weight": 1.3
        },
        "Confidence": {
            "keywords": ["i know", "clearly", "obviously", "definitely", "certainly",
                         "i want", "i need", "specifically", "exactly", "precisely",
                         "compare", "versus", "analysis", "optimize", "strategy"],
            "patterns": [r"i\s+want\s+to", r"show\s+me", r"give\s+me",
                         r"i\s+need\s+a", r"let'?s\s+(do|build|create)"],
            "weight": 1.2
        },
    }

    async def detect(self, text: str) -> str:
        text_lower = text.lower().strip()

        if len(text_lower) < 3:
            return "Neutral"

        scores = {"Panic": 0, "Confusion": 0, "Confidence": 0, "Neutral": 0.3}

        for emotion, config in self.EMOTION_PATTERNS.items():
            for kw in config["keywords"]:
                if kw in text_lower:
                    scores[emotion] += 1.0 * config["weight"]
            for pattern in config["patterns"]:
                if re.search(pattern, text_lower):
                    scores[emotion] += 2.0 * config["weight"]

        # Exclamation marks boost panic
        scores["Panic"] += text.count("!") * 0.5
        # Question marks boost confusion
        scores["Confusion"] += text.count("?") * 0.4
        
        # Determine best emotion
        best_emotion = max(scores, key=scores.get)
        return best_emotion


class IntentAnalyzer:
    """Rule-based intent classification and domain detection."""

    INTENT_MAP = {
        "Advice": ["should i", "recommend", "suggest", "advice", "what would you", "best way",
                    "tips", "guidance", "opinion", "thoughts on"],
        "Information Seeking": ["what is", "how does", "explain", "tell me about", "describe",
                                "define", "meaning of", "who is", "when did", "why does"],
        "Task Execution": ["create", "build", "generate", "write", "make", "set up", "configure",
                           "deploy", "install", "run", "execute", "automate", "send", "schedule"],
        "Analysis": ["analyze", "compare", "evaluate", "assess", "review", "audit", "inspect",
                     "diagnose", "investigate", "examine", "benchmark", "measure"],
    }

    DOMAIN_MAP = {
        "Health": ["health", "medical", "doctor", "symptom", "disease", "medicine", "hospital",
                   "blood", "pain", "diagnosis", "treatment", "mental health", "anxiety",
                   "depression", "fitness", "diet", "nutrition", "vaccine", "surgery"],
        "Real Estate": ["house", "property", "real estate", "apartment", "rent", "buy", "mortgage",
                        "land", "building", "construction", "home loan", "broker", "tenant",
                        "lease", "neighborhood", "location", "square feet", "bedroom"],
        "Tech": ["code", "programming", "software", "api", "server", "database", "cloud",
                 "python", "javascript", "react", "ai", "machine learning", "algorithm",
                 "deploy", "devops", "kubernetes", "docker", "framework"],
        "Disaster": ["earthquake", "flood", "hurricane", "tornado", "fire", "tsunami",
                     "evacuation", "rescue", "relief", "emergency", "natural disaster",
                     "storm", "landslide", "drought", "wildfire"],
        "Finance": ["money", "invest", "stock", "crypto", "bank", "loan", "budget", "tax",
                    "savings", "portfolio", "trading", "market", "revenue", "profit", "expense"],
        "Cybersecurity": ["hack", "breach", "phishing", "malware", "firewall", "vulnerability",
                          "encryption", "threat", "cyber", "ransomware", "security", "password"],
    }

    async def analyze(self, text: str) -> dict:
        text_lower = text.lower().strip()

        # Intent detection
        intent_scores = {}
        for intent, keywords in self.INTENT_MAP.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                intent_scores[intent] = score

        detected_intent = max(intent_scores, key=intent_scores.get) if intent_scores else "General Query"

        # Domain detection
        domain_scores = {}
        for domain, keywords in self.DOMAIN_MAP.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > 0:
                domain_scores[domain] = score

        detected_domain = max(domain_scores, key=domain_scores.get) if domain_scores else "General"

        return {
            "intent": detected_intent,
            "domain": detected_domain
        }
