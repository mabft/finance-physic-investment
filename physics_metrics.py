#!/usr/bin/env python3
"""
Physics-Finance Metrics Computation
四维物理金融指标计算模块

Metrics:
  1. Temperature T = σ²(annual) — annualized volatility squared
  2. Entropy H (bits) — Shannon entropy of log-returns distribution
  3. Momentum M — mean_return / std_return over lookback
  4. Hurst exponent — R/S analysis, Hurst > 0.55 = trending, < 0.45 = mean-reverting

Usage:
  from physics_metrics import compute_all_metrics
  results = compute_all_metrics(prices, lookback_days=60)
"""

import numpy as np
from scipy.stats import entropy as scipy_entropy


def compute_temperature(prices, annual_factor=252):
    """
    Temperature T = σ²(annual)
    
    Args:
        prices: array of closing prices
        annual_factor: trading days per year (252 for daily, 52 for weekly)
    
    Returns:
        T: temperature (annualized variance)
        annual_vol: annualized volatility (σ)
    """
    if len(prices) < 2:
        return None, None
    
    log_returns = np.diff(np.log(prices))
    daily_vol = np.std(log_returns, ddof=1)
    annual_vol = daily_vol * np.sqrt(annual_factor)
    T = annual_vol ** 2
    
    return T, annual_vol


def compute_entropy(prices, bins=10):
    """
    Entropy H = -Σ p_i · log₂(p_i) of log-returns distribution
    
    Args:
        prices: array of closing prices
        bins: number of histogram bins (default 10)
    
    Returns:
        H: Shannon entropy in bits
    """
    if len(prices) < bins:
        return None
    
    log_returns = np.diff(np.log(prices))
    if np.std(log_returns) == 0:
        return 0.0
    
    hist, _ = np.histogram(log_returns, bins=bins, density=True)
    hist = hist[hist > 0]
    hist = hist / np.sum(hist)
    
    H = scipy_entropy(hist, base=2)
    return H


def compute_momentum(prices, lookback=20):
    """
    Momentum M = mean_daily_return / std_daily_return over lookback
    
    Args:
        prices: array of closing prices
        lookback: number of days for momentum calculation
    
    Returns:
        M: momentum score
    """
    if len(prices) < lookback + 2:
        return None
    
    recent = prices[-(lookback + 1):]
    log_returns = np.diff(np.log(recent))
    
    mean_ret = np.mean(log_returns)
    std_ret = np.std(log_returns, ddof=1)
    
    if std_ret == 0:
        return 0.0
    
    M = mean_ret / std_ret
    return M


