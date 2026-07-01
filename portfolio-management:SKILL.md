---
name: portfolio-management
title: Portfolio Management & Position Decision Framework
description: Position sizing, stop-loss decisions, DCA (定投) discipline, profit-taking, and portfolio rebalancing frameworks. Covers A-share, HK, and US market ETF and stock portfolios.
domain: investment
tags:
  - portfolio-management
  - position-sizing
  - stop-loss
  - DCA
  - ETF
  - risk-management
  - HK-tech
  - capital-pressure
  - holdings-update
  - bitable
triggers:
  - user sends an updated holdings file (Excel/CSV, typically 持仓.xlsx) and asks to "更新持仓" or "更新每天追踪的持仓标的"
  - user asks whether to stop-loss or hold a losing position
  - user asks about position sizing or portfolio rebalancing
  - user mentions capital pressure from a position
  - user asks about DCA (定投) strategy or whether to continue
  - user took profit and position is shrinking
  - user asks "浮亏X%是否止损"
  - user references social media claims about an investment ("抖音上说XX没有投资价值", "小红书都在清仓XX", "微博热搜说XX要暴跌")
  - user asks about viral bearish/sensational investment content from Douyin/Xiaohongshu/Weibo/Toutiao
---

# Portfolio Management & Position Decision Framework

Umbrella skill for portfolio-level decision making. When the user asks about holding, cutting, adding, or rebalancing positions — this is the governing skill.

**Relationship to `a-share-research`:** That skill covers individual stock research methodology (data gathering, sentiment, valuation). This skill covers portfolio-level decisions (position sizing, stop-loss, DCA, rebalancing). They are complementary — use `a-share-research` for "analyze this stock", use this skill for "should I cut/hold/add this position".

---

## Decision Order (MANDATORY — address in this sequence)

### 1. Capital Pressure Check (FIRST — overrides all other factors)

If the user mentions any of these signals, capital pressure is the FIRST recommendation:
- "有一定的资金压力" / "仓位太重"
- "这笔钱有急用"
- "看着难受" / "睡不着"
- Position is their largest holding and causing stress

**Action: 减仓30-50% immediately**, regardless of thesis validity.
> 仓位应该匹配风险承受力，而不是看好程度。

### 2. Thesis Validation

Ask/verify: what was the original buy thesis?

| Thesis Type | Durability | Action |
|-------------|-----------|--------|
| Clear thesis + still valid | High | Hold/DCA |
| Clear thesis + broken | Low | Sell |
| Vague thesis ("估值偏低，没有考虑太多") | Unknown | Reduce + re-evaluate |
| Systematic factor only (Fed/macros) | Medium | Hold but reduce to comfort |

**Key distinction:**
- **系统性因素** (Fed加息、全球流动性收紧) → broad market pressure, not stock-specific
- **基本面恶化** (行业政策转向、公司盈利下滑、竞争格局恶化) → idiosyncratic risk, sell signal

### 3. Valuation Context

- Pull current price data for major holdings
- PE/PB vs historical percentiles (5-year range)
- For HK tech: remember 低估可以更低估 — cheap can get cheaper in liquidity-draining environments
- Cross-reference macro: Fed rate path, USD/CNH, China monetary policy divergence

### 4. Portfolio-Level View

- No single position should exceed comfort threshold
- Check correlation: do multiple positions move together?
- HK科技 and A股科技 are highly correlated — may be doubled up on same risk factor

---

## Stop-Loss Decision Matrix

Present as a table, not prose:

| Scenario | Action | Rationale |
|----------|--------|-----------|
| Thesis broken + capital pressure | 清仓 | No reason to stay |
| Thesis intact + capital pressure | 减仓30-50% | Stay in the game |
| Thesis intact + no pressure + -20% | 持有/定投 | Normal volatility |
| Thesis unclear + -20% | 减仓 + 重新评估 | Don't hold on hope |
| Systematic factor only | 持有但减仓至舒适 | Not idiosyncratic |

**Hard rules:**
- 科技股年化波动率30%+，20%浮亏是正常区间 — NOT by itself a stop-loss signal
- 止损线应基于：最大可承受亏损 or 技术支撑位 or 逻辑破坏点 — NOT arbitrary round numbers
- 20%浮亏不是止损的理由，但资金压力是减仓的充分理由
> 先活下来，再谈收益。

---

## DCA (定投) Discipline

