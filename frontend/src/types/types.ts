export interface SimulationResponse {
  metrics: Record<string, number>;
  performance_chart: Array<Record<string, any>>;
  simulation_metadata: Record<string, any>;
  narrative?: string | null;
}

export interface PortfolioAnalyzerProps {
  result: SimulationResponse;
}

export interface PortfolioBuilderProps {
  onSimulationComplete: (result: SimulationResponse) => void;
}


export interface LatestTabProps {
  loadingNarrative: boolean;
  narrative: string | null;
  formatPct: (val: number) => string;
  result: SimulationResponse
}



// AnalysisResponse in backend
export interface LLMAnalysisResponse {
  analysis: string;
}

export interface HoldingSchema {
  ticker: string;
  weight: number;
}

export interface PortfolioIn {
  name: string;
  description?: string | null;
  start_date?: string; // Dates are transmitted as ISO strings in JSON
  holdings: HoldingSchema[];
}

// PortfolioOut in Backend
export interface PortfolioResponse extends PortfolioIn {
  id: number;
  is_public: boolean;
  annualized_return: number | null;
  volatility: number | null;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  performance_history: Array<Record<string, any>> | null;
}

export interface MetricCardProps {
  label: string;
  value: number | string;
  color?: string;
}

