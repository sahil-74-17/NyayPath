import os
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NyayPath ML Service",
    description="FastAPI service for issue categorization and urgency detection in NyayPath",
    version="1.0.0",
)

# Enable CORS for local client and server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    """Health check endpoint specified in PRD Section 9."""
    return {
        "status": "ok",
        "service": "nyaypath-ml-service",
        "milestone": "M0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
def root():
    return {
        "name": "NyayPath ML Service",
        "version": "1.0.0",
        "milestone": "M0",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app:app", host=host, port=port, reload=True)