### Critical Pitfall: Profit-Taking Without DCA Recovery

**Pattern observed:** User takes profit on a winning position → abandons DCA → position shrinks to near-zero → misses subsequent rally.

This is "会卖不会买" — selling well but failing to rebuild.

### Correct DCA Workflow

1. **止盈部分仓位** — lock in some profits (correct behavior)
2. **立即恢复**剩余仓位的定投计划 — same day as profit-taking
3. **定投金额固定** — time-based (weekly/monthly), NOT price-based
4. **不因价格波动调整** — DCA works because you buy MORE when cheap, LESS when expensive automatically
5. **只有估值明显高估时才暂停** — e.g., PE > 90th percentile of 5-year range
6. **止盈资金可部分转入低估品种** — do 分批建仓 into undervalued positions, but NOT all at once

### DCA Schedule Management

For tracked ETF portfolios (via Feishu Bitable):
- Weekly fixed-amount DCA for core positions
- Monthly review: check if any position needs rebalancing
- Quarterly review: verify thesis still holds for each position
- Use cron jobs for automated reminders (see user's existing cron setup)

---

## HK Tech Specific Considerations

港股科技股的特殊性 — these factors should ALWAYS be mentioned when advising on HK tech positions:

| Factor | Mechanism | Impact |
|--------|-----------|--------|
| 离岸市场 | 外资主导，资金自由流动 | 对全球流动性极度敏感 |
| 汇率传导 | 盈利人民币计价，港币计价 | 人民币贬值=利润换算缩水 |
| 长久期资产 | 估值依赖远期现金流折现 | 美债收益率↑→折现率↑→估值压缩 |
| Fed传导 | 加息→美元回流美国 | 港股外资持续流出 |
| 政策对冲 | 中国央行可能独立宽松 | 降准降息可部分对冲 |

**Rule of thumb:** 美债收益率每上升1%，科技股估值压缩约10-15%

**Valuation trap warning:** 恒生科技PE 20-25x "不贵"，但在流动性收缩环境中，低估可以更低估。便宜不是买入理由，必须有催化剂。

---

## Social Media Panic Research Protocol

When the user says they saw viral claims on Douyin/TikTok/Xiaohongshu/Weibo about an investment being worthless — this protocol applies BEFORE the standard decision matrix.

### The Core Principle

> 社交媒体在下跌趋势中天然放大悲观叙事。你在抖音上刷到的"XX没有投资价值"，本质是你自己持仓亏损状态下算法推送给你的**情绪验证**，不是中立分析。

### Protocol (MANDATORY when social-media-driven query)

#### Step 0: Isolate the Claims
Extract specific, testable claims from the social media content. "没有投资价值" is too vague — break it down:
- Is the claim about fundamentals? (盈利下滑、行业见顶)
- Is the claim about liquidity/technical? (资金流出、无人接盘)
- Is the claim about macro/policy? (政策打压、地缘风险)
- Is the claim about relative performance? (跑输其他品种)

Each claim must be tested against data. Vague doom-saying is noise.

#### Step 1: Research the Counter-Narrative
For every bearish claim, search for the bull case. Use multiple search engines:
- **Google**: `{STOCK/ETF}+bull+case+2026` — for English-language institutional analysis
- **Baidu News**: `{名称}+利好+{年份}` — for Chinese media coverage
- **So.com (360搜索)**: `{名称}+投资价值+分析` — fallback when Baidu returns empty
- **Xueqiu**: `site:xueqiu.com {CODE}` — for retail investor counter-arguments

> **Pitfall**: Google and Baidu both frequently fail/timeout for Chinese finance queries from server environments. When they do, try So.com (360搜索) or Toutiao (头条搜索) as alternatives. See `references/social-media-research.md` for multi-engine fallback strategy.

#### Step 2: Verify Tracking Index (for ETFs)
Many "港股科技ETF" products track DIFFERENT indices. Common confusion:
| ETF | Tracks | Not |
|-----|--------|-----|
| 513020 (港股科技ETF国泰) | 中证港股通科技指数 | ≠恒生科技指数 |
| 513180 (恒生科技ETF) | 恒生科技指数 (HSTECH) | — |
| 159742 (恒生科技ETF) | 恒生科技指数 (HSTECH) | — |

中证港股通科技指数 has different constituents and weightings than HSTECH. NEVER assume "港股科技ETF" all track the same thing.

#### Step 3: Cross-Reference with Buy Thesis
Return to step 2 of the main Decision Order. Which of the social media claims actually threaten the original thesis?

Example: If the Douyin claim is "港股没有流动性" and the original thesis was "估值低+均值回归":
- Does liquidity affect mean reversion? → YES, it delays it. Thesis weakened but not broken.
- Does the claim introduce NEW information the thesis didn't account for? → If no, it's noise.

#### Step 4: Apply Standard Decision Matrix
Only AFTER steps 0-3, apply the standard Stop-Loss Decision Matrix. The social media content is INPUT to thesis validation, not a decision trigger.

### Red Flags (social media claims that are almost never actionable)
- "XX永远涨不回来了" — absolute predictions, untestable
- "所有人都知道XX不行了" — herd consensus during drawdowns is usually wrong
- "XX已经跌了Y%, 还会继续跌" — anchoring on past price movement
- "看这个博主去年就说对了" — survivorship bias in content recommendations
- Comparative underperformance rage ("A股科技涨了30%, 港股科技还在跌") — this is FOMO, not analysis

### Counter-Signal: When Social Media Panic IS Informative
- **Specific regulatory/policy change** referenced with document numbers or official announcements
- **Earnings/fundamental deterioration** with actual financial data, not vibes
- **Index constituent change** that alters the ETF's exposure profile
- **Structural market change** (e.g., delisting risk, exchange closure) — extremely rare

> **Rule of thumb**: If the social media post doesn't cite a specific event, number, or document — it's entertainment, not investment research.

---

## Communication Style

- Use structured tables for decision frameworks and comparisons
- Give actionable recommendations, not just analysis
- Always ask about original buy thesis before recommending action
- Be direct about capital pressure as a first-order signal — do not soften this
- Provide specific numbers and percentages, not vague advice ("适当减仓" is too vague; "减仓30-40%" is specific)
- End with a clear action list: 动作 / 优先级 / 理由
- Use emoji only for section headers, not inline decoration
- Tone: direct, structured, practical — the user wants frameworks they can act on

---

## Data Sources

**HK stock prices:** Sina Finance API with GBK encoding.
```
curl -s "https://hq.sinajs.cn/list=hk00700,hk09988,..." -H "Referer: https://finance.sina.com.cn"
```
Fields: [0]=name, [2]=prev_close, [6]=current, [8]=change_pct (see `references/sina-hk-field-mapping.md`)

**Index data:** East Money push API or Sina. HSTECH may be unavailable on some endpoints; HSI usually works.

**Macro data:** Fed rate decisions, US 10Y yield, USD/CNH — try Sina, East Money, or CLS API.

**Related skill:** `macro-cycle-analysis` — for detailed macroeconomic cycle analysis (库存周期四阶段, M1-M2剪刀差, 美林时钟). Use this skill when the user's position decision requires macro context (e.g., "is Fed加息 cycle near its end?", "what cycle stage are we in?").

---

## Pitfalls

- **Sina HK API encoding**: Uses GBK — must pipe through `iconv -f GBK -t UTF-8` or Python `errors="ignore"`
- **Sina requires Referer header**: Without it, returns empty strings
- **Empty HSTECH data**: The `hq_str_hstechi` endpoint sometimes returns empty. Fall back to individual constituent stocks.
- **Vague thesis trap**: "估值偏低" alone is not actionable — must combine with catalyst analysis
- **Correlation blind spot**: User may hold multiple positions that are effectively the same bet (e.g., 港股科技ETF + 科技ETF + 人工智能ETF all have heavy overlap in 腾讯/阿里/小米)
- **Profit-taking guilt**: User may feel bad about taking losses after taking profits earlier. Frame it as portfolio management, not failure.
- **Bitable NumberFieldConvFail (code 1254061)**: When updating Feishu Bitable records via API, number fields (`成本价`, `持仓数量`, `成本金额`, `定投金额/周`) MUST be passed as actual numbers (float/int), NEVER as strings. `"1.0480"` fails; `1.048` succeeds. Same for `0` vs `"0"` and `1000` vs `"1000"`. See `references/holdings-update-workflow.md` for full holdings update procedure.
- **Holdings update workflow**: When user sends an updated `持仓.xlsx`, follow the systematic procedure in `references/holdings-update-workflow.md` — download from Feishu attachment, diff against Bitable, update records (PUT for existing, POST for new), update all 4 cron job prompts, and update memory.