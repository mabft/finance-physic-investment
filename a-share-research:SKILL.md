---
name: a-share-research
title: A-Share Market Research & Analysis
description: Comprehensive A-share research — individual stock analysis, index rebalancing event analysis, and macro-financial report creation. Covers data gathering, sentiment assessment, valuation frameworks, and analytical document generation.
domain: research
tags:
  - a-shares
  - stock-analysis
  - index-rebalancing
  - macro-research
  - financial-analysis
  - sentiment
  - valuation
triggers:
  - user asks why a stock dropped or rose
  - analyze a single stock / deep dive / valuation / entry point
  - 指数调整 调入 调出 / index rebalancing analysis
  - comprehensive macro analysis report / 深度宏观经济分析报告
  - 个人养老金 ETF 推荐 / pension fund recommendation
  - 板块轮动对比 / 市场风格切换 / 抱团股 analysis
---

# A-Share Market Research & Analysis

Umbrella skill for all A-share market research. Three sub-workflows share common quality standards and data sources:

| Sub-workflow | Trigger |
|---|---|
| **Stock-Level Analysis** (§1) | "Why did X stock move?" / "Is X worth buying?" / valuation |
| **Index Rebalancing** (§2) | Index adjustment announcements (调入/调出) / ETF capital flow |
| **Macro Research Reports** (§3) | Macro-financial analytical documents / inflation / energy / policy |

**⚠️ When to switch to `portfolio-management`:** If the user asks about position sizing, stop-loss decisions, whether to cut/hold a losing position, DCA strategy, or portfolio rebalancing — load `portfolio-management` AFTER completing the research. This skill provides the data; `portfolio-management` provides the decision framework.

---

## Shared Quality Standards (apply to ALL sub-workflows)

- **Every data point must have a source tag**: (IEA数据), (BLS), (国家统计局), (IMF), (Wind), etc.
- **Structured hierarchy**: h1 for title, h2 for major sections, h3 for subsections
- **No vague claims**: Never write "many experts say" or "studies show" — use specific source attribution
- **Data source appendix**: End analytical docs with a "数据来源" section listing all sources
- **Chinese finance site link rot**: Direct links to 新浪财经, 东方财富, 雪球, 36氪 often return 404 or login walls. Prefer Google AI overview extraction first, then target major portals (澎湃新闻) for full text.

---

## §1. Stock-Level Analysis

### Workflow

1. **Gather real-time data** via Sina Finance hq API:
   ```
   curl -s "https://hq.sinajs.cn/list=sz{CODE}" -H "Referer: https://finance.sina.com.cn"
   ```
   Fields: [0]=name, [1]=open, [2]=prev_close, [3]=current, [4]=high, [5]=low, [8]=volume, [9]=turnover

2. **Get historical K-line data** via Sina K-line API (for recent price trend analysis):
   ```
   curl -s "https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData?symbol=sz{CODE}&scale=240&ma=no&datalen=30" -H "Referer: https://finance.sina.com.cn"
   ```
   Returns JSON array with day/open/high/low/close/volume/changepercent. `scale=240` = daily K-line. Use `datalen` for lookback days.

3. **Check Sina detail page** for info mines (信息地雷) and news:
   `https://finance.sina.com.cn/realstock/company/sz{CODE}/nc.shtml`

4. **Search Google AI Overview** for rapid news/causation synthesis (more reliable than Baidu for "why did X stock move" queries):
   `https://www.google.com/search?q={STOCK_NAME}+{CODE}+{KEYWORD}&hl=zh-CN`
   Extract the "AI 概览" section — it synthesizes multiple sources into structured causes.

5. **Search Baidu News** for recent coverage:
   `https://www.baidu.com/s?tn=news&word={STOCK_NAME}+{DATE}`

6. **Assess sector/peer context** — if multiple stocks in same sector move together → sector-wide event; if only target → company-specific

7. **Check retail sentiment** on East Money Guba:
   `https://guba.eastmoney.com/list,{CODE}.html`
   DOM extraction via CDP: `JSON.stringify(Array.from(document.querySelectorAll('table tr')).slice(0,15).map(tr => { const cells = tr.querySelectorAll('td'); return cells.length >= 5 ? { reads: cells[0]?.textContent?.trim(), comments: cells[1]?.textContent?.trim(), title: cells[2]?.textContent?.trim()?.substring(0,60), author: cells[3]?.textContent?.trim(), time: cells[4]?.textContent?.trim() } : null; }).filter(Boolean))`

