# Multi-Source Market Data Fetching: Fallback & Parallel Patterns

## When Yahoo Finance Rate-Limits

yfinance (Yahoo Finance API) imposes aggressive rate limiting from mainland China networks.
When it returns `YFRateLimitError('Too Many Requests')`, **do not retry in a loop** — the
rate limit is IP-based and persists for hours. Switch to alternative sources immediately.

## Tiered Data Sources by Market

| Market | Primary | Fallback 1 | Fallback 2 | Notes |
|--------|---------|------------|------------|-------|
| A-share indices | Sina hq API (`hq.sinajs.cn`) | Sina K-line API (`money.finance.sina.com.cn`) | akshare → legulegu (PE/PB) | GBK encoding; needs Referer header |
| A-share stocks | Sina hq API | Sina K-line API | East Money push2his | `sh{CODE}` or `sz{CODE}` prefix |
| US indices | CNBC quote API (`quote.cnbc.com`) | Sina intl endpoint (`int_ghvspc`) | Google Finance scrape | CNBC returns clean JSON |
| HK indices | CNBC | Sina `rt_hkHSI` | East Money `124.HSI` | HSTECH not on Sina |
| Japan/Korea | CNBC | Sina `b_NKY` / `b_KOSPI` | — | Nikkei 225 via CNBC is reliable |
| Gold ETFs | CNBC (GLD) | Sina US stock (`gb_gld`) | — | — |

## Sina Finance API Quick Reference

### Real-time (hq.sinajs.cn)
```
curl -s "https://hq.sinajs.cn/list=sh000001,sz399001,sh000300,sz399006" \
  -H "Referer: https://finance.sina.com.cn" | iconv -f GBK -t UTF-8
```
- A-share indices: `sh000001` (上证), `sz399001` (深证), `sh000300` (沪深300), `sz399006` (创业板)
- Field mapping: [0]=name, [1]=open, [2]=prev_close, [3]=current, [4]=high, [5]=low, [8]=volume(shares), [9]=amount(yuan)

### Historical K-line (money.finance.sina.com.cn)
```
curl -s "https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=sh000001&scale=240&ma=no&datalen=260" \
  -H "Referer: https://finance.sina.com.cn"
```
- `scale=240` = daily, `datalen` = number of bars
- Returns JSON array with day/open/high/low/close/volume fields
- For 52-week high/low: use `datalen=260` (~1 year of trading days)

## CNBC Quote API Pattern

```
curl -s "https://quote.cnbc.com/quote-json-webservice/restQuote/quoteData/quoteData.asp?symbols=.SPX%7C.IXIC%7C.DJI%7C.HSI%7C.N225%7C.KS11&requestMethod=quick&noform=1&partnerId=2&output=json"
```
Returns JSON with `quickQuoteResult.quickQuote` array containing `last`, `change_pct`, `fundamentalData.high52Week`, `fundamentalData.low52Week`.

## Parallel Fetching with delegate_task

When multiple market data sources are needed, use `delegate_task` with parallel tasks:

```
task 1 → A-share data via Sina APIs (terminal + web tools)
task 2 → Global market data via CNBC + Sina intl (terminal + web tools)
```

Each subagent works independently and returns structured JSON. Maximum 3 concurrent tasks. Provide
explicit API commands in the context — subagents cannot guess API endpoints.

## Physics Metrics Computation Pattern

> **Canonical reference**: `physics-finance-analysis` skill (§0-§4) — complete framework for four-dimensional market state classification, screening, timing, and position management. The formulas below are a quick-reference summary; use the skill for the full decision framework including market state matrices, scoring systems, and position sizing rules.

After fetching price data (daily close series), compute these metrics:

- **Temperature T = σ²(annual)**: Annualized volatility squared. T = (daily_returns.std() * sqrt(252))²
- **Entropy H (bits)**: Bin log-returns into 10 equal-width bins, compute Shannon entropy: H = -Σ p_i · log₂(p_i)
- **Hurst exponent H**: R/S analysis. H = log(R/S) / log(N)
- **Momentum score**: mean_daily_return / std_daily_return over lookback period
- **Temperature warning levels**:
  - T > 0.15 → CRITICAL (phase transition risk)
  - T > 0.08 → WARNING
  - T > 0.03 → CAUTION
  - T < 0.03 → NORMAL
- **Fractal dimension D2**: D2 ≈ 2 - H (Hurst). Literature values: S&P 500 ~2.1-2.5, SSE ~2.5-3.0

## Pitfalls

- **Sina uses GBK**: Always pipe through `iconv -f GBK -t UTF-8` in terminal, or use `.encode('latin1').decode('gbk')` in Python
- **CNBC 52-week data**: `high52Week` and `low52Week` fields may be missing for some symbols; fall back to K-line API
- **PE/PB for indices**: Not available from Sina. Use akshare → legulegu.com, or scrape from East Money
- **HSTECH (恒生科技)**: Not available on Sina. Use East Money `push2his` with `secid=124.HSTECH`
- **Rate limiting is per-IP**: Switching to a different ticker on yfinance doesn't help — all tickers are blocked
