export interface Holding {
  code: string;
  name: string;
  cost_price: number;
  quantity: number;
  is_dca: boolean;
}

export interface Instrument {
  code: string;
  name: string;
  type: string;
  prefix?: string;
  is_etf?: boolean;
}

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Metrics {
  temperature: number;
  entropy: number;
  momentum: number;
  hurst: number;
}

export interface AnalysisResult {
  name: string;
  metrics: Metrics;
  state: MarketState;
  screen_score: number;
  position_multiplier: number;
  prices: number[];
}

export type MarketState = 
  | 'BULL_TREND' 
  | 'BULL_MEANREV' 
  | 'SIDEWAYS' 
  | 'BEAR_MEANREV' 
  | 'BEAR_TREND' 
  | 'CRISIS' 
  | 'TRANSITION';

export interface Report {
  filename: string;
  type: string;
  date: string;
  timestamp: number;
}

export interface ReportContent {
  content: string;
  filename: string;
  type: string;
  date: string;
}

export interface RealtimeData {
  code: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  amount: number;
}

export interface GlobalIndex {
  code: string;
  name: string;
  type: string;
  price?: number;
  change?: number;
  change_percent?: number;
}

export interface FundData {
  code: string;
  name: string;
  nav: number;
  type: string;
}

export interface PositionAdvice {
  code: string;
  name: string;
  current_price: number;
  cost_price: number;
  quantity: number;
  profit: number;
  profit_percent: number;
  market_state: MarketState;
  screen_score: number;
  position_multiplier: number;
  advice: 'BUY' | 'SELL' | 'HOLD' | 'ACCUMULATE';
  advice_text: string;
}