8. **Synthesize causes** in rank order: macro/sector → company-specific → technical → sentiment

### Valuation & Entry-Point Analysis (for "值得买入" queries)
- **First check: is the company profitable?** If 市盈率TTM = 亏损 or 动态PE > 500, skip PE-based valuation entirely — the stock is purely speculative/concept-driven. Flag this to the user explicitly before proceeding.
- Historical context: peak-to-trough journey, 抱团股 cycle position
- Valuation framework: PE/PB vs 5-year range, sector peers, pre-bubble baseline
- Price target scenarios: 乐观(25x+) / 中性(20x) / 悲观(15x) / 极端(12x)
- Tiered entry strategy: 试探仓(1/3) → 加仓(2/3) → 满仓 at extreme support
- Risk-reward table with downside/upside/time horizon

### Personal Pension ETF Research
- Personal pension accounts buy **ETF联接基金Y类份额** (not direct ETFs)
- Y类: 0 purchase fee, 0.15% management fee (vs 0.50% standard), tax deferral
- 85 index funds in personal pension directory (沪深300, A500, A50, 科创50, etc.)
- See `references/personal-pension-etf-funds.md` for Y-class fund codes

### Stock-Level Pitfalls
- **Sina API requires Referer header** or returns empty
- **Encoding**: Sina uses GBK — pipe through `iconv -f GBK -t UTF-8` if garbled
- **Stock code prefix**: Shenzhen=sz, Shanghai=sh, Beijing=bj
- **Date-sensitive**: Evening/weekend queries show stale data
- **Vision API exhaustion**: If 429, fall back to browser-based text extraction
- **Guba rendering**: Use `list,{CODE},f_1.html` for full post list; scroll 2-3 times; hot posts with read > 1万 = high engagement
- **妖股 (speculative stock) identification**: When user asks "can I invest in X?" and the stock shows: (a) 市盈率TTM = 亏损 or >500, (b) 振幅 > 7% on multiple days, (c) 天地板 pattern (涨停→跌停 same day or vice versa), (d) 换手率 > 10% consistently, (e) concept-driven rally with company澄清 that相关业务占比极小 — these are red flags for pure游资博弈. Recommend against investment; if user insists, flag it as speculation not investment, suggest ≤5% position size with strict stop-loss.

---

## §2. Index Rebalancing Analysis

### Context
Major A-share indices (上证50, 沪深300, 科创50, 上证180, 上证380) conduct **semi-annual adjustments** in May/June and Nov/Dec. Announcement-to-effective-date gap is ~2 weeks.

### Three-Phase Capital Flow Timeline

**Phase 1: Announcement Effect (公告日 → T+1)**
- 调入股: gap up, but often "高开低走" / "冲高回落" — smart money exits on announcement liquidity
- Key signal: volume spike vs 20-day average

**Phase 2: Front-Running (T+2 → T-1 before effective date)**
- Active funds buy 调入股 ahead of passive ETF execution → self-fulfilling rally
- 调入股 cumulative return vs benchmark during this window is key signal

**Phase 3: Passive Execution (生效日 14:30-15:00)**
- ETFs MUST rebalance → concentrated buying/selling in last 30 min
- **Highest-certainty but most crowded trade**
- 科创50: small-float tech stocks can move 5-10% in last 30 min

### Per-Stock Analysis (调入组)
- Front-running status: >15% rally since announcement = "利好出尽" sell signal on effective date
- Float size: smaller float = larger passive flow impact
- Sector momentum + fundamental backing = compounding positive
- Without fundamentals = pure liquidity play, will fade

### Per-Stock Analysis (调出组)
- Reason for removal: market cap decline vs rule change vs style rotation
- High dividend yield (>6%) = buying opportunity AFTER passive sell-off
- Passive flow magnitude: ETF AUM × old weight × sell % vs daily turnover

