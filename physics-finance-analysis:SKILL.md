---
name: physics-finance-analysis
title: Physics-Finance Market State Analysis
description: Four-dimensional market state identification (temperature, entropy, momentum, Hurst) with physics-finance based investment screening, buy/sell timing, and position management. Applied to daily pre-market, intraday, and post-market analysis.
domain: research
tags:
  - physics-finance
  - market-state
  - temperature
  - entropy
  - momentum
  - hurst
  - position-management
  - econophysics
triggers:
  - user asks about physics-finance analysis
  - user asks about market state identification
  - user asks about temperature/entropy/momentum/Hurst metrics
  - cron job execution for daily analysis
  - user asks about econophysics-based screening
  - user asks about physics-based position management
---

# Physics-Finance Market State Analysis

Comprehensive physics-finance analysis framework for daily market state identification, investment screening, buy/sell timing, and position management.

---

## §0. Metric Computation (Mandatory First Step)

### Data Requirements

| Metric | Min Data Points | Ideal | Frequency | Priority Markets |
|--------|- -----|-------|-----------|------------------|
| Temperature (T) | 20 days | 60 days | Daily | All monitored |
| Entropy (H) | 50 days | 120 days | Daily | All monitored |
| Momentum (M) | 20 days | 60 days | Daily | All monitored |
| Hurst (Hurst) | 100 days | 252 days | Daily | Major indices + holdings |

### Source Rules

- **A-share indices & stocks**: Sina Finance hq API (`hq.sinajs.cn`) for real-time, Sina K-line API for historical
- **HK market**: Sina `rt_hkHSI` for HSI, East Money `push2his` with `secid=124.HSTECH` for HSTECH
- **US market**: CNBC quote API (`quote.cnbc.com`) for S&P500/Nasdaq/Dow
- **Gold/Commodities**: CNBC for GLD, Sina US stock for individual
- **ETF NAV**: `fundgz.1234567.com.cn` for latest NAV, Sina for real-time price
- **Forex**: CNBC API or Sina international endpoint

### Computation Code Reference

See `references/physics-metrics-computation.py` for complete Python implementation.

**Key formulas (summary)**:

**Temperature T = σ²(annual)**:
```
daily_returns = log(close / prev_close)
annual_vol = daily_returns.std() * sqrt(252)
T = annual_vol ** 2
```

**Entropy H (bits)**:
```
bin log-returns into 10 equal-width bins
p = bin_counts / total_samples
H = -sum(p * log2(p)) where p > 0
```

**Momentum M**:
```
M = mean_daily_return / std_daily_return over lookback
```

**Hurst exponent**:
```
R/S analysis: log(R/S) vs log(N), slope = Hurst
```

**Fractal dimension D₂ (optional)**:
```
D₂ ≈ 2 - Hurst
```

---

## §1. Market State Classification (四维状态判定)

### 1.1 Individual Metric Thresholds

#### Temperature T = σ²(annual)
| Zone | Range | Label | Market Behavior |
|------|-------|-------|----------------|
| CRITICAL | T > 0.15 | 🔴 高温 | Phase transition risk — extreme caution |
| WARNING | T > 0.08 | 🟠 偏热 | Elevated volatility — reduce exposure |
| CAUTION | T > 0.03 | 🟡 温和 | Normal-moderate — standard sizing |
| NORMAL | T ≤ 0.03 | 🟢 正常 | Low volatility — can increase positions |

#### Entropy H (bits, 10-bin Shannon)
| Zone | Range | Label | Predictability |
|------|-------|-------|---------------|
| CHAOTIC | H > 2.5 | 🔴 混沌 | Highly unpredictable — stay out or minimal |
| UNCERTAIN | 1.5 ≤ H ≤ 2.5 | 🟡 不确定 | Moderate predictability |
| ORDERED | H < 1.5 | 🟢 有序 | High predictability — trend/mean-reversion effective |

