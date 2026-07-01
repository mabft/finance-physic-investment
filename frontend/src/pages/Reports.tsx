import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import type { Report } from '@/types';
import { FileText, Download, Calendar, Clock, X, Play } from 'lucide-react';

export function Reports() {
  const { reports, currentReport, loadReports, loadReportContent, triggerAnalysis, isLoading } = useAppStore();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (selectedReport) {
      loadReportContent(selectedReport.filename);
    }
  }, [selectedReport]);

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'pre_market':
        return { label: '盘前分析', color: 'bg-blue-100 text-blue-800' };
      case 'midday':
        return { label: '午盘分析', color: 'bg-yellow-100 text-yellow-800' };
      case 'after_market':
        return { label: '收盘分析', color: 'bg-green-100 text-green-800' };
      case 'dca_weekly':
        return { label: '定投周报', color: 'bg-purple-100 text-purple-800' };
      default:
        return { label: '未知类型', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateStr: string) => {
    if (dateStr.length === 8) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  };

  const handleTriggerAnalysis = async (type: string) => {
    await triggerAnalysis(type);
    setShowAnalysisModal(false);
    loadReports();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">报告中心</h2>
          <p className="text-gray-500 dark:text-gray-400">查看历史分析报告和定时任务结果</p>
        </div>
        <button
          onClick={() => setShowAnalysisModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="w-5 h-5" />
          <span>手动触发分析</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">报告列表</h3>
                <span className="text-sm text-gray-500">共 {reports.length} 份</span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无报告，请触发分析生成</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {reports.map((report) => {
                  const typeInfo = getReportTypeLabel(report.type);
                  const isSelected = selectedReport?.filename === report.filename;
                  return (
                    <div
                      key={report.filename}
                      onClick={() => setSelectedReport(report)}
                      className={`p-4 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        <Download className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(report.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(report.timestamp * 1000).toLocaleTimeString('zh-CN')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {currentReport ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{currentReport.type}</h3>
                  <p className="text-sm text-gray-500">{formatDate(currentReport.date)}</p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {currentReport.content.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold text-gray-900 dark:text-white">{line.replace('# ', '')}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-semibold text-gray-900 dark:text-white mt-4 mb-2">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-semibold text-gray-900 dark:text-white mt-3 mb-1">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={index} className="ml-4 text-gray-700 dark:text-gray-300">
                          {line.replace('- ', '')}
                        </li>
                      );
                    }
                    if (line.match(/^\|.*\|$/)) {
                      const cells = line.split('|').filter((c) => c.trim());
                      return (
                        <div key={index} className="grid grid-cols-5 gap-2 text-sm">
                          {cells.map((cell, i) => (
                            <div key={i} className="border border-gray-200 dark:border-gray-600 p-2 text-gray-700 dark:text-gray-300">
                              {cell.trim()}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    if (line.trim()) {
                      return <p key={index} className="text-gray-700 dark:text-gray-300 mb-2">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">选择一份报告查看详情</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAnalysisModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">触发分析</h3>
              <button onClick={() => setShowAnalysisModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <button
                onClick={() => handleTriggerAnalysis('pre_market')}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">盘前分析</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">09:15 定时执行</p>
                </div>
              </button>

              <button
                onClick={() => handleTriggerAnalysis('midday')}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-800 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">午盘分析</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">12:05 定时执行</p>
                </div>
              </button>

              <button
                onClick={() => handleTriggerAnalysis('after_market')}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">收盘分析</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">15:15 定时执行</p>
                </div>
              </button>

              <button
                onClick={() => handleTriggerAnalysis('dca_weekly')}
                disabled={isLoading}
                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">定投周报</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">每周定时执行</p>
                </div>
              </button>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}