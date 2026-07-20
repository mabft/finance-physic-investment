import { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle, XCircle, BarChart3, Thermometer, Zap, Target, RefreshCw, DollarSign, ArrowUpRight, ArrowDownRight, Minus, Wallet } from 'lucide-react';

interface DailyData {
  current_price: number;
  prev_close: number;
  open_price: number;
  high: number;
  low: number;
  change_amount: number;
  change_pct: number;
  daily_analysis: {
    change: number;
    change_status: string;
    spread: number;
    spread_status: string;
    gap: number;
    gap_status: string;
    current_price: number;
    prev_close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
  };
}

interface HoldingImpact {
  cost_price: number;
  profit_amount: number;
  profit_pct: number;
  impact_analysis: string[];
  position_multiplier: number;
}

interface CombinedRecommendation {
  type: string;
  icon: string;
  title: string;
  content: string;
  action: string;
  priority: string;
}

interface CombinedAnalysis {
  combined_signal: string;
  combined_score: number;
  long_term_signal: string;
  long_term_strength: number;
  short_term_signal: string;
  short_term_strength: number;
  adjusted_multiplier: number;
  recommendations: CombinedRecommendation[];
}

interface NewsArticle {
  title: string;
  date: string;
  media_name: string;
  url: string;
  content: string;
  sentiment: string;
  sentiment_label: string;
  importance: string;
  positive_score: number;
  negative_score: number;
}

interface NewsSummary {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  important: number;
  overall_sentiment: string;
  overall_label: string;
  key_news: {
    title: string;
    sentiment_label: string;
    importance: string;
    date: string;
  }[];
}

interface NewsData {
  summary: NewsSummary;
  articles: NewsArticle[];
}

interface TradingStrategyCriteria {
  "买入条件": string[];
  "卖出条件": string[];
  "止损位": number;
  "止盈位": number;
  "入场价格区间": number[];
  "出场价格区间": number[];
  "仓位建议": string;
}

interface TradingStrategy {
  strategy_type: string;
  current_price: number;
  ma5: number;
  ma10: number;
  ma20: number;
  ma60: number;
  support_1: number;
  support_2: number;
  resistance_1: number;
  resistance_2: number;
  criteria: TradingStrategyCriteria;
  indicators: {
    temperature: number;
    entropy: number;
    momentum: number;
    hurst: number;
  };
}

interface InterpretationResult {
  code: string;
  name: string;
  metrics: {
    temperature: number;
    entropy: number;
    momentum: number;
    hurst: number;
  };
  state: string;
  state_info: {
    description: string;
    characteristics: string[];
    strategy: string;
    risk: string;
  };
  interpretations: string[];
  screen_score: number;
  position_multiplier: number;
  daily_data: DailyData;
  holding_impact: HoldingImpact;
  combined_analysis: CombinedAnalysis;
  trading_strategy: TradingStrategy;
  news: NewsData;
}

interface PortfolioSummary {
  total_cost: number;
  total_market_value: number;
  total_profit: number;
  total_profit_pct: number | null;
  holding_count: number;
}

