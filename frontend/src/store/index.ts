import { create } from 'zustand';
import type { Holding, Instrument, AnalysisResult, Report, ReportContent, RealtimeData, GlobalIndex, FundData } from '@/types';
import { configApi, dataApi, analysisApi, reportsApi } from '@/api';

interface AppState {
  holdings: Holding[];
  instruments: Record<string, Instrument[]>;
  analysisResults: AnalysisResult[];
  reports: Report[];
  currentReport: ReportContent | null;
  realtimeData: RealtimeData[];
  globalIndices: GlobalIndex[];
  funds: FundData[];
  isLoading: boolean;
  error: string | null;

  loadHoldings: () => Promise<void>;
  updateHoldings: (holdings: Holding[]) => Promise<void>;
  addHolding: (holding: Holding) => Promise<void>;
  editHolding: (code: string, holding: Holding) => Promise<void>;
  deleteHolding: (code: string) => Promise<void>;

  loadInstruments: () => Promise<void>;
  loadAnalysisResults: () => Promise<void>;
  loadRealtimeData: () => Promise<void>;
  loadGlobalIndices: () => Promise<void>;
  loadFunds: () => Promise<void>;
  loadReports: () => Promise<void>;
  loadReportContent: (filename: string) => Promise<void>;

  triggerAnalysis: (type: string) => Promise<void>;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  holdings: [],
  instruments: {},
  analysisResults: [],
  reports: [],
  currentReport: null,
  realtimeData: [],
  globalIndices: [],
  funds: [],
  isLoading: false,
  error: null,

  loadHoldings: async () => {
    set({ isLoading: true, error: null });
    try {
      const { holdings } = await configApi.getHoldings();
      set({ holdings });
    } catch (err) {
      set({ error: '加载持仓数据失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateHoldings: async (holdings) => {
    set({ isLoading: true, error: null });
    try {
      await configApi.updateHoldings(holdings);
      set({ holdings });
    } catch (err) {
      set({ error: '更新持仓数据失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  addHolding: async (holding) => {
    set({ isLoading: true, error: null });
    try {
      await configApi.addHolding(holding);
      set((state) => ({ holdings: [...state.holdings, holding] }));
    } catch (err) {
      set({ error: '添加标的失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  editHolding: async (code, holding) => {
    set({ isLoading: true, error: null });
    try {
      await configApi.editHolding(code, holding);
      set((state) => ({
        holdings: state.holdings.map((h) => (h.code === code ? holding : h)),
      }));
    } catch (err) {
      set({ error: '更新标的失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteHolding: async (code) => {
    set({ isLoading: true, error: null });
    try {
      await configApi.deleteHolding(code);
      set((state) => ({ holdings: state.holdings.filter((h) => h.code !== code) }));
    } catch (err) {
      set({ error: '删除标的失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadInstruments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { instruments } = await configApi.getInstruments();
      set({ instruments });
    } catch (err) {
      set({ error: '加载标的列表失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadAnalysisResults: async () => {
    set({ isLoading: true, error: null });
    try {
      const { results } = await analysisApi.analyzeAll();
      set({ analysisResults: results || [] });
    } catch (err) {
      set({ error: '加载分析结果失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadRealtimeData: async () => {
    set({ isLoading: true, error: null });
    try {
      const { instruments } = await dataApi.getAllData();
      set({ realtimeData: instruments || [] });
    } catch (err) {
      set({ error: '加载实时数据失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadGlobalIndices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { indices } = await dataApi.getGlobalIndices();
      set({ globalIndices: indices || [] });
    } catch (err) {
      set({ error: '加载全球指数失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadFunds: async () => {
    set({ isLoading: true, error: null });
    try {
      const { funds } = await dataApi.getFunds();
      set({ funds: funds || [] });
    } catch (err) {
      set({ error: '加载基金数据失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const { reports } = await reportsApi.listReports();
      set({ reports: reports || [] });
    } catch (err) {
      set({ error: '加载报告列表失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadReportContent: async (filename) => {
    set({ isLoading: true, error: null });
    try {
      const content = await reportsApi.getReportContent(filename);
      set({ currentReport: content });
    } catch (err) {
      set({ error: '加载报告内容失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  triggerAnalysis: async (type) => {
    set({ isLoading: true, error: null });
    try {
      await analysisApi.triggerAnalysis(type);
    } catch (err) {
      set({ error: '触发分析失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));