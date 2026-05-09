from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import case_router
from routers import pmi_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    pmi_router.load_model()
    yield  # app runs here

app = FastAPI(
    title="AEGIS Backend API with PMI Prediction",
    description="Predict Postmortem Interval and serve AEGIS evidence graph.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(case_router.router, prefix="/api")
app.include_router(pmi_router.router, prefix="/pmi")

@app.get("/")
def read_root():
    return {"message": "AEGIS Backend is running. Access /docs for Swagger UI."}
