from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="物理金融定时分析系统", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

from api_routes import data_router, analysis_router, config_router, reports_router, interpretation_router

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "物理金融分析系统运行正常"}

app.include_router(data_router, prefix="/api/data", tags=["数据"])
app.include_router(analysis_router, prefix="/api/analysis", tags=["分析"])
app.include_router(config_router, prefix="/api/config", tags=["配置"])
app.include_router(reports_router, prefix="/api/reports", tags=["报告"])
app.include_router(interpretation_router, prefix="/api/interpretation", tags=["解读"])

frontend_dir = os.path.join(BASE_DIR, "frontend", "dist")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)