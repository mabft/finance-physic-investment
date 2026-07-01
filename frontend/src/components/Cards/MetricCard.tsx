import { Thermometer, Zap, Activity, Gauge } from 'lucide-react';
import type { Metrics } from '@/types';

interface MetricCardProps {
  metrics: Metrics;
}

const metricConfig = [
  { key: 'temperature', label: '温度 T', icon: Thermometer, color: 'orange', unit: '' },
  { key: 'entropy', label: '熵 H', icon: Activity, color: 'purple', unit: '' },
  { key: 'momentum', label: '动量 M', icon: Zap, color: 'green', unit: '' },
  { key: 'hurst', label: 'Hurst', icon: Gauge, color: 'blue', unit: '' },
];

const colorMap: Record<string, string> = {
  orange: 'from-orange-400 to-orange-500',
  purple: 'from-purple-400 to-purple-500',
  green: 'from-green-400 to-green-500',
  blue: 'from-blue-400 to-blue-500',
};

export function MetricCard({ metrics }: MetricCardProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricConfig.map((config) => {
        const Icon = config.icon;
        const value = metrics[config.key as keyof Metrics];
        return (
          <div
            key={config.key}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${colorMap[config.color]} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{config.label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' ? value.toFixed(4) : '-'}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {config.key === 'temperature' && '波动率²'}
              {config.key === 'entropy' && 'Shannon信息熵'}
              {config.key === 'momentum' && '收益/风险比'}
              {config.key === 'hurst' && '趋势持续性'}
            </div>
          </div>
        );
      })}
    </div>
  );
}