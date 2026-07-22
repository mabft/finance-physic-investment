import { useRef, useEffect } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

interface KLineData {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  turnover: number;
}

interface TurnoverAnalysis {
  avg_turnover: number;
  current_turnover: number;
  turnover_trend: string;
  market_position: string;
  turnover_level: string;
  analysis: string;
}

interface KLineChartProps {
  data: KLineData[];
  turnoverAnalysis: TurnoverAnalysis;
}

function getMarketPositionColor(position: string) {
  if (position === '高位') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (position === '低位') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (position === '震荡') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
  return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
}

function getTurnoverLevelColor(level: string) {
  if (level === '高') return 'text-red-600';
  if (level === '低') return 'text-green-600';
  return 'text-yellow-600';
}

function getTrendIcon(trend: string) {
  if (trend === '上升') return '↑';
  if (trend === '下降') return '↓';
  return '→';
}

export function KLineChart({ data, turnoverAnalysis }: KLineChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const labels = data.map(d => d.date.slice(5)); // MM-DD
    const closes = data.map(d => d.close);
    const volumes = data.map(d => d.volume);
    const turnovers = data.map(d => d.turnover);

    // 计算MA5和MA20
    const ma5 = closes.map((_, i) => {
      if (i < 4) return null;
      return closes.slice(i - 4, i + 1).reduce((a, b) => a + b, 0) / 5;
    });
    const ma20 = closes.map((_, i) => {
      if (i < 19) return null;
      return closes.slice(i - 19, i + 1).reduce((a, b) => a + b, 0) / 20;
    });

    // 成交量颜色（涨红跌绿）
    const volumeColors = data.map((d, i) => {
      if (i === 0) return 'rgba(156, 163, 175, 0.5)';
      return d.close >= data[i - 1].close
        ? 'rgba(239, 68, 68, 0.6)'
        : 'rgba(34, 197, 94, 0.6)';
    });

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'line',
            label: '收盘价',
            data: closes,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.1,
            yAxisID: 'y',
            order: 1,
          },
          {
            type: 'line',
            label: 'MA5',
            data: ma5,
            borderColor: 'rgb(245, 158, 11)',
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: 0.1,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'MA20',
            data: ma20,
            borderColor: 'rgb(168, 85, 247)',
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: 0.1,
            yAxisID: 'y',
            order: 3,
          },
          {
            type: 'bar',
            label: '成交量',
            data: volumes,
            backgroundColor: volumeColors,
            yAxisID: 'y1',
            order: 4,
          },
          {
            type: 'line',
            label: '换手率(%)',
            data: turnovers,
            borderColor: 'rgb(236, 72, 153)',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 3,
            tension: 0.1,
            yAxisID: 'y2',
            order: 0,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              font: { size: 11 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: { size: 12 },
            bodyFont: { size: 11 },
            padding: 10,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                if (label === '换手率(%)') return `${label}: ${value.toFixed(2)}%`;
                if (label === '成交量') return `${label}: ${(value / 10000).toFixed(1)}万`;
                return `${label}: ${value.toFixed(3)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 10,
              font: { size: 10 },
            },
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: '价格', font: { size: 11 } },
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { font: { size: 10 } },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: '成交量', font: { size: 11 } },
            grid: { drawOnChartArea: false },
            ticks: {
              font: { size: 10 },
              callback: (value) => `${(Number(value) / 10000).toFixed(0)}万`,
            },
          },
          y2: {
            type: 'linear',
            display: false,
            position: 'right',
            grid: { drawOnChartArea: false },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          日K线图
        </h3>
        <div className="text-center py-12 text-gray-400">
          暂无K线数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          日K线图（近60日）
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getMarketPositionColor(turnoverAnalysis.market_position)}`}>
            {turnoverAnalysis.market_position}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            换手率: <span className={`font-bold ${getTurnoverLevelColor(turnoverAnalysis.turnover_level)}`}>
              {turnoverAnalysis.turnover_level}
            </span>
            {getTrendIcon(turnoverAnalysis.turnover_trend)}
          </span>
        </div>
      </div>

      {/* 换手率分析摘要 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">当前换手率</p>
          <p className={`text-lg font-bold ${getTurnoverLevelColor(turnoverAnalysis.turnover_level)}`}>
            {turnoverAnalysis.current_turnover.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">20日均值</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {turnoverAnalysis.avg_turnover.toFixed(2)}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">换手趋势</p>
          <p className={`text-lg font-bold ${
            turnoverAnalysis.turnover_trend === '上升' ? 'text-red-600' :
            turnoverAnalysis.turnover_trend === '下降' ? 'text-green-600' : 'text-gray-600'
          }`}>
            {getTrendIcon(turnoverAnalysis.turnover_trend)} {turnoverAnalysis.turnover_trend}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">市场位置</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {turnoverAnalysis.market_position}
          </p>
        </div>
      </div>

      {/* 分析说明 */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>分析：</strong>{turnoverAnalysis.analysis}
        </p>
      </div>

      {/* 图表 */}
      <div className="relative h-80">
        <canvas ref={chartRef}></canvas>
      </div>

      {/* 图例说明 */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-blue-500 inline-block"></span> 收盘价
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-amber-500 inline-block"></span> MA5
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-purple-500 inline-block"></span> MA20
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-red-400/60 inline-block rounded-sm"></span> 涨量
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-green-400/60 inline-block rounded-sm"></span> 跌量
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-pink-500 inline-block"></span> 换手率
        </span>
      </div>
    </div>
  );
}