#### Momentum M (mean_return / std_return, 20-day)
| Zone | Range | Label | Direction |
|------|-------|-------|-----------|
| STRONG_UP | M > 0.5 | 🟢📈 强升 | Strong upward trend |
| MODERATE_UP | 0 < M ≤ 0.5 | 🟡📈 弱升 | Moderate upward |
| MODERATE_DOWN | -0.5 ≤ M < 0 | 🟡📉 弱降 | Moderate downward |
| STRONG_DOWN | M < -0.5 | 🔴📉 强降 | Strong downward trend |

#### Hurst Exponent H
| Zone | Range | Label | Regime |
|------|-------|-------|--------|
| PERSISTENT | Hurst > 0.55 | 📈 趋势持续 | Trend-following effective |
| RANDOM | 0.45 ≤ Hurst ≤ 0.55 | 🎲 随机游走 | Unpredictable — reduce directional bets |
| ANTI-PERSISTENT | Hurst < 0.45 | 📉 均值回归 | Mean-reversion strategies effective |

### 1.2 Composite Market State Matrix

Combine all four into a single market state:

| Code | Temperature | Entropy | Momentum | Hurst | State Name | Dominant Strategy |
|------|------------|---------|----------|-------|------------|-------------------|
| BULL_TREND | ≤0.08 | ≤2.0 | >0 | >0.55 | 📈 牛市趋势 | 趋势跟踪+持仓放大 |
| BULL_MEANREV | ≤0.06 | ≤2.0 | >0 | <0.45 | 📈🔄 牛市中继 | 回调买入+均值回归 |
| SIDEWAYS | ≤0.03 | 1.5-2.5 | ~0 | 0.45-0.55 | ↔️ 横盘震荡 | 网格交易+期权卖权 |
| BEAR_MEANREV | ≤0.06 | ≤2.0 | <0 | <0.45 | 📉🔄 熊市反弹 | 超卖反弹+严格止损 |
| BEAR_TREND | ≤0.08 | ≤2.5 | <0 | >0.55 | 📉 熊市趋势 | 防御+现金为主 |
| CRISIS | >0.08 | >2.0 | ANY | ANY | 🔴 危机态 | 现金+对冲+最小仓位 |
| TRANSITION | ANY | ANY | 方向切换 | 0.45-0.55 | ⚡ 过渡态 | 观望+等待确认 |

### 1.3 Decision Tree

```
Temperature T?
├─ T > 0.15 → CRISIS (stay out, extreme caution)
├─ T > 0.08 → Check entropy
│   ├─ H > 2.5 → CRISIS (chaotic volatility)
│   └─ H ≤ 2.5 → Check momentum
│       ├─ M > 0 → TRANSITION_BULL (cautious long, reduced size)
│       └─ M < 0 → BEAR_TREND (defensive)
└─ T ≤ 0.08 → Check Hurst
    ├─ Hurst > 0.55 → Trending regime
    │   ├─ M > 0 → BULL_TREND
    │   └─ M < 0 → BEAR_TREND
    ├─ Hurst < 0.45 → Mean-reverting regime
    │   ├─ M > 0 → BULL_MEANREV
    │   └─ M < 0 → BEAR_MEANREV
    └─ Hurst 0.45-0.55 → SIDEWAYS or TRANSITION (check M for direction)
```

---

## §2. Investment Screening (标的筛选)

### 2.1 Screening Rules by Market State

| Market State | Screening Priority | Strategy |
|-------------|-------------------|----------|
| BULL_TREND | High momentum + Hurst>0.55 | 追强不追弱 |
| BULL_MEANREV | Pullback to support + M>0 | 回调买入 |
| SIDEWAYS | Low correlation pair | 配对交易/网格 |
| BEAR_MEANREV | Oversold (RSI<30) + Hurst<0.45 | 超卖反弹 |
| BEAR_TREND | Minimum holdings only | 现金为王 |
| CRISIS | None | 不持有/对冲 |

### 2.2 Stock/ETF Scoring (0-100)

Score each candidate:

