from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional
from services.ai_service import ai_service
from services.vector_db import vector_db
from services.ranking_service import ranking_service
import json

router = APIRouter(prefix="/items", tags=["items"])



@router.post("/report")
async def report_item(
    image: UploadFile = File(...),
    description: str = Form(...),
    lat: float = Form(...),
    lng: float = Form(...),
    contact_info: Optional[str] = Form(None),
    reporter_uid: Optional[str] = Form(None)
):
    """
    Report a found item.
    1. Embed image.
    2. Store in Vector DB.
    """
    image_bytes = await image.read()
    embedding = ai_service.generate_embedding(image_bytes)
    
    if not embedding:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")
    
    # Save Image to Disk
    import uuid
    import os
    
    file_extension = image.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/{unique_filename}"
    
    with open(file_path, "wb") as f:
        f.write(image_bytes)
    
    image_url = f"http://localhost:8000/static/{unique_filename}"

    metadata = {
        "description": description,
        "lat": lat,
        "lng": lng,
        "filename": image.filename,
        "image_url": image_url,
        "contact_info": contact_info,
        "reporter_uid": reporter_uid
    }
    
    item_id = vector_db.add_item(embedding, metadata)
    
    return {"status": "success", "item_id": item_id, "metadata": metadata}

@router.post("/search")
async def search_item(
    image: UploadFile = File(...),
    description: Optional[str] = Form(None),
    lat: float = Form(...),
    lng: float = Form(...)
):
    """
    Search for lost item.
    1. Embed query image.
    2. Search Vector DB.
    3. If description provided, re-rank using Text-Text similarity.
    4. Re-rank results with Geospatial logic.
    """
    image_bytes = await image.read()
    embedding = ai_service.generate_embedding(image_bytes)
    
    if not embedding:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")
        
    # Generate Text Embedding for Query Description if provided
    query_text_emb = []
    if description:
        print(f"Generating embedding for query description: {description}")
        query_text_emb = ai_service.generate_text_embedding(description)

    # Get top 20 visually similar (fetch more to re-rank better)
    raw_results = vector_db.search(embedding, top_k=20)
    
    # Re-rank
    ranked_results = []
    for res in raw_results:
        # Distance Score
        dist = ranking_service.haversine_distance(
            lat, lng, 
            res['metadata']['lat'], res['metadata']['lng']
        )
        
        # Text Score
        text_score = 0.0
        if query_text_emb and res['metadata'].get('description'):
            # Ideally we should cache these item text embeddings too, but for MVP we compute on fly or ignore
            # Generating embeddings on the fly for 20 items might be slow...
            # OPTIMIZATION: Just do it for now. It's CPU bound but maybe OK for demo.
            # actually better to just rely on visual similarity unless we stored text embeddings.
            # We didn't store text embeddings in vector_db.add_item(). 
            # So we have to generate them now from the raw text metadata.
            
            # Note: This is computationally expensive (running model inference 20 times).
            # But let's support it for the feature request.
            item_desc = res['metadata']['description']
            item_text_emb = ai_service.generate_text_embedding(item_desc)
            text_score = ranking_service.calculate_cosine_similarity(query_text_emb, item_text_emb)
        
        hybrid_score = ranking_service.calculate_hybrid_score(
            res['similarity_score'], dist, text_score
        )
        res['distance_km'] = dist
        res['hybrid_score'] = hybrid_score
        ranked_results.append(res)
    
    # Sort by hybrid score
    ranked_results.sort(key=lambda x: x['hybrid_score'], reverse=True)
    
    # Return top 10
    return ranked_results[:10]

from pydantic import BaseModel

class FeedbackRequest(BaseModel):
    item_id: str
    feedback: str # "positive" or "negative"
    query_id: Optional[str] = None

@router.post("/feedback")
async def log_feedback(request: FeedbackRequest):
    """
    Log user feedback for search results.
    """
    # In a real system, we'd store this in a database to retrain models.
    # For now, we just print it.
    print(f"FEEDBACK RECEIVED: Item={request.item_id}, Feedback={request.feedback}")
    return {"status": "success", "message": "Feedback logged"}
