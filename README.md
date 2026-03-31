# OmniSwarm AI 🧪✨
### **Next-Generation Multi-Agent Intelligence Platform**

OmniSwarm is a high-performance, autonomous agentic platform designed to synthesize complex information across multiple domains (Health, Finance, Real Estate, Tech, Disaster Response) in real-time. By leveraging a **concurrent swarm architecture**, localized **Ollama LLM inference**, and **FAISS-powered RAG memory**, OmniSwarm delivers precise, emotion-aware insights with extreme low latency.

---

## **🚀 Why OmniSwarm?**
Traditional LLMs often struggle with multi-domain complexity and situational nuance. OmniSwarm solves this by:
- **Domain Specialization**: Assigning each query to a "Committee of Experts" (NLP, Knowledge, Reasoning, Vision, Action agents).
- **Emotion-Aware Orchestration**: Detecting user sentiment and adjusting swarm behavior (e.g., prioritizing *Action* and *Reasoning* during distress).
- **Privacy First**: Running entirely on local hardware via **Ollama**, ensuring your data never leaves your infrastructure.
- **Persistent Intelligence**: Remembering past interactions through semantic memory (FAISS), not just raw history.

---

## **🛠️ High-Performance Architecture**
- **Single-Pass Swarm Execution**: Optimized for consumer GPUs, simulating 5 specialized agents in a single optimized inference pass.
- **Glassmorphic Decision Engine**: A data-dense React dashboard that visualizes agent reasoning, emotion radar, and swarm connection status.
- **RAG Memory Pipeline**: Semantic retrieval of localized facts to override generic model hallucinations.

---

## **🚥 How to Run (Local Deployment)**

### **1. Backend (FastAPI Swarm Engine)**
Ensure you have **Ollama** installed (running `tinyllama` or `llama3.1`).

```bash
cd backend
# Create and activate environment
python -m venv env
source env/bin/activate # or env\Scripts\activate on Windows

# Install high-performance dependencies
pip install -r requirements.txt
pip install faiss-cpu sentence-transformers

# Run the Swarm Agent Controller (Port 8001)
uvicorn main:app --host 0.0.0.0 --port 8001
```

### **2. Frontend (React Glassmorphic Dashboard)**
Ensure you have **Node.js** (v18+) installed.

```bash
cd frontend
# Install interactive UI dependencies
npm install

# Run the Dev Dashboard (Port 5176)
npm run dev -- --port 5176
```

---

## **🧭 Platform Navigation**
- **💬 Active Swarm**: Real-time interaction with the multi-agent committee.
- **🔍 Research Archives**: Universal search through past sessions with semantic filtering.
- **📊 Swarm Analytics**: Account stats showing which agents you've invoked most.
- **⚙️ Intelligence Settings**: Monitor backend health and clear swarm knowledge cache.

---

## **👨‍💻 Tech Stack**
- **Brain**: FastAPI (Python), Ollama (TinyLlama), OpenAI-compatible SDK.
- **Memory**: FAISS (Facebook AI), SentenceTransformers (MiniLM).
- **Interface**: React, Vite, Framer Motion (Animations), Lucide React (Icons), Axios.
- **Design**: Premium Glassmorphic Vanilla CSS (CSS Variables 2.0).

---

**Developed with 💜 by Antigravity AI**  
*v2.0.0 · Production Ready · Swarm Intelligence Platform*
