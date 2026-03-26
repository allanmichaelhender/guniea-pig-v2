import apiClient from "@/services/client";

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

export const portfolioService = {
  simulate: async (
    holdings: Holding[],
    startDate?: string,
  ): Promise<SimulationResult> => {
    const response = await apiClient.post("/portfolio/simulate", {
      holdings,
      start_date: startDate,
    });
    return response.data;
  },
  search: async (query: string) => {
    const response = await apiClient.get("/search", { params: { q: query } });
    return response.data;
  },
};
