from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import json
import os
from config import PORTFOLIO, INSTRUMENTS, BASE_DIR

router = APIRouter()

CONFIG_FILE = os.path.join(BASE_DIR, "config", "holdings.json")


class Holding(BaseModel):
    code: str
    name: str
    cost_price: float
    quantity: int
    is_dca: bool = False


def load_holdings():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get("holdings", [])
    return []


def save_holdings(holdings):
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump({"holdings": holdings}, f, ensure_ascii=False, indent=2)
    return True


def get_instrument_name(code: str) -> str:
    for category, items in INSTRUMENTS.items():
        for item in items:
            if item.get("code") == code:
                return item.get("name", "")
    return ""


@router.get("/holdings")
async def get_holdings():
    holdings = load_holdings()
    if not holdings:
        holdings = [
            {"code": code, "name": get_instrument_name(code), "cost_price": info["cost_price"], 
             "quantity": info["quantity"], "is_dca": info["is_dca"]}
            for code, info in PORTFOLIO.items()
        ]
        save_holdings(holdings)
    else:
        for holding in holdings:
            if not holding.get("name"):
                holding["name"] = get_instrument_name(holding["code"])
    return {"holdings": holdings}


@router.post("/holdings")
async def update_holdings(holdings: List[Holding]):
    try:
        holdings_list = [h.dict() for h in holdings]
        save_holdings(holdings_list)
        return {"success": True, "message": "持仓配置已更新"}
    except Exception as e:
        return {"success": False, "message": str(e)}, 500


@router.post("/holdings/add")
async def add_holding(holding: Holding):
    try:
        holdings = load_holdings()
        existing = next((h for h in holdings if h["code"] == holding.code), None)
        if existing:
            return {"success": False, "message": "该标的已存在"}, 400
        
        holdings.append(holding.dict())
        save_holdings(holdings)
        return {"success": True, "message": "标的添加成功"}
    except Exception as e:
        return {"success": False, "message": str(e)}, 500


@router.put("/holdings/{code}")
async def edit_holding(code: str, holding: Holding):
    try:
        holdings = load_holdings()
        index = next((i for i, h in enumerate(holdings) if h["code"] == code), None)
        if index is None:
            return {"success": False, "message": "标的不存在"}, 404
        
        holdings[index] = holding.dict()
        save_holdings(holdings)
        return {"success": True, "message": "标的更新成功"}
    except Exception as e:
        return {"success": False, "message": str(e)}, 500


@router.delete("/holdings/{code}")
async def delete_holding(code: str):
    try:
        holdings = load_holdings()
        holdings = [h for h in holdings if h["code"] != code]
        save_holdings(holdings)
        return {"success": True, "message": "标的删除成功"}
    except Exception as e:
        return {"success": False, "message": str(e)}, 500


@router.get("/instruments")
async def get_instruments():
    return {"instruments": INSTRUMENTS}


@router.get("/search_instrument/{keyword}")
async def search_instrument(keyword: str):
    results = []
    for category, items in INSTRUMENTS.items():
        for item in items:
            if keyword.lower() in item.get("code", "").lower() or keyword.lower() in item.get("name", "").lower():
                results.append({
                    "code": item["code"],
                    "name": item["name"],
                    "type": category,
                    "prefix": item.get("prefix", ""),
                })
    return {"results": results}