from fastapi import APIRouter
from fastapi.responses import FileResponse
import os
from config import OUTPUT_DIR, BASE_DIR

router = APIRouter()


@router.get("/list")
async def list_reports():
    try:
        reports = []
        if os.path.exists(OUTPUT_DIR):
            for filename in sorted(os.listdir(OUTPUT_DIR), reverse=True):
                filepath = os.path.join(OUTPUT_DIR, filename)
                if os.path.isfile(filepath) and filename.endswith(".md"):
                    stat = os.stat(filepath)
                    report_type = "unknown"
                    if "pre_market" in filename:
                        report_type = "pre_market"
                    elif "midday" in filename:
                        report_type = "midday"
                    elif "after_market" in filename:
                        report_type = "after_market"
                    elif "dca_weekly" in filename:
                        report_type = "dca_weekly"
                    
                    date_str = filename.replace("pre_market_", "").replace("midday_", "").replace("after_market_", "").replace("dca_weekly_", "").replace(".md", "")
                    
                    reports.append({
                        "filename": filename,
                        "type": report_type,
                        "date": date_str,
                        "timestamp": stat.st_mtime
                    })
        return {"reports": reports}
    except Exception as e:
        return {"error": str(e)}, 500


@router.get("/content/{filename}")
async def get_report_content(filename: str):
    try:
        filepath = os.path.join(OUTPUT_DIR, filename)
        if not os.path.exists(filepath):
            return {"error": "报告文件不存在"}, 404
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        report_type = "unknown"
        if "pre_market" in filename:
            report_type = "盘前分析"
        elif "midday" in filename:
            report_type = "午盘分析"
        elif "after_market" in filename:
            report_type = "收盘分析"
        elif "dca_weekly" in filename:
            report_type = "定投周报"
        
        date_str = filename.replace("pre_market_", "").replace("midday_", "").replace("after_market_", "").replace("dca_weekly_", "").replace(".md", "")
        
        return {
            "content": content,
            "filename": filename,
            "type": report_type,
            "date": date_str
        }
    except Exception as e:
        return {"error": str(e)}, 500


@router.get("/download/{filename}")
async def download_report(filename: str):
    try:
        filepath = os.path.join(OUTPUT_DIR, filename)
        if not os.path.exists(filepath):
            return {"error": "报告文件不存在"}, 404
        
        return FileResponse(filepath, filename=filename)
    except Exception as e:
        return {"error": str(e)}, 500