### Index Rebalancing Pitfalls
- **"利好出尽" trap**: most common pattern is 调入股 rallying on announcement, selling on effective date
- **调出 ≠ 垃圾**: removal often reflects style rotation, not fundamental deterioration
- **Passive flow is finite**: compare forced flow to daily turnover
- **Sector correlation**: multiple stocks from same sector 调入 together → compounded ETF impact
- **Announcement vs effective gap**: ~2 weeks is crucial — stocks that continue rising after day-1 gap have fundamental support

---

## §4. ETF Research & Verification

### Critical Rule: NEVER Assume ETF Coverage from Name Alone

**Pitfall discovered**: ETF names often do NOT reflect their actual tracking index or holdings. For example, 516880 is named "光伏ETF银华" and tracks the 中证光伏产业指数 — it has zero coverage of hydrogen energy despite being casually suggested as such. Always verify before recommending.

### ETF Verification Workflow (MANDATORY before any ETF recommendation)

1. **Get actual ETF name and net value** via Sina fund API:
   ```
   curl -s "https://fundgz.1234567.com.cn/js/{CODE}.js"
   ```
   Returns JSONP with name, gsz (estimated NAV), gztime.

2. **Verify tracking index** — scrape ETF detail page from 天天基金:
   ```
   https://fundf10.eastmoney.com/{CODE}.html
   ```
   Extract: 跟踪标的, 业绩比较基准, 基金类型.

3. **Check top 10 holdings** to confirm actual theme coverage:
   ```
   https://fundf10.eastmoney.com/FundArchivesDatas.aspx?type=jjcc&code={CODE}&topline=10
   ```
   Parse the HTML response for stock names. If a stock appears in top 10, the ETF has meaningful exposure to it.

4. **Cross-reference with real-time price** via Sina hq API:
   ```
   curl -s "https://hq.sinajs.cn/list=sh{CODE}" -H "Referer: https://finance.sina.com.cn"
   ```

5. **State coverage explicitly**: When recommending an ETF, always state what it ACTUALLY tracks and which direction it covers vs which it does NOT.

### Known Coverage Gaps for Future Industries (as of 2026-06)

| Future Industry | Pure Theme ETF? | Best Available Proxy | Actual Coverage |
|----------------|----------------|---------------------|----------------|
| 量子技术 | ❌ None | 科创50ETF (588000) | Indirect — only科创板量子标的 |
| 生物制造 | ❌ None | 科创50ETF (588000) | Indirect — 凯赛生物等权重有限 |
| 氢能与核聚变 | ❌ None | 新能源车ETF (515030) | 燃料电池环节部分覆盖 |
| 脑机接口 | ❌ None | 医疗器械ETF (159883) | 覆盖有限，主要传统器械龙头 |
| 具身智能/机器人 | ✅ 机器人ETF (562500) | 机器人ETF (562500) | 中证机器人指数，高度匹配 |
| 6G通信 | ✅ 通信ETF (515880) | 通信ETF (515880) | 中证全指通信设备指数 |
| 半导体/芯片 | ✅ 芯片ETF (159995) | 芯片ETF (159995) | 国证芯片指数 |
| 工业母机 | ✅ 工业母机ETF (159667) | 工业母机ETF (159667) | 中证机床指数 |
| 绿色电力 | ✅ 绿电ETF (562550) | 绿电ETF (562550) | 中证绿色电力指数 |

### Active ETF Status (主动ETF试点进展)
2024年证监会批准首批主动管理型ETF试点。Active ETFs bypass index constitution requirements (minimum 30-50 constituents, stable technical routes) — fund managers can pick stocks freely.

**Current status (2026-06)**: No active ETFs target quantum, hydrogen, BCI, or bio-manufacturing themes. This is a leading indicator: if even active managers cannot identify enough investable companies in a theme, the industry is still in too-early stage. Recommendation: wait for product launch signal before investing.

### Why Industries Lack ETFs — Index Constitution Problem
Passive index ETFs require a viable underlying index. The three barriers:
1. **Insufficient constituents** — Quantum tech has <20 relevant A-share companies; index minimum is typically 30-50
2. **Undefined technical routes** — Hydrogen vs nuclear fusion: index compilers cannot pick winners
3. **Market cap/liquidity thresholds** — BCI companies are mostly small-cap with low trading volume