def compute_hurst(series, max_lag=None):
    """
    Hurst exponent via R/S analysis (rescaled range).
    
    Hurst > 0.55 → persistent (trending)
    Hurst ≈ 0.5 → random walk
    Hurst < 0.45 → anti-persistent (mean-reverting)
    
    Args:
        series: price series or return series
        max_lag: maximum lag for R/S calculation (default: min(len/2, 100))
    
    Returns:
        Hurst: Hurst exponent estimate
    """
    series = np.asarray(series)
    n = len(series)
    
    if n < 30:
        return None
    
    if max_lag is None:
        max_lag = min(n // 2, 100)
    
    if series[0] > 0 and np.all(series > 0):
        series = np.diff(np.log(series))
        n = len(series)
        if max_lag > n // 2:
            max_lag = n // 2
    
    lags = np.unique(np.logspace(np.log10(4), np.log10(min(max_lag, n // 2)), 15).astype(int))
    if len(lags) < 3:
        return 0.5
    
    rs_values = []
    for lag in lags:
        if lag < 2 or lag > n:
            continue
        num_sub = n // lag
        if num_sub < 2:
            continue
        
        rs_list = []
        for i in range(num_sub):
            sub = series[i * lag : (i + 1) * lag]
            if len(sub) < 2:
                continue
            mean_adj = sub - np.mean(sub)
            cum_dev = np.cumsum(mean_adj)
            R = np.max(cum_dev) - np.min(cum_dev)
            S = np.std(sub, ddof=1)
            if S > 0:
                rs_list.append(R / S)
        
        if rs_list:
            rs_values.append(np.mean(rs_list))
    
    if len(rs_values) < 3:
        return 0.5
    
    log_lags = np.log(lags[:len(rs_values)])
    log_rs = np.log(rs_values)
    
    slope, intercept = np.polyfit(log_lags, log_rs, 1)
    
    return slope


def compute_all_metrics(prices, lookback_days=60, bins=10):
    """
    Compute all four physics-finance metrics for a price series.
    
    Args:
        prices: array/list of closing prices (most recent last)
        lookback_days: number of recent days for T, H, M computation
        bins: histogram bins for entropy
    
    Returns:
        dict with keys: temperature, annual_vol, entropy, momentum, hurst,
                        temp_zone, entropy_zone, momentum_zone, hurst_zone
    """
    n = len(prices)
    if n < lookback_days:
        lookback = n
    else:
        lookback = lookback_days
    
    recent_prices = prices[-lookback:]
    
    T, annual_vol = compute_temperature(recent_prices)
    H = compute_entropy(recent_prices, bins=bins)
    M = compute_momentum(recent_prices, lookback=min(20, lookback - 1))
    Hurst = compute_hurst(prices)
    
    def classify_temp(t):
        if t is None: return "UNKNOWN", "⚪"
        if t > 0.15: return "CRITICAL", "🔴"
        if t > 0.08: return "WARNING", "🟠"
        if t > 0.03: return "CAUTION", "🟡"
        return "NORMAL", "🟢"
    
    def classify_entropy(h):
        if h is None: return "UNKNOWN", "⚪"
        if h > 2.5: return "CHAOTIC", "🔴"
        if h >= 1.5: return "UNCERTAIN", "🟡"
        return "ORDERED", "🟢"
    
    def classify_momentum(m):
        if m is None: return "UNKNOWN", "⚪"
        if m > 0.5: return "STRONG_UP", "🟢📈"
        if m > 0: return "MODERATE_UP", "🟡📈"
        if m >= -0.5: return "MODERATE_DOWN", "🟡📉"
        return "STRONG_DOWN", "🔴📉"
    
    def classify_hurst(hh):
        if hh is None: return "UNKNOWN", "⚪"
        if hh > 0.55: return "PERSISTENT", "📈"
        if hh >= 0.45: return "RANDOM", "🎲"
        return "ANTI_PERSISTENT", "📉"
    
    temp_zone, temp_icon = classify_temp(T)
    entropy_zone, entropy_icon = classify_entropy(H)
    momentum_zone, momentum_icon = classify_momentum(M)
    hurst_zone, hurst_icon = classify_hurst(Hurst)
    
    return {
        "temperature": round(T, 6) if T is not None else None,
        "annual_vol": round(annual_vol, 4) if annual_vol is not None else None,
        "entropy": round(H, 3) if H is not None else None,
        "momentum": round(M, 4) if M is not None else None,
        "hurst": round(Hurst, 4) if Hurst is not None else None,
        "temp_zone": temp_zone,
        "temp_icon": temp_icon,
        "entropy_zone": entropy_zone,
        "entropy_icon": entropy_icon,
        "momentum_zone": momentum_zone,
        "momentum_icon": momentum_icon,
        "hurst_zone": hurst_zone,
        "hurst_icon": hurst_icon
    }


def classify_market_state(metrics_dict):
    """
    Classify composite market state from four metrics.
    
    Args:
        metrics_dict: output from compute_all_metrics
    
    Returns:
        dict with state_name, state_icon, max_long_pct, dca_action, strategy
    """
    T = metrics_dict.get("temperature")
    H = metrics_dict.get("entropy")
    M = metrics_dict.get("momentum")
    Hurst = metrics_dict.get("hurst")
    
    if any(v is None for v in [T, H, M, Hurst]):
        return {"state_name": "INSUFFICIENT_DATA", "state_icon": "⚪",
                "max_long_pct": 50, "dca_action": "NORMAL", "strategy": "观望"}
    
    if T > 0.08 and H > 2.0:
        return {"state_name": "CRISIS", "state_icon": "🔴",
                "max_long_pct": 10, "dca_action": "PAUSE", "strategy": "现金+对冲+最小仓位"}
    if T > 0.15:
        return {"state_name": "CRISIS", "state_icon": "🔴",
                "max_long_pct": 10, "dca_action": "PAUSE", "strategy": "现金+对冲+最小仓位"}
    
    if T > 0.08:
        if M > 0:
            return {"state_name": "TRANSITION_BULL", "state_icon": "🟠📈",
                    "max_long_pct": 40, "dca_action": "REDUCE_30", "strategy": "谨慎做多+减仓"}
        else:
            return {"state_name": "BEAR_TREND", "state_icon": "🟠📉",
                    "max_long_pct": 20, "dca_action": "PAUSE", "strategy": "防御+现金为主"}
    
    if Hurst > 0.55:
        if M > 0:
            return {"state_name": "BULL_TREND", "state_icon": "📈",
                    "max_long_pct": 80, "dca_action": "NORMAL", "strategy": "趋势跟踪+持仓放大"}
        else:
            return {"state_name": "BEAR_TREND", "state_icon": "📉",
                    "max_long_pct": 20, "dca_action": "REDUCE_50", "strategy": "防御+现金为主"}
    
    elif Hurst < 0.45:
        if M > 0:
            return {"state_name": "BULL_MEANREV", "state_icon": "📈🔄",
                    "max_long_pct": 70, "dca_action": "ACCELERATE_ON_DIP", "strategy": "回调买入+均值回归"}
        else:
            return {"state_name": "BEAR_MEANREV", "state_icon": "📉🔄",
                    "max_long_pct": 30, "dca_action": "REDUCE_30", "strategy": "超卖反弹+严格止损"}
    
    else:
        if abs(M) < 0.15:
            return {"state_name": "SIDEWAYS", "state_icon": "↔️",
                    "max_long_pct": 50, "dca_action": "NORMAL", "strategy": "网格交易+横盘观望"}
        elif M > 0:
            return {"state_name": "TRANSITION_BULL", "state_icon": "⚡📈",
                    "max_long_pct": 50, "dca_action": "CAUTIOUS", "strategy": "等待趋势确认"}
        else:
            return {"state_name": "TRANSITION_BEAR", "state_icon": "⚡📉",
                    "max_long_pct": 30, "dca_action": "REDUCE_30", "strategy": "防御等待企稳"}


def screen_score(metrics_dict):
    """
    Compute screening score (0-100) for a stock/ETF based on physics metrics.
    
    Score ≥ 75 → Strong Buy candidate
    Score 60-74 → Watchlist
    Score < 60 → Skip
    """
    T = metrics_dict.get("temperature")
    H = metrics_dict.get("entropy")
    M = metrics_dict.get("momentum")
    Hurst = metrics_dict.get("hurst")
    
    if any(v is None for v in [T, H, M, Hurst]):
        return 50
    
    score = 0
    
    if M > 0.5: score += 25
    elif M > 0: score += 15
    elif M > -0.3: score += 5
    
    if Hurst > 0.55: score += 25
    elif Hurst > 0.45: score += 10
    elif Hurst < 0.45 and M < 0: score += 25
    
    if T < 0.03: score += 25
    elif T < 0.06: score += 15
    elif T < 0.10: score += 5
    
    if H < 1.5: score += 25
    elif H < 2.0: score += 15
    elif H < 2.5: score += 5
    
    return score


def position_multiplier(metrics_dict):
    """
    Compute position size multiplier based on temperature and entropy.
    
    Returns multiplier such that:
    AdjustedPosition = BasePosition * multiplier
    """
    T = metrics_dict.get("temperature")
    H = metrics_dict.get("entropy")
    
    if T is None or H is None:
        return 0.5
    
    if T > 0.15: t_mult = 0.1
    elif T > 0.08: t_mult = 0.4
    elif T > 0.06: t_mult = 0.6
    elif T > 0.03: t_mult = 0.8
    else: t_mult = 1.0
    
    if H >= 2.5: h_mult = 0.3
    elif H >= 2.0: h_mult = 0.6
    elif H >= 1.5: h_mult = 0.8
    else: h_mult = 1.0
    
    return round(t_mult * h_mult, 2)


def batch_analyze(ticker_data, lookback_days=60):
    """
    Analyze multiple tickers at once.
    
    Args:
        ticker_data: dict of {ticker_name: price_array}
        lookback_days: lookback window
    
    Returns:
        dict of {ticker_name: {metrics, state, score, position_mult}}
    """
    results = {}
    for name, prices in ticker_data.items():
        metrics = compute_all_metrics(prices, lookback_days)
        state = classify_market_state(metrics)
        score = screen_score(metrics)
        pos_mult = position_multiplier(metrics)
        
        results[name] = {
            "metrics": metrics,
            "state": state,
            "screen_score": score,
            "position_multiplier": pos_mult
        }
    
    return results


def format_metrics_table(results):
    """Generate markdown table of metrics for all tickers."""
    header = "| 标的 | 温度T | 熵H | 动量M | Hurst | 评分 | 市场状态 | 仓位系数 |"
    sep = "|------|-------|-----|-------|-------|------|----------|----------|"
    
    rows = []
    for name, data in results.items():
        m = data["metrics"]
        s = data["state"]
        row = (f"| {name} | {m['temperature'] or 'N/A'} | {m['entropy'] or 'N/A'} "
               f"| {m['momentum'] or 'N/A'} | {m['hurst'] or 'N/A'} "
               f"| {data['screen_score']} | {s['state_icon']} {s['state_name']} "
               f"| {data['position_multiplier']} |")
        rows.append(row)
    
    return "\n".join([header, sep] + rows)


def format_state_brief(state):
    """Generate one-line market state summary."""
    return (f"{state['state_icon']} **{state['state_name']}** — "
            f"策略: {state['strategy']} | "
            f"仓位上限: {state['max_long_pct']}% | "
            f"定投: {state['dca_action']}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python physics_metrics.py <price_arg>")
        print("  price_arg: comma-separated prices, e.g. '100,101,102,99,103'")
        sys.exit(1)
    
    prices = [float(x) for x in sys.argv[1].split(",")]
    
    metrics = compute_all_metrics(prices)
    state = classify_market_state(metrics)
    score = screen_score(metrics)
    pos_mult = position_multiplier(metrics)
    
    print(f"Price series: {len(prices)} data points")
    print(f"\n=== 四维指标 ===")
    print(f"温度 T: {metrics['temperature']} ({metrics['temp_icon']} {metrics['temp_zone']})")
    print(f"波动率 σ: {metrics['annual_vol']} (annual)")
    print(f"熵 H: {metrics['entropy']} bits ({metrics['entropy_icon']} {metrics['entropy_zone']})")
    print(f"动量 M: {metrics['momentum']} ({metrics['momentum_icon']} {metrics['momentum_zone']})")
    print(f"Hurst指数: {metrics['hurst']} ({metrics['hurst_icon']} {metrics['hurst_zone']})")
    
    print(f"\n=== 市场状态 ===")
    print(f"{state['state_icon']} {state['state_name']}")
    print(f"策略: {state['strategy']}")
    print(f"仓位上限: {state['max_long_pct']}%")
    print(f"定投操作: {state['dca_action']}")
    
    print(f"\n=== 筛选评分 ===")
    print(f"评分: {score}/100")
    print(f"建议: {'Strong Buy' if score >= 75 else 'Watchlist' if score >= 60 else 'Skip'}")
    print(f"仓位系数: {pos_mult}")