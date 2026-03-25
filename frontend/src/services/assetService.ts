import apiClient from "@/services/client";

export interface Asset {
  ticker: string;
  name: string;
}

export const assetService = {
  searchTickers: async (query: string) => {
    const response = await apiClient.get<Asset[]>(
      `/assets/ticker-search?q=${query}`,
    );
    return response.data;
  },
};
