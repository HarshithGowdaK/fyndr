import os
# Fix for OMP: Error #15 (PyTorch/FAISS conflict on macOS)
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from fastapi import FastAPI
from services.firebase_service import initialize_firebase
from services.ai_service import ai_service # Trigger model load on startup
from contextlib import asynccontextmanager
from routers.items import router as items_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    initialize_firebase()
    # Ensure model is loaded (optional explicit call, or let lazy loading handle it)
    print("Backend initialized.")
    yield
    # Shutdown

app = FastAPI(title="Fyndr API", lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images statically
app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.include_router(items_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Fyndr API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
