export interface SimulationResponse {
  metrics: Record<string, number>;
  performance_chart: Array<Record<string, any>>;
  simulation_metadata: Record<string, any>;
  narrative?: string | null;
}

export interface PortfolioAnalyzerProps {
  simulationResult: SimulationResponse | null;
}

export interface PortfolioBuilderProps {
  onSimulationComplete: (simulationResult: SimulationResponse | null) => void;
}

export interface LatestTabProps {
  loadingNarrative: boolean;
  narrative: string | null;
  formatPct: (val: number) => string;
  simulationResult: SimulationResponse | null;
  riskData: RiskSummary| null;
  onSave: () => void;
  isSaving: boolean;
  portfolioName: string;
  setPortfolioName: (val: string) => void;
  portfolioDescription: string;
  setPortfolioDescription: (val: string) => void;
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
  start_date?: string;
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

export interface RiskMapPoint {
  ticker: string;
  name: string;
  cluster_id: number | null;
  cluster_x: number | null;
  cluster_y: number | null;
  is_volatility_surge: boolean;
  sigma_52: number | null;
  is_in_portfolio: boolean; 
}

export interface RiskSummary {
  total_assets: number;
  surge_count: number;
  portfolio_surge_count: number; 
  portfolio_clusters_count: number; 
  surge_percentage: number;
  clusters_count: number;
  map_data: RiskMapPoint[];
}

export interface RiskPoint {
  ticker: string;
  name: string;           
cluster_x: number; 
  cluster_y: number; 
  cluster_id: number;
  is_volatility_surge: boolean;
  is_in_portfolio: boolean; 
}

export interface RiskMapProps {
  data: RiskPoint[];
}


export interface Asset {
  ticker: string;
  name: string;
  is_base_asset: boolean; 
  sector?: string;    
}

export interface Holding {
  ticker: string;
  weight: number;
}

export interface SimulationResult {
  status: string;
  metrics: {
    annualized_return: number;
    volatility: number;
    sharpe_ratio: number;
    max_drawdown: number;
  };
  performance_chart: Array<{ date: string; value: number }>;
  narrative?: string;
  simulation_metadata?: any;
  error?: string;
}