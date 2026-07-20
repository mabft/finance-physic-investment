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


def generate_trading_strategy(metrics, daily_data, holding_impact, state, prices):
    """
    生成具体交易策略，包含买卖价格、止损止盈、仓位建议
    """
    current_price = daily_data.get("current_price", 0)
    cost_price = holding_impact.get("cost_price", 0)

    T = metrics.get("temperature", 0)
    H = metrics.get("entropy", 0)
    M = metrics.get("momentum", 0)
    Hurst = metrics.get("hurst", 0)

    if not prices or len(prices) < 20:
        return {"error": "价格数据不足"}

    recent_20 = prices[-20:]
    recent_60 = prices[-60:] if len(prices) >= 60 else prices

    ma5 = sum(prices[-5:]) / 5
    ma10 = sum(prices[-10:]) / 10
    ma20 = sum(recent_20) / len(recent_20)
    ma60 = sum(recent_60) / len(recent_60)

    recent_low = min(recent_20)
    recent_high = max(recent_20)
    support_1 = recent_low
    support_2 = round(recent_low * 0.97, 2)
    resistance_1 = recent_high
    resistance_2 = round(recent_high * 1.03, 2)

    strategy_type = ""
    buy_signals = []
    sell_signals = []
    stop_loss = 0
    take_profit = 0
    position_advice = ""
    entry_prices = []
    exit_prices = []

    if state == "BULL_TREND":
        strategy_type = "趋势跟随策略"
        buy_signals = [
            f"价格回调至 MA5 ({ma5:.2f}) 附近企稳",
            "动量 M > 0 且持续增强",
            "温度 T < 0.12（未过热）",
        ]
        sell_signals = [
            f"价格跌破 MA20 ({ma20:.2f}) 且无法收回",
            "动量 M 转负且持续走弱",
            "温度 T > 0.15（过热预警）",
        ]
        stop_loss = round(ma20 * 0.97, 2)
        take_profit = round(resistance_2, 2)
        entry_prices = [round(ma5 * 0.99, 2), round(ma5 * 1.01, 2)]
        exit_prices = [round(take_profit * 0.98, 2), round(take_profit, 2)]
        position_advice = "回调至 MA5 附近分批建仓，仓位系数 0.6-0.8x"

    elif state == "BEAR_TREND":
        strategy_type = "防御减仓策略"
        buy_signals = [
            f"价格反弹至 MA5 ({ma5:.2f}) 遇阻回落（做空信号）",
            "动量 M < -0.2 且持续走弱",
        ]
        sell_signals = [
            "持仓者逢反弹至 MA5 附近减仓",
            f"价格跌破前低 {recent_low:.2f} 加速下跌",
        ]
        stop_loss = round(resistance_2, 2)
        take_profit = round(support_2, 2)
        entry_prices = []
        exit_prices = [round(ma5 * 0.99, 2), round(ma5 * 1.01, 2)]
        position_advice = "反弹至 MA5 附近分批减仓，仓位降至 0.2x 以下"

    elif state == "SIDEWAYS":
        strategy_type = "区间震荡策略"
        buy_signals = [
            f"价格回落至支撑位 {support_1:.2f} 附近企稳",
            "熵 H > 3.0（高熵震荡）",
            "动量 M 接近 0（方向不明）",
        ]
        sell_signals = [
            f"价格反弹至阻力位 {resistance_1:.2f} 附近遇阻",
            "突破区间后跟随趋势",
        ]
        stop_loss = round(support_2, 2)
        take_profit = round(resistance_1, 2)
        entry_prices = [round(support_1 * 1.01, 2), round(support_1 * 1.03, 2)]
        exit_prices = [round(resistance_1 * 0.97, 2), round(resistance_1 * 0.99, 2)]
        position_advice = f"支撑位 {support_1:.2f} 附近买入，阻力位 {resistance_1:.2f} 附近卖出，仓位系数 0.3-0.5x"

    elif state == "CRISIS":
        strategy_type = "危机应对策略"
        buy_signals = [
            "等待市场企稳信号（连续 3 日不创新低）",
            "温度 T 从极值回落至 0.15 以下",
        ]
        sell_signals = [
            "立即减仓至最低仓位",
            f"设置严格止损，跌破 {support_2:.2f} 清仓",
        ]
        stop_loss = round(support_2, 2)
        take_profit = round(ma20, 2)
        entry_prices = []
        exit_prices = [round(current_price * 0.97, 2), round(current_price * 0.95, 2)]
        position_advice = "立即减仓至 0.1x 以下，保留现金等待企稳"

    elif state == "BULL_MEANREV":
        strategy_type = "牛市均值回归策略"
        buy_signals = [
            f"价格回调至 MA20 ({ma20:.2f}) 附近",
            "Hurst H < 0.5（均值回归特征）",
            "动量 M 从负值回升",
        ]
        sell_signals = [
            f"价格反弹至 MA60 ({ma60:.2f}) 附近",
            "动量 M > 0.2（短期过热）",
        ]
        stop_loss = round(ma20 * 0.95, 2)
        take_profit = round(ma60, 2)
        entry_prices = [round(ma20 * 0.99, 2), round(ma20 * 1.02, 2)]
        exit_prices = [round(ma60 * 0.97, 2), round(ma60 * 0.99, 2)]
        position_advice = f"MA20 附近 {ma20:.2f} 买入，MA60 附近 {ma60:.2f} 卖出，仓位系数 0.4-0.6x"

    elif state == "BEAR_MEANREV":
        strategy_type = "熊市反弹策略"
        buy_signals = [
            "超跌反弹信号：价格偏离 MA60 超过 10%",
            "仅适合短线操作",
        ]
        sell_signals = [
            f"反弹至 MA20 ({ma20:.2f}) 附近立即卖出",
            "持仓者逢高减仓",
        ]
        stop_loss = round(recent_low * 0.97, 2)
        take_profit = round(ma20, 2)
        entry_prices = [round(recent_low * 1.02, 2), round(recent_low * 1.05, 2)]
        exit_prices = [round(ma20 * 0.97, 2), round(ma20 * 0.99, 2)]
        position_advice = "仅短线参与，仓位不超过 0.2x，快进快出"

    elif state == "TRANSITION":
        strategy_type = "过渡期观望策略"
        buy_signals = [
            f"等待方向确认：突破 {resistance_1:.2f} 做多",
            f"或跌破 {support_1:.2f} 做空",
        ]
        sell_signals = [
            f"持仓者设置止损于 {support_2:.2f}",
            "突破失败立即离场",
        ]
        stop_loss = round(support_2, 2)
        take_profit = round(resistance_2, 2)
        entry_prices = [round(resistance_1 * 1.01, 2)]
        exit_prices = [round(support_1 * 0.97, 2)]
        position_advice = "观望为主，等待突破确认后轻仓参与，仓位系数 0.2-0.3x"

    return {
        "strategy_type": strategy_type,
        "current_price": round(current_price, 2),
        "ma5": round(ma5, 2),
        "ma10": round(ma10, 2),
        "ma20": round(ma20, 2),
        "ma60": round(ma60, 2),
        "support_1": round(support_1, 2),
        "support_2": support_2,
        "resistance_1": round(resistance_1, 2),
        "resistance_2": resistance_2,
        "criteria": {
            "买入条件": buy_signals,
            "卖出条件": sell_signals,
            "止损位": stop_loss,
            "止盈位": take_profit,
            "入场价格区间": entry_prices,
            "出场价格区间": exit_prices,
            "仓位建议": position_advice,
        },
        "indicators": {
            "temperature": round(T, 4),
            "entropy": round(H, 4),
            "momentum": round(M, 4),
            "hurst": round(Hurst, 4),
        },
    }


