from fastapi import APIRouter
from datetime import datetime
from math import isnan

router = APIRouter()


def analyze_price_pattern(prices):
    if len(prices) < 10:
        return {"trend": "数据不足", "volatility": "数据不足", "momentum": "数据不足"}
    
    recent = prices[-30:]
    earlier = prices[-60:-30] if len(prices) >= 60 else prices[:30]
    
    recent_mean = sum(recent) / len(recent)
    earlier_mean = sum(earlier) / len(earlier)
    
    trend = "上升" if recent_mean > earlier_mean * 1.02 else "下降" if recent_mean < earlier_mean * 0.98 else "震荡"
    
    recent_std = (sum((p - recent_mean) ** 2 for p in recent) / len(recent)) ** 0.5
    volatility = recent_std / recent_mean if recent_mean > 0 else 0
    
    if volatility > 0.15:
        vol_level = "高波动"
    elif volatility > 0.08:
        vol_level = "中等波动"
    else:
        vol_level = "低波动"
    
    momentum = recent[-1] - recent[0]
    if momentum > 0:
        momentum_dir = "正动量"
    elif momentum < 0:
        momentum_dir = "负动量"
    else:
        momentum_dir = "中性"
    
    return {
        "trend": trend,
        "volatility": vol_level,
        "momentum": momentum_dir,
        "volatility_value": round(volatility, 4),
        "price_change": round(momentum, 4),
    }


def analyze_realtime_data(realtime):
    if not realtime:
        return {"status": "无实时数据"}
    
    open_p = realtime.get("open", 0)
    prev_close = realtime.get("prev_close", 0)
    current = realtime.get("current", 0)
    high = realtime.get("high", 0)
    low = realtime.get("low", 0)
    volume = realtime.get("volume", 0)
    
    if prev_close == 0:
        return {"status": "数据不足"}
    
    change = ((current - prev_close) / prev_close) * 100
    
    if change > 2:
        change_status = "大幅上涨"
    elif change > 0.5:
        change_status = "小幅上涨"
    elif change < -2:
        change_status = "大幅下跌"
    elif change < -0.5:
        change_status = "小幅下跌"
    else:
        change_status = "横盘整理"
    
    spread = ((high - low) / prev_close) * 100
    if spread > 3:
        spread_status = "宽幅震荡"
    elif spread > 1.5:
        spread_status = "正常波动"
    else:
        spread_status = "窄幅震荡"
    
    gap = ((open_p - prev_close) / prev_close) * 100
    if abs(gap) > 2:
        gap_status = "跳空"
    else:
        gap_status = "平开"
    
    return {
        "change": round(change, 2),
        "change_status": change_status,
        "spread": round(spread, 2),
        "spread_status": spread_status,
        "gap": round(gap, 2),
        "gap_status": gap_status,
        "current_price": current,
        "prev_close": prev_close,
        "open": open_p,
        "high": high,
        "low": low,
        "volume": volume,
    }


def interpret_metrics(metrics):
    if not metrics:
        return []
    
    interpretations = []
    
    temp = metrics.get("temperature", 0)
    if isnan(temp):
        temp = 0
    
    if temp > 0.2:
        interpretations.append(f"⚠️ 温度({temp:.4f})极高，市场处于极度恐慌或狂热状态，风险等级高")
    elif temp > 0.12:
        interpretations.append(f"⚡ 温度({temp:.4f})较高，市场波动明显加剧，需谨慎操作")
    elif temp > 0.05:
        interpretations.append(f"🌡️ 温度({temp:.4f})适中，市场处于正常波动范围")
    else:
        interpretations.append(f"❄️ 温度({temp:.4f})较低，市场波动平缓，适合观察等待")
    
    entropy = metrics.get("entropy", 0)
    if isnan(entropy):
        entropy = 0
    
    if entropy > 0.9:
        interpretations.append(f"🔀 熵({entropy:.4f})极高，市场无序程度大，难以预测")
    elif entropy > 0.7:
        interpretations.append(f"🧩 熵({entropy:.4f})较高，市场结构复杂，信号混杂")
    elif entropy > 0.5:
        interpretations.append(f"📊 熵({entropy:.4f})适中，市场有一定规律可循")
    else:
        interpretations.append(f"🎯 熵({entropy:.4f})较低，市场趋势清晰，信号明确")
    
    momentum = metrics.get("momentum", 0)
    if isnan(momentum):
        momentum = 0
    
    if momentum > 0.3:
        interpretations.append(f"🚀 动量({momentum:.4f})极强，上涨趋势明确，可顺势操作")
    elif momentum > 0.1:
        interpretations.append(f"📈 动量({momentum:.4f})较强，上升动能充足")
    elif momentum > -0.1:
        interpretations.append(f"⚖️ 动量({momentum:.4f})中性，方向不明，观望为宜")
    elif momentum > -0.3:
        interpretations.append(f"📉 动量({momentum:.4f})较弱，下跌动能显现")
    else:
        interpretations.append(f"💥 动量({momentum:.4f})极弱，下跌趋势明确，需减仓避险")
    
    hurst = metrics.get("hurst", 0)
    if isnan(hurst):
        hurst = 0
    
    if hurst > 0.7:
        interpretations.append(f"📈 Hurst指数({hurst:.4f})极高，趋势持续性强，可追随趋势")
    elif hurst > 0.5:
        interpretations.append(f"🔄 Hurst指数({hurst:.4f})偏高，存在一定趋势特征")
    elif hurst > 0.3:
        interpretations.append(f"⚖️ Hurst指数({hurst:.4f})接近随机游走，市场缺乏趋势")
    else:
        interpretations.append(f"🔀 Hurst指数({hurst:.4f})偏低，均值回归特征明显，可反向操作")
    
    return interpretations


