import apiClient from "@/services/client";

export interface PortfolioHolding {
  ticker: string;
  weight: number;
}

export interface PortfolioAnalysisRequest {
  name: string;
  holdings: PortfolioHolding[];
  start_date?: string;
}

export const llmService = {
  analyzePortfolio: async (data: PortfolioAnalysisRequest) => {
    const response = await apiClient.post<{ analysis: string }>(
      "/llm/analyze",
      data,
    );
    return response.data;
  },

  smartSearch: async (prompt: string, limit: number = 10) => {
    const response = await apiClient.post("/llm/smart-search", {
      prompt,
      limit,
    });
    return response.data;
  },
};
