import { TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import type { MarketState } from '@/types';

interface StateCardProps {
  state: MarketState;
  score: number;
  multiplier: number;
}

const stateConfig: Record<MarketState, { label: string; color: string; bgColor: string; icon: typeof TrendingUp }> = {
  BULL_TREND: { label: '牛市趋势', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20', icon: TrendingUp },
  BULL_MEANREV: { label: '牛市反转', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', icon: ArrowRightLeft },
  SIDEWAYS: { label: '震荡整理', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-50 dark:bg-gray-700/30', icon: Minus },
  BEAR_MEANREV: { label: '熊市反转', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20', icon: ArrowRightLeft },
  BEAR_TREND: { label: '熊市趋势', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20', icon: TrendingDown },
  CRISIS: { label: '危机状态', color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20', icon: AlertTriangle },
  TRANSITION: { label: '过渡状态', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20', icon: ArrowRightLeft },
};

export function StateCard({ state, score, multiplier }: StateCardProps) {
  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl p-4 ${config.bgColor} border ${config.color.replace('text-', 'border-')}/30`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 ${config.bgColor} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div>
          <h3 className={`font-bold text-lg ${config.color}`}>{config.label}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">市场状态分类</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">筛选评分</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{score.toFixed(2)}</p>
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">仓位乘数</p>
          <p className={`text-xl font-bold ${multiplier >= 1 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {multiplier.toFixed(2)}x
          </p>
        </div>
      </div>
    </div>
  );
}