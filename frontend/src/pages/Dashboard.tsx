import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { MetricCard } from '@/components/Cards/MetricCard';
import { StateCard } from '@/components/Cards/StateCard';
import { PriceChart } from '@/components/Charts/PriceChart';
import { TrendingUp, TrendingDown, ShoppingCart, Clock, AlertTriangle, Info, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { AnalysisResult } from '@/types';

export function Dashboard() {
  const { analysisResults, holdings, loadAnalysisResults, loadHoldings, isLoading } = useAppStore();
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisResults();
    loadHoldings();
  }, []);

  const selectedResult = selectedTicker
    ? analysisResults.find((r) => r.name === selectedTicker)
    : analysisResults[0] || null;

  const getAdvice = (score: number, multiplier: number, state: string) => {
    if (state === 'CRISIS') {
      return { text: '避险', color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle };
    }

    if (score >= 75 && multiplier >= 0.8) {
      return { text: '买入', color: 'text-green-600', bg: 'bg-green-100', icon: TrendingUp };
    }

    if (score >= 60) {
      return { text: '持有', color: 'text-blue-600', bg: 'bg-blue-100', icon: Info };
    }

    if (score >= 40) {
      return { text: '观望', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: Info };
    }

    if (state.includes('BEAR')) {
      return { text: '减仓', color: 'text-orange-600', bg: 'bg-orange-100', icon: TrendingDown };
    }

    return { text: '卖出', color: 'text-red-600', bg: 'bg-red-100', icon: TrendingDown };
  };

  const getPriceGuidance = (result: AnalysisResult) => {
    const { current_price, change_pct, profit_pct, state, position_multiplier } = result;
    const guidance: string[] = [];

    if (!current_price) {
      return [' 暂无实时价格数据'];
    }

    guidance.push(`💰 现价 ¥${current_price.toFixed(2)}`);

    if (change_pct !== null) {
      if (change_pct > 0) {
        guidance.push(`📈 今日涨幅 +${change_pct.toFixed(2)}%`);
      } else if (change_pct < 0) {
        guidance.push(`📉 今日跌幅 ${change_pct.toFixed(2)}%`);
      } else {
        guidance.push(`➡️ 今日平盘 0.00%`);
      }
    }

    if (profit_pct !== null) {
      if (profit_pct > 0) {
        guidance.push(`✅ 持仓盈利 +${profit_pct.toFixed(2)}%`);
      } else if (profit_pct < 0) {
        guidance.push(`📉 持仓亏损 ${profit_pct.toFixed(2)}%`);
      } else {
        guidance.push(`➡️ 持仓持平`);
      }
    }

    if (state === 'CRISIS') {
      guidance.push(`⚠️ 危机状态：建议立即减仓或清仓，现价 ¥${current_price.toFixed(2)} 附近止损`);
    } else if (state.includes('BULL_TREND')) {
      guidance.push(`📈 牛市趋势：可在回调至 ¥${(current_price * 0.97).toFixed(2)} 附近加仓`);
    } else if (state.includes('BULL_MEANREV')) {
      guidance.push(`📊 牛市回调：可逢低在 ¥${(current_price * 0.95).toFixed(2)} 附近分批买入`);
    } else if (state.includes('BEAR_TREND')) {
      guidance.push(`📉 熊市趋势：反弹至 ¥${(current_price * 1.03).toFixed(2)} 附近减仓`);
    } else if (state.includes('BEAR_MEANREV')) {
      guidance.push(`🔄 熊市反弹：谨慎参与，止损设在 ¥${(current_price * 0.97).toFixed(2)}`);
    } else if (state === 'SIDEWAYS') {
      guidance.push(`↔️ 横盘震荡：可在 ¥${(current_price * 0.97).toFixed(2)} - ¥${(current_price * 1.03).toFixed(2)} 区间高抛低吸`);
    } else if (state === 'TRANSITION') {
      guidance.push(`🔄 状态转换中：观望为主，等待方向明确`);
    }

    if (position_multiplier < 0.3) {
      guidance.push(`📉 仓位系数 ${position_multiplier.toFixed(2)}x，建议轻仓或空仓`);
    } else if (position_multiplier > 0.8) {
      guidance.push(`📈 仓位系数 ${position_multiplier.toFixed(2)}x，可正常配置`);
    } else {
      guidance.push(`📊 仓位系数 ${position_multiplier.toFixed(2)}x，适度参与`);
    }

    return guidance;
  };

  const getDetailedAdvice = (result: AnalysisResult) => {
    const { metrics, state, screen_score, position_multiplier } = result;
    const advice = [];

    if (state === 'CRISIS') {
      advice.push('⚠️ 市场处于危机状态，建议大幅降低仓位');
    } else if (state.includes('BULL_TREND')) {
      advice.push('📈 牛市趋势确认，可适当放大仓位');
    } else if (state.includes('BEAR_TREND')) {
      advice.push(' 熊市趋势确认，建议防御为主');
    } else if (state.includes('SIDEWAYS')) {
      advice.push('↔️ 横盘整理阶段，适合网格交易');
    }

    if (metrics.temperature > 0.15) {
      advice.push('🌡️ 温度过高(波动率极高)，风险加大');
    } else if (metrics.temperature > 0.08) {
      advice.push('🌡️ 温度偏高，注意风险控制');
    } else if (metrics.temperature < 0.03) {
      advice.push('🌡️ 温度正常，市场稳定');
    }

    if (metrics.entropy > 2.5) {
      advice.push('🔀 熵值高，市场混沌无序，操作难度大');
    } else if (metrics.entropy < 1.5) {
      advice.push(' 熵值低，市场有序，趋势明确');
    }

    if (metrics.momentum > 0.5) {
      advice.push(' 动量强劲向上，趋势加速');
    } else if (metrics.momentum < -0.5) {
      advice.push('💨 动量强劲向下，注意止损');
    }

    if (metrics.hurst > 0.55) {
      advice.push('📊 Hurst>0.55，趋势持续性强，适合趋势跟踪');
    } else if (metrics.hurst < 0.45) {
      advice.push(' Hurst<0.45，均值回归特征明显，适合逢低布局');
    }

    if (position_multiplier < 0.3) {
      advice.push('📉 仓位系数极低，建议现金为王');
    } else if (position_multiplier > 0.8) {
      advice.push('📈 仓位系数较高，可以正常配置');
    }

    if (screen_score >= 75) {
      advice.push('⭐ 综合评分优秀，可作为重点关注标的');
    } else if (screen_score < 40) {
      advice.push('⭐ 综合评分偏低，建议谨慎对待');
    }

    return advice;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">四维物理金融指标分析</h2>
          <p className="text-gray-500 dark:text-gray-400">实时监控持仓标的的温度、熵、动量、Hurst指数</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>最后更新: {new Date().toLocaleTimeString('zh-CN')}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : analysisResults.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无分析数据，请等待定时任务执行或手动触发分析</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">标的列表</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">标的</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">现价</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">涨跌</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">盈亏</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">状态</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">温度</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">动量</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">评分</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">仓位</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">建议</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.map((result) => {
                        const advice = getAdvice(result.screen_score, result.position_multiplier, result.state);
                        const AdviceIcon = advice.icon;
                        const isSelected = selectedTicker === result.name;
                        return (
                          <tr
                            key={result.name}
                            onClick={() => setSelectedTicker(result.name)}
                            className={`border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900 dark:text-white">{result.name}</div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {result.current_price ? `¥${result.current_price.toFixed(2)}` : '-'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {result.change_pct !== null ? (
                                <span className={`inline-flex items-center gap-1 font-medium ${
                                  result.change_pct > 0 ? 'text-red-600' : result.change_pct < 0 ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                  {result.change_pct > 0 ? <ArrowUpRight className="w-3 h-3" /> : result.change_pct < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                  {result.change_pct > 0 ? '+' : ''}{result.change_pct.toFixed(2)}%
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {result.profit_pct !== null ? (
                                <span className={`font-medium ${
                                  result.profit_pct > 0 ? 'text-red-600' : result.profit_pct < 0 ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                  {result.profit_pct > 0 ? '+' : ''}{result.profit_pct.toFixed(2)}%
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                result.state.includes('BULL') ? 'bg-green-100 text-green-800' :
                                result.state.includes('BEAR') ? 'bg-red-100 text-red-800' :
                                result.state === 'CRISIS' ? 'bg-purple-100 text-purple-800' :
                                result.state.includes('TRANSITION') ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {result.state}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                result.metrics.temperature > 0.15 ? 'bg-red-100 text-red-800' :
                                result.metrics.temperature > 0.08 ? 'bg-orange-100 text-orange-800' :
                                result.metrics.temperature > 0.03 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {result.metrics.temperature.toFixed(4)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`font-medium ${result.metrics.momentum > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {result.metrics.momentum > 0 ? '+' : ''}{result.metrics.momentum.toFixed(4)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-gray-900 dark:text-white font-medium">
                              {result.screen_score}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`font-medium ${result.position_multiplier >= 0.8 ? 'text-green-600' : result.position_multiplier < 0.3 ? 'text-red-600' : 'text-yellow-600'}`}>
                                {result.position_multiplier.toFixed(2)}x
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${advice.bg} ${advice.color}`}>
                                <AdviceIcon className="w-3 h-3" />
                                {advice.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">持仓概览</h3>
                <div className="space-y-3">
                  {holdings.slice(0, 5).map((holding) => (
                    <div key={holding.code} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{holding.name || holding.code}</p>
                        <p className="text-xs text-gray-500">成本: ¥{holding.cost_price}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{holding.quantity}份</p>
                        {holding.is_dca && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-800">
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            定投
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {holdings.length === 0 && (
                    <p className="text-center text-gray-500 py-4">暂无持仓数据</p>
                  )}
                </div>
              </div>

              <StateCard
                state={selectedResult?.state || 'SIDEWAYS'}
                score={selectedResult?.screen_score || 0}
                multiplier={selectedResult?.position_multiplier || 1}
              />
            </div>
          </div>

          {selectedResult && (
            <div className="space-y-6">
              <MetricCard metrics={selectedResult.metrics} />
              <PriceChart prices={selectedResult.prices} title={`${selectedResult.name} 价格走势`} />

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💰 价格指引与操作建议</h3>
                <div className="space-y-2">
                  {getPriceGuidance(selectedResult).map((guidance, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{guidance}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 指标分析建议</h3>
                <div className="space-y-2">
                  {getDetailedAdvice(selectedResult).map((advice, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <span className="text-sm">{advice}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
