from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import case_router

app = FastAPI(title="AEGIS Mock Backend API")

# Configure CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(case_router.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "AEGIS Backend is running. Access /docs for Swagger UI."}
