from transformers import CLIPProcessor, CLIPModel
import torch
from PIL import Image
import io

class AIService:
    _instance = None
    _model = None
    _processor = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIService, cls).__new__(cls)
            print("Loading CLIP Model (this may take a moment)...")
            cls._model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            cls._processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
            print("CLIP Model Loaded.")
        return cls._instance

    def generate_embedding(self, image_bytes: bytes) -> list[float]:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            inputs = self._processor(images=image, return_tensors="pt")
            
            with torch.no_grad():
                image_features = self._model.get_image_features(**inputs)
            
            # Normalize the features
            image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
            return image_features[0].tolist()
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return []

    def generate_text_embedding(self, text: str) -> list[float]:
        try:
            inputs = self._processor(text=[text], return_tensors="pt", padding=True)
            with torch.no_grad():
                text_features = self._model.get_text_features(**inputs)
            
            # Normalize
            text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
            return text_features[0].tolist()
        except Exception as e:
            print(f"Error generating text embedding: {e}")
            return []

ai_service = AIService()
