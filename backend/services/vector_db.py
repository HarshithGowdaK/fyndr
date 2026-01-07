import faiss
import numpy as np
import json
import os

class VectorDBService:
    _instance = None
    INDEX_FILE = "index.faiss"
    METADATA_FILE = "metadata.json"
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorDBService, cls).__new__(cls)
            # Dimension based on CLIP vit-base-patch32 = 512
            cls._dimension = 512 
            cls._metadata = {} # Map Index ID -> Item Metadata
            cls._load_index(cls)
        return cls._instance

    def _load_index(self):
        """Loads index and metadata from disk if they exist."""
        if os.path.exists(self.INDEX_FILE) and os.path.exists(self.METADATA_FILE):
            try:
                self._index = faiss.read_index(self.INDEX_FILE)
                with open(self.METADATA_FILE, 'r') as f:
                    # JSON keys are strings, convert back to int
                    loaded_meta = json.load(f)
                    self._metadata = {int(k): v for k, v in loaded_meta.items()}
                print(f"Loaded FAISS Index with {self._index.ntotal} items.")
            except Exception as e:
                print(f"Error loading index: {e}. Starting fresh.")
                self._index = faiss.IndexFlatIP(self._dimension)
        else:
            print("No existing index found. Starting fresh.")
            self._index = faiss.IndexFlatIP(self._dimension)

    def _save_index(self):
        """Saves index and metadata to disk."""
        try:
            faiss.write_index(self._index, self.INDEX_FILE)
            with open(self.METADATA_FILE, 'w') as f:
                json.dump(self._metadata, f)
        except Exception as e:
            print(f"Error saving index: {e}")

    def add_item(self, vector: list[float], metadata: dict) -> int:
        """Adds an item to the index and returns its ID."""
        if len(vector) != self._dimension:
            raise ValueError(f"Vector dimension mismatch. Expected {self._dimension}, got {len(vector)}")
        
        vector_np = np.array([vector], dtype='float32')
        self._index.add(vector_np)
        
        idx_id = self._index.ntotal - 1
        self._metadata[idx_id] = metadata
        
        self._save_index()
        return idx_id

    def search(self, vector: list[float], top_k: int = 5):
        """Searches for similar items. Returns list of (metadata, score)."""
        if self._index.ntotal == 0:
            print("Warning: Index is empty. Returning empty results.")
            return []
            
        vector_np = np.array([vector], dtype='float32')
        
        # Debug Logging
        print(f"Searching index with {self._index.ntotal} items. Query Shape: {vector_np.shape}")
        
        try:
            D, I = self._index.search(vector_np, top_k)
        except Exception as e:
            print(f"CRITICAL: FAISS Search Failed: {e}")
            return []
        
        results = []
        for j in range(len(I[0])):
            idx = I[0][j]
            score = D[0][j]
            if idx != -1 and idx in self._metadata:
                results.append({
                    "metadata": self._metadata[idx],
                    "similarity_score": float(score)
                })
        print(f"Search found {len(results)} matches.")
        return results

vector_db = VectorDBService()