```
Score = w1 * MomentumScore + w2 * HurstScore + w3 * TempScore + w4 * EntropyScore

where:
MomentumScore = 25 if M > 0.5, 15 if M > 0, 5 if M < 0
HurstScore = 25 if Hurst > 0.55, 10 if Hurst 0.45-0.55, 25 if Hurst < 0.45 AND M matches mean-reversion
TempScore = 25 if T < 0.03, 15 if T < 0.06, 5 if T < 0.10, 0 if T ≥ 0.10
EntropyScore = 25 if H < 1.5, 15 if H < 2.0, 5 if H < 2.5, 0 if H ≥ 2.5
```

**Thresholds:**
- Score ≥ 75 → Strong Buy candidate
- Score 60-74 → Watchlist
- Score < 60 → Skip

### 2.3 ETF Screening Specifics

For ETFs, verify tracking index BEFORE screening (from a-share-research skill):
1. Get actual ETF name via fund API
2. Verify tracking index via fundf10
3. Cross-reference top 10 holdings
4. Then apply physics screening

---

## §3. Buy/Sell Timing (买卖时机)

### 3.1 Entry Signals (买入信号)

| Priority | Condition | Signal Strength |
|----------|-----------|----------------|
| ⭐⭐⭐ | T < 0.05 + H < 2.0 + M > 0.3 + Hurst > 0.55 | Strong — trend alignment |
| ⭐⭐ | T < 0.05 + H < 2.0 + M > 0 | Moderate — decent entry |
| ⭐ | T < 0.08 + H < 2.5 + M just turned positive | Cautious — early signal |

### 3.2 Exit/Reduce Signals (卖出/减仓信号)

| Priority | Condition | Action |
|----------|-----------|--------|
| 🔴🔴🔴 | T crosses above 0.15 | 清仓 (full exit) |
| 🔴🔴 | T crosses above 0.08 + H > 2.5 | 减仓50% |
| 🔴 | M turns negative + Hurst > 0.55 | 减仓30% (trend reversal) |
| 🟡 | H crosses above 2.5 | 减仓20% (uncertainty spike) |

### 3.3 Stop-Loss Physics Adjustment

Base stop-loss level from portfolio-management skill, then adjust by market state:

| Market State | Stop-Loss Width | Rationale |
|-------------|----------------|-----------|
| BULL_TREND | Normal + 20% | Wider stop to ride trend |
| BULL_MEANREV | Normal | Standard |
| SIDEWAYS | Normal - 10% | Tighter in range-bound |
| BEAR_MEANREV | Normal - 20% | Tight — mean reversion unreliable |
| BEAR_TREND | Normal - 30% | Very tight — trend against you |
| CRISIS | Normal - 50% or full exit | Maximum protection |

---

## §4. Position Management (仓位管理)

### 4.1 Base Position Mapping by Market State

| Market State | Max Long % | Max Single Position % | Cash Reserve % |
|-------------|-----------|----------------------|----------------|
| BULL_TREND | 80% | 25% | 20% |
| BULL_MEANREV | 70% | 20% | 30% |
| SIDEWAYS | 50% | 15% | 50% |
| BEAR_MEANREV | 30% | 10% | 70% |
| BEAR_TREND | 20% | 8% | 80% |
| CRISIS | 0-10% | 5% | 90-100% |

### 4.2 DCA Adjustment

| Market State | DCA Action | Notes |
|-------------|-----------|-------|
| BULL_TREND | Normal DCA | Standard weekly |
| BULL_MEANREV | Accelerate on dips | Buy more at support |
| SIDEWAYS | Normal DCA | Standard |
| BEAR_MEANREV | DCA but reduce amount 30% | Cautious accumulation |
| BEAR_TREND | DCA reduce 50% or pause | Avoid catching falling knife |
| CRISIS | Pause DCA | Wait for stabilization |

### 4.3 Rebalancing Trigger

When market state changes:
- **BULL_TREND → BEAR_TREND**: 减仓至20%内, 立即
- **CRISIS triggered**: 减至≤10%, 当天执行
- **CRISIS → CAUTION**: 分批加仓, 3-5次回补
- **State unchanged**: 月度正常再平衡

### 4.4 Position Sizing Formula