def interpret_market_state(state):
    state_map = {
        "BULL_TREND": {
            "description": "牛市趋势",
            "characteristics": ["价格持续上涨", "波动率适中", "动量为正", "Hurst指数偏高"],
            "strategy": "积极做多，持有为主",
            "risk": "注意回调风险",
        },
        "BEAR_TREND": {
            "description": "熊市趋势",
            "characteristics": ["价格持续下跌", "波动率可能上升", "动量为负", "Hurst指数偏高"],
            "strategy": "减仓避险，观望为主",
            "risk": "下跌趋势可能持续",
        },
        "BULL_MEANREV": {
            "description": "牛市均值回归",
            "characteristics": ["价格在区间内波动", "波动率较低", "动量交替", "Hurst指数偏低"],
            "strategy": "高抛低吸，区间操作",
            "risk": "突破风险",
        },
        "BEAR_MEANREV": {
            "description": "熊市均值回归",
            "characteristics": ["价格在区间内波动但整体下行", "波动率适中", "动量交替向下", "Hurst指数偏低"],
            "strategy": "逢高减仓，谨慎操作",
            "risk": "破位风险",
        },
        "SIDEWAYS": {
            "description": "横盘震荡",
            "characteristics": ["价格区间波动", "波动率低", "动量中性", "Hurst指数接近0.5"],
            "strategy": "观望为主，等待方向",
            "risk": "方向选择风险",
        },
        "CRISIS": {
            "description": "危机状态",
            "characteristics": ["价格暴跌", "波动率急剧上升", "动量极负", "温度极高"],
            "strategy": "立即减仓，保全本金",
            "risk": "系统性风险",
        },
        "TRANSITION": {
            "description": "过渡状态",
            "characteristics": ["原有趋势减弱", "波动率变化", "动量反转", "信号混杂"],
            "strategy": "谨慎操作，等待确认",
            "risk": "假突破风险",
        },
    }
    
    return state_map.get(state, {
        "description": "未知状态",
        "characteristics": ["数据不足或异常"],
        "strategy": "观望等待",
        "risk": "数据风险",
    })


@router.get("/instrument/{code}")
async def interpret_instrument(code: str):
    from data_fetcher import DataFetcher
    
    try:
        fetcher = DataFetcher()
        
        if code.startswith('6') or code.startswith('5'):
            symbol = f"sh{code}"
        elif code.startswith('0') or code.startswith('3'):
            symbol = f"sz{code}"
        else:
            return {"error": "不支持的代码格式"}, 400
        
        prices = fetcher.fetch_sina_kline(symbol)
        realtime = fetcher.fetch_sina_realtime([symbol])
        
        if not prices or len(prices) < 30:
            return {"error": "无法获取足够的价格数据"}, 400
        
        price_pattern = analyze_price_pattern(prices)
        realtime_analysis = analyze_realtime_data(realtime.get(symbol, {}))
        
        return {
            "code": code,
            "price_pattern": price_pattern,
            "realtime": realtime_analysis,
            "price_sample": prices[-10:],
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"error": str(e)}, 500


@router.get("/analysis/{code}")
async def interpret_analysis(code: str):
    from physics_metrics import compute_all_metrics, classify_market_state, screen_score, position_multiplier
    from data_fetcher import DataFetcher
    
    try:
        fetcher = DataFetcher()
        
        if code.startswith('6') or code.startswith('5'):
            symbol = f"sh{code}"
        elif code.startswith('0') or code.startswith('3'):
            symbol = f"sz{code}"
        else:
            return {"error": "不支持的代码格式"}, 400
        
        prices = fetcher.fetch_sina_kline(symbol)
        
        if not prices or len(prices) < 60:
            return {"error": "无法获取足够的价格数据"}, 400
        
        metrics = compute_all_metrics(prices)
        state = classify_market_state(metrics)
        score = screen_score(metrics)
        multiplier = position_multiplier(metrics)
        
        interpretations = interpret_metrics(metrics)
        state_info = interpret_market_state(state["state_name"])
        
        return {
            "code": code,
            "metrics": {
                "temperature": round(metrics.get("temperature", 0), 4),
                "entropy": round(metrics.get("entropy", 0), 4),
                "momentum": round(metrics.get("momentum", 0), 4),
                "hurst": round(metrics.get("hurst", 0), 4),
            },
            "state": state["state_name"],
            "state_info": state_info,
            "interpretations": interpretations,
            "screen_score": score,
            "position_multiplier": round(multiplier, 4),
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"error": str(e)}, 500


