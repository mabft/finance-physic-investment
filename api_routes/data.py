from fastapi import APIRouter
from datetime import datetime
from data_fetcher import DataFetcher

router = APIRouter()

fetcher = DataFetcher()


@router.get("/all")
async def get_all_data():
    try:
        all_data = fetcher.fetch_all_data()
        instruments = []
        
        for key, data in all_data.items():
            inst = {
                "code": key.replace("idx_", "").replace("us_", "").replace("hk_", ""),
                "name": data["name"],
                "type": data["type"],
            }
            
            if "prices" in data:
                inst["prices"] = data["prices"]
            
            if "realtime" in data:
                inst["realtime"] = data["realtime"]
            
            if "nav" in data:
                inst["nav"] = data["nav"]
            
            if "quote" in data:
                inst["quote"] = data["quote"]
            
            instruments.append(inst)
        
        return {
            "instruments": instruments,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}, 500


@router.get("/price_series")
async def get_price_series():
    try:
        price_data = fetcher.get_price_series_for_analysis()
        return {
            "price_data": price_data,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}, 500


@router.get("/funds")
async def get_fund_data():
    try:
        fund_data = fetcher.fetch_all_fund_data()
        funds = []
        for code, data in fund_data.items():
            funds.append({
                "code": code,
                "name": data["name"],
                "nav": data["nav"],
                "type": data["type"],
            })
        return {
            "funds": funds,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}, 500


@router.get("/global")
async def get_global_indices():
    try:
        global_data = fetcher.fetch_global_indices()
        indices = []
        for key, data in global_data.items():
            indices.append({
                "code": key.replace("us_", "").replace("hk_", ""),
                "name": data["name"],
                "type": data["type"],
                **data,
            })
        return {
            "indices": indices,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}, 500