```
PositionSize = BaseSize × TemperatureMultiplier × EntropyMultiplier

TemperatureMultiplier:
  T ≤ 0.03 → 1.0
  T ≤ 0.06 → 0.8
  T ≤ 0.08 → 0.6
  T ≤ 0.15 → 0.4
  T > 0.15 → 0.1 (or 0)

EntropyMultiplier:
  H < 1.5 → 1.0
  H < 2.0 → 0.8
  H < 2.5 → 0.6
  H ≥ 2.5 → 0.3
```

---

## §5. Daily Analysis Integration (每日分析集成)

### 5.1 Pre-Market (盘前 9:10)

**Added to existing workflow:**

1. Compute 4 metrics for major indices (上证综指, 沪深300, 创业板指, 科创50)
2. Compute 4 metrics for HK market (恒生指数, 恒生科技)
3. Compute 4 metrics for US overnight (S&P500, Nasdaq)
4. Classify composite market state
5. Generate screening candidates based on state
6. Adjust position and DCA guidance

**Output section added to Feishu doc:**
```
## 物理金融状态诊断

| 市场 | 温度T | 熵H(bit) | 动量M | Hurst | 状态 |
|------|-------|---------|-------|-------|------|
| 上证综指 | 0.042 | 1.83 | 0.21 | 0.58 | 📈 牛市趋势 |
| 沪深300 | ... | ... | ... | ... | ... |
| 恒生科技 | 0.095 | 2.41 | -0.35 | 0.42 | 🔴 危机态/熊市反弹 |

**综合状态**: [composite state name]
**今日策略基调**: [dominant strategy]
**仓位上限**: [max long %]
**定投调整**: [DCA action]
```

### 5.2 Intraday (盘中 12:30)

**Added to existing workflow:**

1. Compute 4 metrics using morning-only data (partial session)
2. Check for intraday state changes vs pre-market
3. Generate afternoon-specific signals
4. Flag any real-time threshold breaches (T spiking, H surging)

**Key midday check:**
```
If T_afternoon > T_pre-market × 1.5:
    → WARNING: volatility spike, reduce afternoon trading activity
```

### 5.3 Post-Market (盘后 15:05)

**Added to existing workflow:**

1. Compute final 4 metrics with full-day data
2. Update market state classification
3. Score each holding against physics screening
4. Generate next-day position adjustments
5. Update the weekly physics state tracker

**Output:**
```
## 物理金融收盘诊断

[Full metrics table for all tracked markets]

### 持仓体检
| 持仓 | 温度 | 熵 | 动量 | Hurst | 评分 | 建议 |
|------|------|---|------|-------|------|------|
| 513020 | 0.098 | 2.45 | -0.28 | 0.41 | 45 | 减仓/暂停定投 |
| 515980 | 0.055 | 1.72 | 0.48 | 0.61 | 82 | 持有/正常定投 |

### 次日仓位调整
[Specific position adjustment recommendations]
```

---

## §6. Weekly Review Integration (周度复盘, Mon 9:00)

**Added to existing 定投提醒 workflow:**

1. Compute 4 metrics with weekly data for all tracked ETFs
2. Classify weekly market state
3. Adjust weekly DCA amounts based on state
4. Flag any state transitions
5. Generate 3-week physics state trend (improving/deteriorating)

---

## §7. Cross-Market Application (跨市场)

### 7.1 Cross-Market Resonance Check

When 3+ major markets show the SAME market state:
→ "Resonance" signal — amplified, more reliable

When markets show CONFLICTING states (e.g., US BULL_TREND, CN BEAR_TREND):
→ "Decoupling" — trade each independently, reduce cross-market correlation assumption

### 7.2 Gold ETF Context

For gold ETFs (e.g., 518880, GLD):
- Gold in CRISIS market state → BUY signal (safe haven)
- Gold in BULL_TREND → HOLD but don't add (opportunity cost)
- Gold in CRISIS + high Hurst → Strong safe-haven demand

---

## §8. Pitfalls

