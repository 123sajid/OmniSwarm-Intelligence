# OmniSwarm AI: Backend Intelligence Engine 🧬🧪
### **Autonomous Swarm Controller & Localized RAG Inference**

The backend is the brain of the **OmniSwarm AI** platform. It manages the **concurrent swarm orchestration**, performs the **Fast-Swarm synthesis**, and maintains the **Semantic RAG memory** using FAISS.

---

## **🚀 Central Intelligence Features**
- **Single-Pass Swarm Execution**: Consolidates 5 specialized agent personas into a single optimized LLM pass for maximum speed on consumer hardware.
- **Localized RAG Store**: Uses **FAISS-CPU** and **Sentence-Transformers** to retrieve domain-precise facts from a vector archive.
- **Emotion-Aware Logic**: Dynamically adjusts agent selection and synthesis based on a regex-based emotional meta-controller.
- **Asynchronous FastAPI architecture**: Optimized for high-concurrency requests and low-latency swarm handling.

---

## **🚥 Quick Start**
Ensure **Ollama** is running locally before starting.

```bash
# Set up Python environment
python -m venv env
source env/bin/activate # windows: env\Scripts\activate

# Install high-performance dependencies
pip install -r requirements.txt
pip install faiss-cpu sentence-transformers

# Launch Agent Swarm Controller (Port 8001)
uvicorn main:app --host 0.0.0.0 --port 8001
```

---

## **📂 Core Services**
- `agents/manager.py`: The **Swarm Orchestrator**. Handles the "Committee of Experts" logic and synthesis.
- `services/memory_service.py`: The **RAG Engine**. Manages the FAISS vector index and semantic retrieval.
- `services/analysis.py`: The **Meta-Controller**. Performs real-time intent, domain, and emotion detection.
- `main.py`: The **FastAPI Entrance**. Manages endpoints and async swarm distribution.

**Port Config**: 
- **8001** (Default Swarm Engine)
- **11434** (Ollama Backbone)
