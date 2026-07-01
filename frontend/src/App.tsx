import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { Dashboard } from '@/pages/Dashboard';
import { Holdings } from '@/pages/Holdings';
import { Reports } from '@/pages/Reports';
import { useAppStore } from '@/store';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { loadAnalysisResults, loadHoldings, loadReports, isLoading } = useAppStore();

  useEffect(() => {
    const isDark = window.localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleRefresh = () => {
    loadAnalysisResults();
    loadHoldings();
    loadReports();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'holdings':
        return <Holdings />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header onRefresh={handleRefresh} isRefreshing={isLoading} />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}