### ETF Recommendation Quality Standards
- Always state the **actual tracking index**, not just the ETF name
- Distinguish between **pure theme coverage** (direct) vs **indirect/partial coverage** — use explicit markers (✅ direct, ⚠️ indirect/partial, ❌ no coverage)
- Flag directions with **no pure ETF** — do NOT recommend mismatched ETFs as "substitutes". Say "尚无纯主题ETF" and offer: (a) wait for product launch, (b) 极小仓位个股精选 with clear risk warning
- Never recommend an ETF based on conceptual association alone (e.g., do NOT suggest 光伏ETF for hydrogen energy just because both are "new energy")
- When uncertain, verify via the 3-step workflow (name/NAV → tracking index → top 10 holdings) before any recommendation
- For Feishu Bitable entries, always include the actual tracking index in the 操作建议 field

### Why Certain Industries Lack ETFs — Index Constitution Problem

Passive index ETFs require a viable underlying index. An index typically needs:
- **Minimum 30-50 constituent stocks** — Quantum technology has fewer than 20 relevant A-share companies
- **Stable technical route consensus** — Hydrogen vs nuclear fusion: which is the future? Index compilers cannot pick winners
- **Market cap and liquidity thresholds** — BCI companies are mostly small-cap with low liquidity

When these conditions are not met, no index exists → no passive ETF can be created. This is why quantum, hydrogen, BCI, and bio-manufacturing have no pure ETFs.

### Active ETF as Leading Indicator

Active (主动管理型) ETFs were piloted in China starting 2024 (证监会批准首批主动管理型ETF试点). Active ETFs bypass index constitution requirements — fund managers can pick stocks freely.

**Signal framework**: When researching a future industry direction:
1. **Pure passive ETF exists** → Industry is mature, constituents are sufficient, safe to invest via ETF
2. **No passive ETF but active ETF exists** → Industry is emerging, fund managers have identified investable companies, cautious entry possible
3. **Neither passive nor active ETF exists** → Industry is too early-stage, constituents insufficient or business models unclear. Recommend: wait, or 极小仓位个股精选

**Current status (2026-06)**: No active ETFs specifically target quantum, hydrogen, BCI, or bio-manufacturing themes. This signals these industries are still in the "too early" phase even for active managers.

### ETF Pitfalls
- **Name mismatch**: ETF name may reference a broad theme while tracking a narrow index. Example: 159555 is "增强2000" (small-cap enhanced index), NOT a robot ETF. Always verify.
- **Rebalancing lag**: ETF holdings change quarterly — current top 10 may differ from published data
- **Concept炒作**: Some ETFs are marketed with trendy names but have minimal actual exposure
- **No pure ETF**: Quantum, bio-manufacturing, BCI, nuclear fusion have no dedicated A-share ETFs — do NOT recommend non-matching ETFs as substitutes
- **LOF vs ETF**: Some "ETF" products are actually LOF (listed open-end funds) with different trading characteristics
- **Never recommend based on concept association alone**: If user asks for "氢能ETF", do NOT suggest 光伏ETF (516880) just because both are "clean energy". Say "尚无纯氢能ETF" instead.
- **港股科技ETF tracking index confusion**: Not all "港股科技ETF" track the same index. 513020 (港股科技ETF国泰) tracks **中证港股通科技指数** (~50 constituents including 比亚迪, hardware-heavy), NOT 恒生科技指数 HSTECH (~30 large-cap internet names). 513180/159742/513010 track HSTECH. NEVER assume they are interchangeable — verify tracking index via fundf10.eastmoney.com before analysis. See `portfolio-management/references/social-media-research.md` for the full comparison table.

---

## §3. Macro Research Reports

### Document Structure
1. 摘要 (Executive Summary) — 3-5 core conclusions
2. 传导机制 (Transmission Mechanisms) — how shock propagates
3. 数据与对比 (Data & Comparisons) — historical precedent + current data
4. 各国影响 (Country-Level Impact) — differentiated by economic structure
5. 应对策略 (Response Strategies) — policy frameworks, timeline, effectiveness
6. 投资策略 (Investment Implications) — asset allocation, sector picks, risk
7. 风险提示 (Risk Factors) — tail scenarios, policy risks
8. 数据来源附录 (Data Sources Appendix)

