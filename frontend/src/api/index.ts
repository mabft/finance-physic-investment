import type { Holding, Instrument, AnalysisResult, Report, ReportContent, RealtimeData, GlobalIndex, FundData, PortfolioSummary } from '@/types';

const API_BASE = '/api';

export const configApi = {
  getHoldings: async (): Promise<{ holdings: Holding[] }> => {
    const res = await fetch(`${API_BASE}/config/holdings`);
    return res.json();
  },

  updateHoldings: async (holdings: Holding[]): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/config/holdings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holdings),
    });
    return res.json();
  },

  addHolding: async (holding: Holding): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/config/holdings/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holding),
    });
    return res.json();
  },

  editHolding: async (code: string, holding: Holding): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/config/holdings/${code}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(holding),
    });
    return res.json();
  },

  deleteHolding: async (code: string): Promise<{ success: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/config/holdings/${code}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  getInstruments: async (): Promise<{ instruments: Record<string, Instrument[]> }> => {
    const res = await fetch(`${API_BASE}/config/instruments`);
    return res.json();
  },

  searchInstrument: async (keyword: string): Promise<{ results: Instrument[] }> => {
    const res = await fetch(`${API_BASE}/config/search_instrument/${keyword}`);
    return res.json();
  },
};

export const dataApi = {
  getAllData: async (): Promise<{ instruments: RealtimeData[]; timestamp: string }> => {
    const res = await fetch(`${API_BASE}/data/all`);
    return res.json();
  },

  getPriceSeries: async (): Promise<{ price_data: Record<string, number[]>; timestamp: string }> => {
    const res = await fetch(`${API_BASE}/data/price_series`);
    return res.json();
  },

  getFunds: async (): Promise<{ funds: FundData[]; timestamp: string }> => {
    const res = await fetch(`${API_BASE}/data/funds`);
    return res.json();
  },

  getGlobalIndices: async (): Promise<{ indices: GlobalIndex[]; timestamp: string }> => {
    const res = await fetch(`${API_BASE}/data/global`);
    return res.json();
  },
};

export const analysisApi = {
  analyzeAll: async (): Promise<{ results: AnalysisResult[]; summary: PortfolioSummary; price_data: Record<string, number[]>; timestamp: string }> => {
    const res = await fetch(`${API_BASE}/analysis/all`);
    return res.json();
  },

  getMetrics: async (tickerName: string): Promise<AnalysisResult & { timestamp: string }> => {
    const res = await fetch(`${API_BASE}/analysis/metrics/${tickerName}`);
    return res.json();
  },

  triggerAnalysis: async (type: string): Promise<{ success: boolean; message: string; report_path?: string }> => {
    const res = await fetch(`${API_BASE}/analysis/trigger?request_type=${type}`);
    return res.json();
  },
};

export const reportsApi = {
  listReports: async (): Promise<{ reports: Report[] }> => {
    const res = await fetch(`${API_BASE}/reports/list`);
    return res.json();
  },

  getReportContent: async (filename: string): Promise<ReportContent> => {
    const res = await fetch(`${API_BASE}/reports/content/${filename}`);
    return res.json();
  },

  downloadReport: async (filename: string): Promise<Blob> => {
    const res = await fetch(`${API_BASE}/reports/download/${filename}`);
    return res.blob();
  },
};

export const healthApi = {
  check: async (): Promise<{ status: string; message: string }> => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
};