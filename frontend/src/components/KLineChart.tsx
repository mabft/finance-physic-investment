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
}

interface VolumeAnalysis {
  avg_volume: number;
  current_volume: number;
  volume_trend: string;
  market_position: string;
  volume_level: string;
  analysis: string;
}

interface KLineChartProps {
  data: KLineData[];
  volumeAnalysis: VolumeAnalysis;
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

export function KLineChart({ data, volumeAnalysis }: KLineChartProps) {
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
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          日K线图与成交量分析（近60日）
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          通过价格走势和成交量变化，判断当前市场活跃度和所处位置
        </p>
      </div>

      {/* 成交量分析摘要 - 更直观的展示 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 左侧：成交量数据 */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            成交量数据
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">今日成交量</span>
              <span className={`text-base font-bold ${getTurnoverLevelColor(volumeAnalysis.volume_level)}`}>
                {(volumeAnalysis.current_volume / 10000).toFixed(1)}万手
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">20日平均量</span>
              <span className="text-base font-bold text-gray-900 dark:text-white">
                {(volumeAnalysis.avg_volume / 10000).toFixed(1)}万手
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">量能水平</span>
              <span className={`text-base font-bold ${getTurnoverLevelColor(volumeAnalysis.volume_level)}`}>
                {volumeAnalysis.volume_level}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">变化趋势</span>
              <span className={`text-base font-bold ${
                volumeAnalysis.volume_trend === '上升' ? 'text-red-600' :
                volumeAnalysis.volume_trend === '下降' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {getTrendIcon(volumeAnalysis.volume_trend)} {volumeAnalysis.volume_trend}
              </span>
            </div>
          </div>
        </div>

        {/* 右侧：市场位置判断 */}
        <div className={`rounded-lg p-4 border-2 ${
          volumeAnalysis.market_position === '高位' ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' :
          volumeAnalysis.market_position === '低位' ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' :
          'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
        }`}>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className={
              volumeAnalysis.market_position === '高位' ? 'text-red-900 dark:text-red-300' :
              volumeAnalysis.market_position === '低位' ? 'text-green-900 dark:text-green-300' :
              'text-yellow-900 dark:text-yellow-300'
            }>
              市场位置判断
            </span>
          </h4>
          <div className="mb-3">
            <p className={`text-2xl font-bold mb-1 ${
              volumeAnalysis.market_position === '高位' ? 'text-red-600' :
              volumeAnalysis.market_position === '低位' ? 'text-green-600' :
              'text-yellow-600'
            }`}>
              {volumeAnalysis.market_position}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {volumeAnalysis.market_position === '高位' && '价格处于高位，成交量活跃，需警惕回调风险'}
              {volumeAnalysis.market_position === '低位' && '价格处于低位，成交量萎缩，可能是底部区域'}
              {volumeAnalysis.market_position === '震荡' && '价格在区间内波动，成交量平稳，等待方向选择'}
            </p>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-700 dark:text-gray-300">
              <strong>含义：</strong>
              {volumeAnalysis.market_position === '高位' && '高位放量可能意味着主力出货，建议谨慎'}
              {volumeAnalysis.market_position === '低位' && '低位缩量可能意味着卖压减轻，可关注企稳信号'}
              {volumeAnalysis.market_position === '震荡' && '震荡整理阶段，建议观望等待突破方向'}
            </p>
          </div>
        </div>
      </div>

      {/* 分析说明 - 更突出 */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">专业分析</p>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {volumeAnalysis.analysis}
            </p>
          </div>
        </div>
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
          <span className="w-3 h-2 bg-red-400/60 inline-block rounded-sm"></span> 放量上涨
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-2 bg-green-400/60 inline-block rounded-sm"></span> 缩量下跌
        </span>
      </div>

      {/* 阅读指南 */}
      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">如何看懂这张图：</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-start gap-1">
            <span className="text-blue-500 font-bold flex-shrink-0">1.</span>
            <span>上方折线为价格走势，蓝线是收盘价，橙线(MA5)和紫线(MA20)是均线，均线交叉可判断趋势方向</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-blue-500 font-bold flex-shrink-0">2.</span>
            <span>下方柱状图是每日成交量，红色表示当日上涨，绿色表示当日下跌，柱子越高代表成交越活跃</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="text-blue-500 font-bold flex-shrink-0">3.</span>
            <span>结合上方成交量数据和市场位置判断，高位放量需警惕，低位缩量可能是底部信号</span>
          </div>
        </div>
      </div>
    </div>
  );
}