### Common Analytical Frameworks
- **Input inflation**: import prices → PPI → CPI; quantify elasticities (OECD/IMF)
- **Historical crisis comparison**: trigger, magnitude, duration, policy response, lessons
- **Policy response**: short-term (reserves, demand controls) → medium-term (diversification) → long-term (structural reform)

### Macro Report Pitfalls
- **Over-simplification**: China's strategy is never "All in X" — always multi-pillar (能源安全+新能源+AI提效+产业升级)
- **Ignoring transmission lags**: oil price shocks take 3-6 months to peak in CPI
- **Missing currency dimension**: import inflation amplified by currency depreciation
- **Not distinguishing crisis types**: supply disruption (short, sharp) vs structural deficit (long, grinding)

---

## Shared Data Sources

| Source | Purpose |
|--------|---------|
| Sina Finance API | Real-time price, volume, turnover |
| Sina Detail Page | Price board, info mines, news links |
| CNBC Quote API | Global indices (S&P, Nasdaq, Dow, HSI, Nikkei, KOSPI) — JSON with 52W data |
| Baidu News | Recent news search, sorted by time |
| Google Search (hl=zh-CN) | AI overview synthesis, English institutional research |
| So.com (360搜索) | Fallback when Baidu returns empty — Chinese social media claim research |
| East Money Guba | Retail sentiment, forum heat |
| East Money Data Center | Shareholder increase/decrease (requires browser CDP) |
| East Money push2his API | HSTECH/HSI K-line data (use with Referer header) |
| SSE (sse.com.cn) | Official index adjustment announcements |
| CSI Index (csindex.com.cn) | Index methodology, weight calculations |
| 同花顺/东方财富 | News summaries, retail sentiment |
| Wind/Choice | Institutional position data |

See `references/etf-verification-reference.md` for verified ETF data, tracking indices, and known coverage gaps.
See `references/sina-hq-api-format.md` for Sina API field mapping.
See `references/multi-source-market-data.md` for fallback sources when yfinance is rate-limited, global market data (CNBC), and physics metrics computation (temperature, entropy, Hurst).
See `references/eastmoney-data-center.md` for CDP extraction pattern.
See `references/china-market-comparative-analysis.md` for 抱团股 cycle and era comparison framework.
See `references/personal-pension-etf-funds.md` for Y-class fund codes.
See `references/wechat-article-access.md` for WeChat article scraping limitations and workarounds.
See `references/data-source-attribution.md` (from feishu-docx-api) for standard source categories.

**Related skills:**
- `macro-cycle-analysis` — for macroeconomic cycle analysis (库存周期, 货币周期, 美林时钟). Use this skill's macro framework when writing macro sections of research reports.
- `portfolio-management` — for portfolio-level decisions (stop-loss, DCA, position sizing). Use AFTER completing research.

## Pitfalls (Shared)
- **Vision API exhaustion**: If vision/OCR returns 429, fall back to browser-based text extraction
- **Chinese finance site link rot**: Prefer Google AI overview + snippet synthesis over direct article links
- **Encoding issues**: Sina uses GBK for older pages
- **HSTECH index unavailable on Sina**: The `hq_str_hstechi` and `int_hstechi` endpoints return empty strings. For 恒生科技指数 data, use EastMoney `push2his` API (`secid=124.HSTECH`) with proper Referer header, or fall back to individual HK constituent stocks via `hk{CODE}` prefix on Sina. The `hf_HSI` (恒生指数期货) endpoint on Sina does work and can serve as a rough proxy for HK market direction.
- **EastMoney push2 API blocking**: The `push2.eastmoney.com` endpoint aggressively blocks non-browser User-Agents, returning `RemoteDisconnected`. Use the `push2his.eastmoney.com` variant with `Referer: https://quote.eastmoney.com/` header, or fall back to Sina/fundf10 data sources.
- **Fund NAV API returns "场内买入" for ETFs**: `fundgz.1234567.com.cn` returns `场内买入` instead of historical NAV for listed ETFs. Use Sina real-time quotes for ETF price data instead. The fund API still works for the latest estimated NAV (`gsz` field).