export function Interpretation() {
  const [results, setResults] = useState<InterpretationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<InterpretationResult | null>(null);
  const [showIndicatorGuide, setShowIndicatorGuide] = useState(false);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);

  const fetchInterpretations = async () => {
    setIsLoading(true);
    try {
      const [interpRes, analysisRes] = await Promise.all([
        fetch('/api/interpretation/all'),
        fetch('/api/analysis/all')
      ]);
      const interpData = await interpRes.json();
      const analysisData = await analysisRes.json();

      if (interpData.results) {
        setResults(interpData.results);
        if (interpData.results.length > 0) {
          setSelectedResult(interpData.results[0]);
        }
      }
      if (analysisData.summary) {
        setPortfolioSummary(analysisData.summary);
      }
    } catch (error) {
      console.error('获取解读数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterpretations();
  }, []);

  const getStateColor = (state: string) => {
    if (state.includes('BULL')) return 'bg-green-100 text-green-800';
    if (state.includes('BEAR')) return 'bg-red-100 text-red-800';
    if (state === 'CRISIS') return 'bg-purple-100 text-purple-800';
    if (state.includes('TRANSITION')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 0.8) return 'text-green-600';
    if (multiplier >= 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-blue-600" />
            数据解读
          </h2>
          <p className="text-gray-500 dark:text-gray-400">基于四维物理金融指标的深度数据分析与解读</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIndicatorGuide(!showIndicatorGuide)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Info className="w-4 h-4" />
            {showIndicatorGuide ? '隐藏指标说明' : '指标说明'}
          </button>
          <button
            onClick={fetchInterpretations}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新数据
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      {portfolioSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-500">总成本</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">¥{portfolioSummary.total_cost.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-500">总市值</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">¥{portfolioSummary.total_market_value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-500">总盈亏</span>
            </div>
            <p className={`text-xl font-bold ${portfolioSummary.total_profit >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {portfolioSummary.total_profit >= 0 ? '+' : ''}¥{portfolioSummary.total_profit.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-500">盈亏比例</span>
            </div>
            <p className={`text-xl font-bold ${portfolioSummary.total_profit_pct !== null && portfolioSummary.total_profit_pct >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {portfolioSummary.total_profit_pct !== null ? (portfolioSummary.total_profit_pct >= 0 ? '+' : '') + portfolioSummary.total_profit_pct.toFixed(2) + '%' : '-'}
            </p>
          </div>
        </div>
      )}

      {showIndicatorGuide && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            四维物理金融指标说明
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            这四个指标从不同维度刻画市场状态——情绪、复杂度、趋势动能、长记忆性，共同构建多维度市场评估体系。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">市场温度 (Temperature)</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">定义：</span>
                  <span className="text-gray-600 dark:text-gray-400">综合情绪指标，基于波动率²构建，反映市场恐慌/狂热程度</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">计算：</span>
                  <span className="text-gray-600 dark:text-gray-400">60日年化波动率的平方，值域 [0, )</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">应用：</span>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                    <li>极端值预警：温度过高/过低预示反转风险</li>
                    <li>仓位管理：温度高减仓，温度低加仓</li>
                    <li>择时过滤器：避免在极端情绪下交易</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">阈值参考：</span>
                  <span className="text-gray-600 dark:text-gray-400"> &lt;0.03 低波动(稳定) | 0.03-0.08 正常 | 0.08-0.15 高波动 | &gt;0.15 极高波动(危险)</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">市场熵值 (Entropy)</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">定义：</span>
                  <span className="text-gray-600 dark:text-gray-400">基于价格或收益率的 Shannon 信息，衡量市场无序程度</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">计算：</span>
                  <span className="text-gray-600 dark:text-gray-400">将收益率离散化后计算香农熵，值域 [0, log(N)]</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">应用：</span>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                    <li>趋势/震荡识别：低熵→趋势明确，高熵→震荡无序</li>
                    <li>策略切换：低熵运行趋势策略，高熵运行震荡策略</li>
                    <li>风险度量：熵突增可能预示市场突变</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">阈值参考：</span>
                  <span className="text-gray-600 dark:text-gray-400"> &lt;2.5 低熵(趋势) | 2.5-3.0 中等 | &gt;3.0 高(震荡)</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">动量指标 (Momentum)</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">定义：</span>
                  <span className="text-gray-600 dark:text-gray-400">收益/风险比，衡量趋势动能强度与方向</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">计算：</span>
                  <span className="text-gray-600 dark:text-gray-400">20日收益率 / 波动率，类似 Sharpe 比率，值域 (-∞, +∞)</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">应用：</span>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                    <li>趋势跟随：动量为正且增强→持有/加仓</li>
                    <li>金叉死叉：动量穿越零轴发出买卖信号</li>
                    <li>超买超卖：极端值预示反转</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">阈值参考：</span>
                  <span className="text-gray-600 dark:text-gray-400"> &lt;-0.2 强负(下跌) | -0.2~0 弱负 | 0~0.2 弱正 | &gt;0.2 强正(上涨)</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-orange-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-gray-900 dark:text-white">Hurst 指数</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">定义：</span>
                  <span className="text-gray-600 dark:text-gray-400">重标极差分析(R/S)，衡量时间序列的长记忆性与持续性</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">计算：</span>
                  <span className="text-gray-600 dark:text-gray-400">基于 R/S 分析，值域 [0, 1]</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">应用：</span>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                    <li>H&gt;0.5：趋势延续(动量策略)</li>
                    <li>H&lt;0.5：均值回归(反转策略)</li>
                    <li>H≈0.5：随机游走(观望)</li>
                    <li>资产配置：判断是否适合长期持有</li>
                  </ul>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-700 dark:text-gray-300">阈值参考：</span>
                  <span className="text-gray-600 dark:text-gray-400"> &lt;0.4 强均值回归 | 0.4-0.5 弱回归 | 0.5-0.6 弱趋势 | &gt;0.6 强趋势</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 border border-indigo-100 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              综合应用框架
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">多维度市场状态评估</p>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• 温度 → 情绪极端程度</li>
                  <li>• 熵值 → 噪音水平</li>
                  <li>• Hurst → 持续性</li>
                  <li>• 动量 → 方向确认</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">策略信号示例</p>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Hurst&gt;0.6 + 动量向上 + 温度未过热 → <span className="text-red-600 font-medium">做多</span></li>
                  <li>• Hurst&lt;0.4 + 动量向下 + 温度过冷 → <span className="text-green-600 font-medium">可能反弹</span></li>
                  <li>• 熵突增 → 市场突变预警，设置止损</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">动态仓位控制</p>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• 熵值高、温度极端 → 降低风险暴露</li>
                  <li>• 综合信号强 → 放大仓位系数</li>
                  <li>• 综合信号弱 → 缩减仓位系数</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">策略择时与切换</p>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Hurst + 熵值 → 判断趋势/震荡</li>
                  <li>• 动量 → 发出具体进场信号</li>
                  <li>• 温度 → 确认极端情绪避免假突破</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-400 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span><strong>注意事项：</strong>指标存在滞后性，需结合多周期验证；避免过拟合，参数需稳健性检验；极端行情下指标可能失效，需配合基本面分析。</span>
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无解读数据</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">标的列表</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.map((result) => (
                  <div
                    key={result.code}
                    onClick={() => setSelectedResult(result)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedResult?.code === result.code
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{result.name}</p>
                        <p className="text-xs text-gray-500">{result.code}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStateColor(result.state)}`}>
                          {result.state}
                        </span>
                        {result.daily_data?.change_pct !== undefined && (
                          <p className={`text-xs mt-1 font-medium ${
                            result.daily_data.change_pct > 0 ? 'text-red-600' : result.daily_data.change_pct < 0 ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {result.daily_data.change_pct > 0 ? '+' : ''}{result.daily_data.change_pct.toFixed(2)}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedResult && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedResult.name}</h3>
                      <p className="text-gray-500">代码: {selectedResult.code}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedResult.screen_score}</p>
                        <p className={`text-xs ${getScoreColor(selectedResult.screen_score)}`}>筛选评分</p>
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${getMultiplierColor(selectedResult.position_multiplier)}`}>
                          {selectedResult.position_multiplier.toFixed(2)}x
                        </p>
                        <p className="text-xs text-gray-500">仓位系数</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Thermometer className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">温度</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedResult.metrics.temperature.toFixed(4)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">熵</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedResult.metrics.entropy.toFixed(4)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">动量</span>
                      </div>
                      <p className={`text-2xl font-bold ${selectedResult.metrics.momentum >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedResult.metrics.momentum >= 0 ? '+' : ''}{selectedResult.metrics.momentum.toFixed(4)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Hurst指数</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedResult.metrics.hurst.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedResult.combined_analysis && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-600" />
                      综合研判
                    </h3>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">综合信号</p>
                        <p className={`text-xl font-bold ${
                          selectedResult.combined_analysis.combined_signal === 'bullish' ? 'text-red-600' :
                          selectedResult.combined_analysis.combined_signal === 'bearish' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {selectedResult.combined_analysis.combined_signal === 'bullish' ? '看多' :
                           selectedResult.combined_analysis.combined_signal === 'bearish' ? '看空' : '中性'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          强度: {(selectedResult.combined_analysis.combined_score * 100).toFixed(0)}%
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">长期趋势</p>
                        <p className={`text-xl font-bold ${
                          selectedResult.combined_analysis.long_term_signal === 'bullish' ? 'text-red-600' :
                          selectedResult.combined_analysis.long_term_signal === 'bearish' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {selectedResult.combined_analysis.long_term_signal === 'bullish' ? '向好' :
                           selectedResult.combined_analysis.long_term_signal === 'bearish' ? '走弱' : '不明'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          强度: {(selectedResult.combined_analysis.long_term_strength * 100).toFixed(0)}%
                        </p>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">短期动量</p>
                        <p className={`text-xl font-bold ${
                          selectedResult.combined_analysis.short_term_signal === 'bullish' ? 'text-red-600' :
                          selectedResult.combined_analysis.short_term_signal === 'bearish' ? 'text-green-600' : 'text-gray-600'
                        }`}>
                          {selectedResult.combined_analysis.short_term_signal === 'bullish' ? '强劲' :
                           selectedResult.combined_analysis.short_term_signal === 'bearish' ? '疲弱' : '平稳'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          强度: {(selectedResult.combined_analysis.short_term_strength * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedResult.combined_analysis.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            rec.priority === 'high'
                              ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                              : rec.priority === 'medium'
                              ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                              : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <span className="text-xl flex-shrink-0">{rec.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">{rec.title}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                rec.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {rec.priority === 'high' ? '重要' : rec.priority === 'medium' ? '关注' : '参考'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{rec.content}</p>
                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">
                              → {rec.action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedResult.trading_strategy && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-red-600" />
                      交易策略指引
                      <span className="ml-auto text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium">
                        {selectedResult.trading_strategy.strategy_type}
                      </span>
                    </h3>

                    {/* 关键价格位 */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MA5</p>
                        <p className="text-lg font-bold text-blue-600">
                          ¥{selectedResult.trading_strategy.ma5.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">MA20</p>
                        <p className="text-lg font-bold text-blue-600">
                          ¥{selectedResult.trading_strategy.ma20.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">支撑位</p>
                        <p className="text-lg font-bold text-green-600">
                          ¥{selectedResult.trading_strategy.support_1.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">阻力位</p>
                        <p className="text-lg font-bold text-red-600">
                          ¥{selectedResult.trading_strategy.resistance_1.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">现价</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ¥{selectedResult.trading_strategy.current_price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* 止损止盈 */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-400">止盈位</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          ¥{selectedResult.trading_strategy.criteria["止盈位"].toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingDown className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-red-800 dark:text-red-400">止损位</span>
                        </div>
                        <p className="text-2xl font-bold text-red-600">
                          ¥{selectedResult.trading_strategy.criteria["止损位"].toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* 买卖条件 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          买入条件
                        </h4>
                        <ul className="space-y-2">
                          {selectedResult.trading_strategy.criteria["买入条件"].map((condition, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 text-xs font-medium">
                                {index + 1}
                              </span>
                              <span>{condition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-4 border border-red-200 dark:border-red-800">
                        <h4 className="font-semibold text-red-800 dark:text-red-400 mb-3 flex items-center gap-2">
                          <XCircle className="w-5 h-5" />
                          卖出条件
                        </h4>
                        <ul className="space-y-2">
                          {selectedResult.trading_strategy.criteria["卖出条件"].map((condition, index) => (
                            <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 text-xs font-medium">
                                {index + 1}
                              </span>
                              <span>{condition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* 入场出场价格区间 */}
                    {selectedResult.trading_strategy.criteria["入场价格区间"].length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">入场价格区间</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-blue-600">
                              ¥{selectedResult.trading_strategy.criteria["入场价格区间"][0].toFixed(2)}
                            </span>
                            {selectedResult.trading_strategy.criteria["入场价格区间"].length > 1 && (
                              <>
                                <span className="text-gray-500">-</span>
                                <span className="text-lg font-bold text-blue-600">
                                  ¥{selectedResult.trading_strategy.criteria["入场价格区间"][1].toFixed(2)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                          <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">出场价格区间</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-purple-600">
                              ¥{selectedResult.trading_strategy.criteria["出场价格区间"][0].toFixed(2)}
                            </span>
                            {selectedResult.trading_strategy.criteria["出场价格区间"].length > 1 && (
                              <>
                                <span className="text-gray-500">-</span>
                                <span className="text-lg font-bold text-purple-600">
                                  ¥{selectedResult.trading_strategy.criteria["出场价格区间"][1].toFixed(2)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 仓位建议 */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        仓位建议
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedResult.trading_strategy.criteria["仓位建议"]}
                      </p>
                    </div>

                    {/* 指标参考 */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">策略判定指标参考：</p>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded p-2 text-center">
                          <span className="text-gray-500">温度:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {selectedResult.trading_strategy.indicators.temperature.toFixed(4)}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded p-2 text-center">
                          <span className="text-gray-500">熵:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {selectedResult.trading_strategy.indicators.entropy.toFixed(4)}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded p-2 text-center">
                          <span className="text-gray-500">动量:</span>
                          <span className={`ml-1 font-medium ${
                            selectedResult.trading_strategy.indicators.momentum >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {selectedResult.trading_strategy.indicators.momentum.toFixed(4)}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/30 rounded p-2 text-center">
                          <span className="text-gray-500">Hurst:</span>
                          <span className="ml-1 font-medium text-gray-900 dark:text-white">
                            {selectedResult.trading_strategy.indicators.hurst.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    当日行情数据
                  </h3>
                  {selectedResult.daily_data && selectedResult.daily_data.current_price > 0 && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">现价</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ¥{selectedResult.daily_data.current_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">昨收</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ¥{selectedResult.daily_data.prev_close.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">开盘</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ¥{selectedResult.daily_data.open_price.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">最高</p>
                          <p className="text-lg font-bold text-red-600">
                            ¥{selectedResult.daily_data.high.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">最低</p>
                          <p className="text-lg font-bold text-green-600">
                            ¥{selectedResult.daily_data.low.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className={`rounded-lg p-4 ${
                          selectedResult.daily_data.change_pct > 0
                            ? 'bg-red-50 dark:bg-red-900/20'
                            : selectedResult.daily_data.change_pct < 0
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {selectedResult.daily_data.change_pct > 0 ? (
                              <ArrowUpRight className="w-5 h-5 text-red-600" />
                            ) : selectedResult.daily_data.change_pct < 0 ? (
                              <ArrowDownRight className="w-5 h-5 text-green-600" />
                            ) : (
                              <Minus className="w-5 h-5 text-gray-500" />
                            )}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">涨跌幅</span>
                          </div>
                          <p className={`text-2xl font-bold ${
                            selectedResult.daily_data.change_pct > 0 ? 'text-red-600' :
                            selectedResult.daily_data.change_pct < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {selectedResult.daily_data.change_pct > 0 ? '+' : ''}{selectedResult.daily_data.change_pct.toFixed(2)}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            涨跌额: {selectedResult.daily_data.change_amount > 0 ? '+' : ''}{selectedResult.daily_data.change_amount.toFixed(4)}
                          </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">振幅</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">
                            {selectedResult.daily_data.daily_analysis?.spread?.toFixed(2) ?? 0}%
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedResult.daily_data.daily_analysis?.spread_status ?? ''}
                          </p>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">开盘情况</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {selectedResult.daily_data.daily_analysis?.gap_status ?? ''}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            缺口: {selectedResult.daily_data.daily_analysis?.gap?.toFixed(2) ?? 0}%
                          </p>
                        </div>
                      </div>

                      {selectedResult.daily_data.daily_analysis?.change_status && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">行情解读</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            今日{selectedResult.daily_data.daily_analysis.change_status}，{selectedResult.daily_data.daily_analysis.spread_status}，{selectedResult.daily_data.daily_analysis.gap_status}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {selectedResult.news && selectedResult.news.summary && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="text-xl"></span>
                      消息面分析
                      <span className={`ml-auto text-sm px-3 py-1 rounded-full font-medium ${
                        selectedResult.news.summary.overall_sentiment === 'positive' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        selectedResult.news.summary.overall_sentiment === 'negative' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {selectedResult.news.summary.overall_label}
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">总消息数</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedResult.news.summary.total}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">利好</p>
                        <p className="text-xl font-bold text-red-600">
                          {selectedResult.news.summary.positive}
                        </p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">利空</p>
                        <p className="text-xl font-bold text-green-600">
                          {selectedResult.news.summary.negative}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">中性</p>
                        <p className="text-xl font-bold text-gray-600">
                          {selectedResult.news.summary.neutral}
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">重要</p>
                        <p className="text-xl font-bold text-orange-600">
                          {selectedResult.news.summary.important}
                        </p>
                      </div>
                    </div>

                    {selectedResult.news.articles && selectedResult.news.articles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">筛选消息（利好/利空/重要）：</p>
                        {selectedResult.news.articles.map((article, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-3 p-3 rounded-lg border ${
                              article.importance === 'high'
                                ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                                : article.sentiment === 'positive'
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                                : article.sentiment === 'negative'
                                ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                                : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex-shrink-0 flex flex-col items-center gap-1">
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                article.sentiment === 'positive' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                article.sentiment === 'negative' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              }`}>
                                {article.sentiment_label}
                              </span>
                              {article.importance !== 'normal' && (
                                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                  article.importance === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                  {article.importance === 'high' ? '重要' : '关注'}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">
                                {article.title}
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>{article.date}</span>
                                {article.media_name && <span>{article.media_name}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!selectedResult.news.articles || selectedResult.news.articles.length === 0) && (
                      <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400">暂无相关消息</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    持仓影响分析
                  </h3>
                  {selectedResult.holding_impact && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">成本价</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            ¥{selectedResult.holding_impact.cost_price.toFixed(2)}
                          </p>
                        </div>
                        <div className={`rounded-lg p-4 ${
                          selectedResult.holding_impact.profit_pct > 0
                            ? 'bg-red-50 dark:bg-red-900/20'
                            : selectedResult.holding_impact.profit_pct < 0
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">盈亏比例</p>
                          <p className={`text-xl font-bold ${
                            selectedResult.holding_impact.profit_pct > 0 ? 'text-red-600' :
                            selectedResult.holding_impact.profit_pct < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {selectedResult.holding_impact.profit_pct > 0 ? '+' : ''}{selectedResult.holding_impact.profit_pct.toFixed(2)}%
                          </p>
                        </div>
                        <div className={`rounded-lg p-4 ${
                          selectedResult.holding_impact.profit_amount > 0
                            ? 'bg-red-50 dark:bg-red-900/20'
                            : selectedResult.holding_impact.profit_amount < 0
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">盈亏金额</p>
                          <p className={`text-xl font-bold ${
                            selectedResult.holding_impact.profit_amount > 0 ? 'text-red-600' :
                            selectedResult.holding_impact.profit_amount < 0 ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {selectedResult.holding_impact.profit_amount > 0 ? '+' : ''}¥{selectedResult.holding_impact.profit_amount.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {selectedResult.holding_impact.impact_analysis.map((impact, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                          >
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center text-blue-600 text-sm font-medium">
                              {index + 1}
                            </span>
                            <p className="text-gray-700 dark:text-gray-300">{impact}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    市场状态解读
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStateColor(selectedResult.state)}`}>
                      {selectedResult.state_info.description}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-400">特征</span>
                      </div>
                      <ul className="space-y-1">
                        {selectedResult.state_info.characteristics.map((char, index) => (
                          <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-400">操作策略</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{selectedResult.state_info.strategy}</p>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 col-span-full">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="font-medium text-red-800 dark:text-red-400">风险提示</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">{selectedResult.state_info.risk}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    指标深度解读
                  </h3>
                  <div className="space-y-3">
                    {selectedResult.interpretations.map((interpretation, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-sm font-medium">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 dark:text-gray-300">{interpretation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
