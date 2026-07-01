from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from physics_metrics import batch_analyze, compute_all_metrics, classify_market_state, screen_score, position_multiplier
from data_fetcher import DataFetcher
from report_generator import ReportGenerator
from main import AnalysisEngine

router = APIRouter()

engine = AnalysisEngine()


class AnalysisRequest(BaseModel):
    ticker_data: dict[str, list[float]]


@router.post("/compute")
async def compute_analysis(request: AnalysisRequest):
    try:
        results = batch_analyze(request.ticker_data)
        return {
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}, 500


@router.get("/all")
async def analyze_all():
    try:
        price_data = engine.fetcher.get_price_series_for_analysis()
        if not price_data:
            return {"error": "未能获取价格数据"}, 500
        
        raw_results = batch_analyze(price_data)
        
        results = []
        for name, data in raw_results.items():
            state_str = data.get("state", {}).get("state_name", "UNKNOWN")
            
            metrics = data.get("metrics", {})
            simple_metrics = {
                "temperature": metrics.get("temperature", 0),
                "entropy": metrics.get("entropy", 0),
                "momentum": metrics.get("momentum", 0),
                "hurst": metrics.get("hurst", 0),
            }
            
            prices = price_data.get(name, [])[-30:]
            
            results.append({
                "name": name,
                "metrics": simple_metrics,
                "state": state_str,
                "screen_score": data.get("screen_score", 0),
                "position_multiplier": data.get("position_multiplier", 1),
                "prices": prices,
            })
        
        return {
            "results": results,
            "price_data": price_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}, 500


@router.post("/trigger")
async def trigger_analysis(request_type: str):
    try:
        if request_type == "pre_market":
            report, filepath = engine.run_pre_market_analysis()
        elif request_type == "midday":
            report, filepath = engine.run_midday_analysis()
        elif request_type == "after_market":
            report, filepath = engine.run_after_market_analysis()
        elif request_type == "dca_weekly":
            report, filepath = engine.run_dca_weekly_analysis()
        else:
            return {"error": "未知分析类型"}, 400
        
        if report:
            return {
                "success": True,
                "message": f"{request_type}分析完成",
                "report_path": filepath,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {"success": False, "message": "分析失败"}, 500
    except Exception as e:
        return {"error": str(e)}, 500


@router.get("/metrics/{ticker_name}")
async def get_ticker_metrics(ticker_name: str):
    try:
        price_data = engine.fetcher.get_price_series_for_analysis()
        if ticker_name not in price_data:
            return {"error": f"未找到标的: {ticker_name}"}, 404
        
        prices = price_data[ticker_name]
        metrics = compute_all_metrics(prices)
        state = classify_market_state(metrics)
        score = screen_score(metrics)
        pos_mult = position_multiplier(metrics)
        
        state_str = state.get("state_name", "UNKNOWN") if isinstance(state, dict) else str(state)
        
        simple_metrics = {
            "temperature": metrics.get("temperature", 0),
            "entropy": metrics.get("entropy", 0),
            "momentum": metrics.get("momentum", 0),
            "hurst": metrics.get("hurst", 0),
        }
        
        return {
            "name": ticker_name,
            "metrics": simple_metrics,
            "state": state_str,
            "screen_score": score,
            "position_multiplier": pos_mult,
            "prices": prices[-30:],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}, 500