- **Metrics are lagging**: Temperature and entropy computed from historical data — they describe PAST state, not predict future. Use as risk gauge, NOT timing signal.
- **Small sample problem**: Hurst requires 100+ data points. For new holdings (<100 days), compute only T, H, M.
- **Entropy bin sensitivity**: 10 bins is default. For very narrow-range ETFs, may need fewer bins.
- **Market state can change rapidly**: State classification is valid until next computation — intraday events can invalidate it.
- **Physics metrics are not a crystal ball**: They quantify market personality, not predict prices. Combine with fundamental and macro analysis.
- **Cross-market data quality**: Some indices (HSTECH, KOSPI) have limited historical data on Sina. Fall back to CNBC or East Money push2his.
- **ETF NAV vs Price**: For ETFs, compute metrics on PRICE (market price), not NAV — price reflects real trading conditions.
- **Fund ETF (联接基金) data**: 基金 codes (025833, 008887, 001593, 006215, 022435, 008164, 022930, 022907 etc.) are NOT listed on exchanges — Sina K-line API returns empty or error. Use fund NAV API (`fundgz.1234567.com.cn`) for daily NAV series. Physics metrics computed from NAV series may differ from market-price metrics of the underlying ETF.
- **Holdings sync**: When user updates portfolio (e.g., sends `持仓.xlsx`), all 4 cron jobs must be updated with the new holdings table. See `references/holdings-sync-workflow.md` for the full procedure.

### ⚠️ Temperature Inflation in Strong Trends

Temperature T = σ² amplifies large directional moves even when they are orderly, not chaotic. An asset with +37% gain over 60 days can show T > 0.50 while having low entropy and high Hurst — this is a **strong trend**, not a crisis. **Live-run example** (2026-06-30): 515980 (人工智能ETF) showed T=0.62 yet H=1.06 (ORDERED) and Hurst=0.645 (PERSISTENT) — the high temperature reflects trend strength, not impending phase transition.

**Decision rule**: When T > 0.15, check H and Hurst BEFORE issuing CRISIS classification:
- If H < 1.5 AND Hurst > 0.55 → the high T is a **trend signal**, not a crisis signal. Treat as BULL_TREND with elevated risk, not CRISIS.
- If H > 2.0 AND T > 0.15 → genuine CRISIS risk (chaotic volatility).
- Regardless of classification, T > 0.15 always means **reduce position size** — the magnitude of daily swings warrants it even if the trend is intact.

### ⚠️ Entropy Ceiling

Maximum Shannon entropy for 10 equal-width bins is log₂(10) ≈ 3.32 bits. Values above 2.8 mean the log-returns distribution is approaching uniform — every outcome is roughly equally likely. This is the "black hole" zone: no directional edge exists, and any trade is a coin flip. In the 2026-06-30 live run, 513020 (港股科技ETF) hit H=2.94 — this correctly identified the position as untradeable without a catalyst. **Rule**: H > 2.8 → do not initiate new positions regardless of other metrics.

### ⚠️ Composite State Masking Internal Divergence

Using a single proxy index (e.g., CSI 300) for composite market state classification can hide extreme internal divergence. In the 2026-06-30 live run, CSI 300 showed BULL_TREND (T=0.025, Hurst=0.568) while 创业板 was WARNING+CHAOTIC (T=0.087, H=2.75) and 科创50 was WARNING+CHAOTIC (T=0.122, H=2.58). The composite "BULL_TREND" label would be misleading without individual-holding metrics.

**Rule**: Always compute and display per-holding metrics alongside the composite state. When more than 50% of holdings are in a worse state than the composite, flag "市场分化严重" (severe market fragmentation) and apply the WORSE state for position sizing on those individual holdings.

---

## References

- `references/physics-metrics-computation.py`: Complete Python computation code (also deployed to `/root/.hermes/scripts/physics_metrics.py`)
- `references/daily-report-block-structure.md`: Feishu Docx block structure templates for three daily report sections (盘前/午盘/收盘) — exact API JSON format, table layouts, and cron job integration map
- `references/holdings-sync-workflow.md`: Procedure for updating all 4 cron jobs when user provides updated portfolio spreadsheet
- `a-share-research/references/multi-source-market-data.md`: Data source patterns including CNBC, Sina API commands, and physics metrics computation patterns
- `a-share-research/references/etf-verification-reference.md`: ETF verification workflow
- `portfolio-management/SKILL.md`: Position and risk management framework
