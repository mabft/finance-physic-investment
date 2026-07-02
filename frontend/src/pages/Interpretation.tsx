import { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle, XCircle, BarChart3, Thermometer, Zap, Target, RefreshCw } from 'lucide-react';

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
}

export function Interpretation() {
  const [results, setResults] = useState<InterpretationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<InterpretationResult | null>(null);

  const fetchInterpretations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/interpretation/all');
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
        if (data.results.length > 0) {
          setSelectedResult(data.results[0]);
        }
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
        <button
          onClick={fetchInterpretations}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          刷新数据
        </button>
      </div>

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
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStateColor(result.state)}`}>
                        {result.state}
                      </span>
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