@router.get("/all")
async def interpret_all():
    from api_routes.config import load_holdings
    from physics_metrics import compute_all_metrics, classify_market_state, screen_score, position_multiplier
    from data_fetcher import DataFetcher
    
    try:
        fetcher = DataFetcher()
        holdings = load_holdings()
        
        symbols = []
        code_to_symbol = {}
        for holding in holdings:
            code = holding.get("code", "")
            if not code:
                continue
            if code.startswith('6') or code.startswith('5'):
                symbol = f"sh{code}"
            elif code.startswith('0') or code.startswith('3'):
                symbol = f"sz{code}"
            else:
                continue
            symbols.append(symbol)
            code_to_symbol[code] = symbol
        
        realtime_data = {}
        if symbols:
            realtime_data = fetcher.fetch_sina_realtime(symbols)
        
        results = []
        for holding in holdings:
            code = holding.get("code", "")
            name = holding.get("name", "")
            cost_price = holding.get("cost_price", 0)
            
            if not code:
                continue
            
            symbol = code_to_symbol.get(code)
            if not symbol:
                continue
            
            prices = fetcher.fetch_sina_kline(symbol)
            
            if not prices or len(prices) < 60:
                continue
            
            metrics = compute_all_metrics(prices)
            state = classify_market_state(metrics)
            score = screen_score(metrics)
            multiplier = position_multiplier(metrics)
            
            interpretations = interpret_metrics(metrics)
            state_info = interpret_market_state(state["state_name"])
            
            rt = realtime_data.get(symbol, {})
            current_price = rt.get("current", 0)
            prev_close = rt.get("prev_close", 0)
            open_price = rt.get("open", 0)
            high = rt.get("high", 0)
            low = rt.get("low", 0)
            
            change_pct = 0
            change_amount = 0
            if prev_close > 0 and current_price > 0:
                change_amount = current_price - prev_close
                change_pct = (change_amount / prev_close) * 100
            
            profit_pct = 0
            profit_amount = 0
            if cost_price > 0 and current_price > 0:
                profit_amount = current_price - cost_price
                profit_pct = (profit_amount / cost_price) * 100
            
            daily_analysis = analyze_realtime_data(rt)
            
            impact_analysis = []
            if change_pct > 2:
                impact_analysis.append(f"📈 大涨{change_pct:.2f}%，持仓市值显著增加")
            elif change_pct > 0.5:
                impact_analysis.append(f"📊 上涨{change_pct:.2f}%，持仓小幅增值")
            elif change_pct < -2:
                impact_analysis.append(f"📉 大跌{change_pct:.2f}%，持仓市值明显缩水")
            elif change_pct < -0.5:
                impact_analysis.append(f"📊 下跌{change_pct:.2f}%，持仓小幅贬值")
            else:
                impact_analysis.append(f"➡️ 平盘整理，持仓市值基本持平")
            
            if profit_pct > 10:
                impact_analysis.append(f"✅ 持仓盈利{profit_pct:.2f}%，收益丰厚")
            elif profit_pct > 0:
                impact_analysis.append(f"✅ 持仓盈利{profit_pct:.2f}%，处于盈利状态")
            elif profit_pct > -10:
                impact_analysis.append(f" 持仓亏损{profit_pct:.2f}%，亏损可控")
            else:
                impact_analysis.append(f" 持仓亏损{profit_pct:.2f}%，亏损较大")
            
            if state == "CRISIS":
                impact_analysis.append("⚠️ 危机状态，建议考虑减仓止损")
            elif state == "BULL_TREND":
                impact_analysis.append(" 牛市趋势，可继续持有或加仓")
            elif state == "BEAR_TREND":
                impact_analysis.append("📉 熊市趋势，建议谨慎持有或减仓")
            
            results.append({
                "code": code,
                "name": name,
                "metrics": {
                    "temperature": round(metrics.get("temperature", 0), 4),
                    "entropy": round(metrics.get("entropy", 0), 4),
                    "momentum": round(metrics.get("momentum", 0), 4),
                    "hurst": round(metrics.get("hurst", 0), 4),
                },
                "state": state["state_name"],
                "state_info": state_info,
                "interpretations": interpretations,
                "screen_score": score,
                "position_multiplier": round(multiplier, 4),
                "daily_data": {
                    "current_price": round(current_price, 4) if current_price else 0,
                    "prev_close": round(prev_close, 4) if prev_close else 0,
                    "open_price": round(open_price, 4) if open_price else 0,
                    "high": round(high, 4) if high else 0,
                    "low": round(low, 4) if low else 0,
                    "change_amount": round(change_amount, 4),
                    "change_pct": round(change_pct, 2),
                    "daily_analysis": daily_analysis,
                },
                "holding_impact": {
                    "cost_price": round(cost_price, 4) if cost_price else 0,
                    "profit_amount": round(profit_amount, 4),
                    "profit_pct": round(profit_pct, 2),
                    "impact_analysis": impact_analysis,
                },
            })
            
            import time
            time.sleep(0.3)
        
        return {
            "results": results,
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"error": str(e)}, 500