def combined_analysis(metrics, daily_data, holding_impact, state):
    """
    综合物理金融指标与当日行情数据的统一分析
    
    Args:
        metrics: 四维物理金融指标
        daily_data: 当日行情数据
        holding_impact: 持仓影响数据
        state: 市场状态
    
    Returns:
        dict with combined signals and recommendations
    """
    T = metrics.get("temperature", 0)
    H = metrics.get("entropy", 0)
    M = metrics.get("momentum", 0)
    Hurst = metrics.get("hurst", 0)
    
    change_pct = daily_data.get("change_pct", 0)
    profit_pct = holding_impact.get("profit_pct", 0)
    position_multiplier = holding_impact.get("position_multiplier", 1)
    
    # 长期趋势信号 (物理金融指标)
    long_term_signal = "neutral"
    long_term_strength = 0
    
    if state == "BULL_TREND":
        long_term_signal = "bullish"
        long_term_strength = 0.8
    elif state == "BULL_MEANREV":
        long_term_signal = "bullish"
        long_term_strength = 0.6
    elif state == "BEAR_TREND":
        long_term_signal = "bearish"
        long_term_strength = 0.8
    elif state == "BEAR_MEANREV":
        long_term_signal = "bearish"
        long_term_strength = 0.6
    elif state == "CRISIS":
        long_term_signal = "bearish"
        long_term_strength = 1.0
    elif state == "SIDEWAYS":
        long_term_signal = "neutral"
        long_term_strength = 0.3
    
    # 短期动量信号 (当日涨跌)
    short_term_signal = "neutral"
    short_term_strength = 0
    
    if change_pct > 2:
        short_term_signal = "bullish"
        short_term_strength = 0.9
    elif change_pct > 0.5:
        short_term_signal = "bullish"
        short_term_strength = 0.6
    elif change_pct < -2:
        short_term_signal = "bearish"
        short_term_strength = 0.9
    elif change_pct < -0.5:
        short_term_signal = "bearish"
        short_term_strength = 0.6
    
    # 综合信号
    combined_signal = "neutral"
    combined_score = 0
    
    if long_term_signal == short_term_signal:
        # 信号一致，强度叠加
        combined_signal = long_term_signal
        combined_score = (long_term_strength + short_term_strength) / 2
    else:
        # 信号冲突，取长期为主，短期为参考
        combined_signal = long_term_signal
        combined_score = long_term_strength * 0.7 + short_term_strength * 0.3
    
    # 生成综合建议
    recommendations = []
    
    # 1. 趋势判断
    if combined_signal == "bullish" and combined_score > 0.7:
        recommendations.append({
            "type": "trend",
            "icon": "📈",
            "title": "强势看多",
            "content": f"长期趋势向好 + 短期动能强劲，建议积极做多",
            "action": "加仓或持有",
            "priority": "high"
        })
    elif combined_signal == "bullish":
        recommendations.append({
            "type": "trend",
            "icon": "📊",
            "title": "温和看多",
            "content": f"长期趋势向好，短期有支撑",
            "action": "持有为主",
            "priority": "medium"
        })
    elif combined_signal == "bearish" and combined_score > 0.7:
        recommendations.append({
            "type": "trend",
            "icon": "📉",
            "title": "强势看空",
            "content": f"长期趋势走弱 + 短期下跌明显，建议防御",
            "action": "减仓或清仓",
            "priority": "high"
        })
    elif combined_signal == "bearish":
        recommendations.append({
            "type": "trend",
            "icon": "⚠️",
            "title": "温和看空",
            "content": f"长期趋势偏弱，注意风险",
            "action": "谨慎持有",
            "priority": "medium"
        })
    else:
        recommendations.append({
            "type": "trend",
            "icon": "↔️",
            "title": "中性观望",
            "content": f"趋势不明朗，等待方向确认",
            "action": "观望为主",
            "priority": "low"
        })
    
    # 2. 波动率建议
    if T > 0.15:
        recommendations.append({
            "type": "volatility",
            "icon": "🔴",
            "title": "极高波动",
            "content": f"温度 {T:.4f}，市场极度不稳定",
            "action": "降低仓位至 10% 以下",
            "priority": "high"
        })
    elif T > 0.08:
        recommendations.append({
            "type": "volatility",
            "icon": "🟠",
            "title": "高波动",
            "content": f"温度 {T:.4f}，风险加大",
            "action": "控制仓位在 40% 以内",
            "priority": "medium"
        })
    elif T < 0.03:
        recommendations.append({
            "type": "volatility",
            "icon": "🟢",
            "title": "低波动",
            "content": f"温度 {T:.4f}，市场稳定",
            "action": "可适度放大仓位",
            "priority": "low"
        })
    
    # 3. 持仓建议
    if profit_pct > 20:
        recommendations.append({
            "type": "position",
            "icon": "✅",
            "title": "盈利丰厚",
            "content": f"持仓盈利 {profit_pct:.2f}%",
            "action": "可部分止盈锁定利润",
            "priority": "medium"
        })
    elif profit_pct < -20:
        recommendations.append({
            "type": "position",
            "icon": "🔴",
            "title": "深度套牢",
            "content": f"持仓亏损 {profit_pct:.2f}%",
            "action": "评估是否止损或补仓摊薄",
            "priority": "high"
        })
    elif profit_pct < -10:
        recommendations.append({
            "type": "position",
            "icon": "️",
            "title": "明显亏损",
            "content": f"持仓亏损 {profit_pct:.2f}%",
            "action": "设置止损位，控制风险",
            "priority": "medium"
        })
    
    # 4. 操作时机建议 (结合短期涨跌)
    if combined_signal == "bullish" and change_pct < -1:
        recommendations.append({
            "type": "timing",
            "icon": "🎯",
            "title": "回调买入机会",
            "content": f"长期看多但今日回调 {change_pct:.2f}%",
            "action": "可逢低分批建仓",
            "priority": "high"
        })
    elif combined_signal == "bullish" and change_pct > 3:
        recommendations.append({
            "type": "timing",
            "icon": "⚠️",
            "title": "追高风险",
            "content": f"长期看多但今日已涨 {change_pct:.2f}%",
            "action": "等待回调再介入",
            "priority": "medium"
        })
    elif combined_signal == "bearish" and change_pct > 1:
        recommendations.append({
            "type": "timing",
            "icon": "🎯",
            "title": "反弹减仓机会",
            "content": f"长期看空但今日反弹 {change_pct:.2f}%",
            "action": "可逢高减仓",
            "priority": "high"
        })
    
    # 5. 仓位系数调整
    adjusted_multiplier = position_multiplier
    if combined_signal == "bullish" and combined_score > 0.7:
        adjusted_multiplier = min(position_multiplier * 1.2, 1.0)
    elif combined_signal == "bearish" and combined_score > 0.7:
        adjusted_multiplier = position_multiplier * 0.5
    
    recommendations.append({
        "type": "position_size",
        "icon": "📊",
        "title": "建议仓位",
        "content": f"基础仓位系数 {position_multiplier:.2f}x",
        "action": f"综合调整后 {adjusted_multiplier:.2f}x",
        "priority": "medium"
    })
    
    return {
        "combined_signal": combined_signal,
        "combined_score": round(combined_score, 2),
        "long_term_signal": long_term_signal,
        "long_term_strength": round(long_term_strength, 2),
        "short_term_signal": short_term_signal,
        "short_term_strength": round(short_term_strength, 2),
        "adjusted_multiplier": round(adjusted_multiplier, 2),
        "recommendations": recommendations,
    }


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
                impact_analysis.append(" 熊市趋势，建议谨慎持有或减仓")
            
            daily_data_obj = {
                "current_price": round(current_price, 4) if current_price else 0,
                "prev_close": round(prev_close, 4) if prev_close else 0,
                "open_price": round(open_price, 4) if open_price else 0,
                "high": round(high, 4) if high else 0,
                "low": round(low, 4) if low else 0,
                "change_amount": round(change_amount, 4),
                "change_pct": round(change_pct, 2),
                "daily_analysis": daily_analysis,
            }
            
            holding_impact_obj = {
                "cost_price": round(cost_price, 4) if cost_price else 0,
                "profit_amount": round(profit_amount, 4),
                "profit_pct": round(profit_pct, 2),
                "impact_analysis": impact_analysis,
                "position_multiplier": round(multiplier, 4),
            }
            
            combined = combined_analysis(metrics, daily_data_obj, holding_impact_obj, state["state_name"])
            
            # 生成交易策略
            trading_strategy = generate_trading_strategy(
                metrics, daily_data_obj, holding_impact_obj, state["state_name"], prices
            )
            
            # 获取消息面数据
            news_data = []
            news_summary = {
                "total": 0,
                "positive": 0,
                "negative": 0,
                "neutral": 0,
                "important": 0,
                "overall_sentiment": "neutral",
                "overall_label": "中性",
                "key_news": [],
            }
            
            try:
                raw_news = fetcher.fetch_stock_news(code, name, max_count=15)
                if raw_news:
                    analyzed_news = fetcher.analyze_news_sentiment(raw_news)
                    # 筛选：只显示利好、利空和重要消息
                    filtered_news = [
                        n for n in analyzed_news
                        if n["sentiment"] != "neutral" or n["importance"] != "normal"
                    ]
                    # 按重要程度和时效排序
                    filtered_news.sort(key=lambda x: (
                        0 if x["importance"] == "high" else 1 if x["importance"] == "medium" else 2,
                        0 if x["sentiment"] == "negative" else 1,
                    ), reverse=False)
                    
                    news_data = filtered_news[:10]
                    
                    pos = sum(1 for n in analyzed_news if n["sentiment"] == "positive")
                    neg = sum(1 for n in analyzed_news if n["sentiment"] == "negative")
                    neu = sum(1 for n in analyzed_news if n["sentiment"] == "neutral")
                    imp = sum(1 for n in analyzed_news if n["importance"] in ("high", "medium"))
                    
                    news_summary = {
                        "total": len(analyzed_news),
                        "positive": pos,
                        "negative": neg,
                        "neutral": neu,
                        "important": imp,
                        "overall_sentiment": "positive" if pos > neg else "negative" if neg > pos else "neutral",
                        "overall_label": "偏利好" if pos > neg else "偏利空" if neg > pos else "中性",
                        "key_news": [
                            {
                                "title": n["title"],
                                "sentiment_label": n["sentiment_label"],
                                "importance": n["importance"],
                                "date": n["date"],
                            }
                            for n in filtered_news[:5]
                        ],
                    }
            except Exception as e:
                print(f"Error fetching news for {name}: {e}")
            
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
                "daily_data": daily_data_obj,
                "holding_impact": holding_impact_obj,
                "combined_analysis": combined,
                "trading_strategy": trading_strategy,
                "news": {
                    "summary": news_summary,
                    "articles": news_data,
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