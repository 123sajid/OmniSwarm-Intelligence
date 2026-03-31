import os
import json
import numpy as np
from typing import List, Dict, Optional

try:
    import faiss
    from sentence_transformers import SentenceTransformer
    HAS_FAISS = True
except ImportError:
    HAS_FAISS = False

class MemoryService:
    """Realistic RAG service using FAISS and local embeddings."""

    def __init__(self, memory_path: str = "memory/index.faiss"):
        self.memory_path = memory_path
        self.metadata_path = memory_path.replace(".faiss", "_meta.json")
        self.index = None
        self.metadata = []
        self.model = None

        if HAS_FAISS:
            try:
                self.model = SentenceTransformer('all-MiniLM-L6-v2')
                if os.path.exists(self.memory_path):
                    self.index = faiss.read_index(self.memory_path)
                    with open(self.metadata_path, 'r') as f:
                        self.metadata = json.load(f)
                else:
                    # Dimension for MiniLM-L6-v2 is 384
                    self.index = faiss.IndexFlatL2(384)
            except Exception as e:
                print(f"FAISS initialization error: {e}")
                self.index = None

    def add_knowledge(self, text: str, domain: str = "General"):
        """Indexes new knowledge into the vector store."""
        if not HAS_FAISS or not self.index:
            self.metadata.append({"text": text, "domain": domain})
            return

        try:
            embedding = self.model.encode([text])
            self.index.add(np.array(embedding).astype('float32'))
            self.metadata.append({"text": text, "domain": domain})
            
            # Persist
            faiss.write_index(self.index, self.memory_path)
            with open(self.metadata_path, 'w') as f:
                json.dump(self.metadata, f)
        except Exception as e:
            print(f"Error adding to memory: {e}")

    async def search(self, query: str, top_k: int = 2) -> List[str]:
        """Retrieves most relevant knowledge snippets."""
        if not HAS_FAISS or not self.index or not self.metadata:
            # Fallback to simple keyword matching
            query_lower = query.lower()
            results = [m["text"] for m in self.metadata if any(word in m["text"].lower() for word in query_lower.split())]
            return results[:top_k]

        try:
            embedding = self.model.encode([query])
            distances, indices = self.index.search(np.array(embedding).astype('float32'), top_k)
            
            # Filter valid indices and return corresponding metadata
            results = []
            for idx in indices[0]:
                if idx != -1 and idx < len(self.metadata):
                    results.append(self.metadata[idx]["text"])
            return results
        except Exception as e:
            print(f"Search error: {e}")
            return []

# Singleton instance
memory_service = MemoryService()
