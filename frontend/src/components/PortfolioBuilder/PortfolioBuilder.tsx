import { useState } from "react";
import apiClient from "@/services/client";
import { PortfolioBuilderProps, Asset } from "@/types/types";
import SearchBar from "@/components/PortfolioBuilder/SearchBar";
import SelectedAssets from "@/components/PortfolioBuilder/SelectedAssets";


const PortfolioBuilder = ({ onSimulationComplete }: PortfolioBuilderProps) => {
  const [query, setQuery] = useState("");
  const [smartQuery, setSmartQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [smartSearchResults, setSmartSearchResults] = useState<Asset[]>([]);
  const [holdings, setHoldings] = useState<
    { ticker: string; weight: number }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchingSmart, setSearchingSmart] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState<"ticker" | "smart">(
    "ticker",
  );

  async function searchTickers(query: string) {
  const response = await apiClient.get<Asset[]>(
    `/assets/ticker-search?q=${query}`,
  );
  return response.data;
}

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 1) {
      const results = await searchTickers(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  async function smartSearch(prompt: string, limit: number = 10) {
  const response = await apiClient.post("/llm/smart-search", {
    prompt,
    limit,
  });
  return response.data;
}

  const handleSmartSearch = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && smartQuery.length >= 3) {
      e.preventDefault();
      setSearchingSmart(true);
      try {
        const results = await smartSearch(smartQuery);
        setSmartSearchResults(results);
      } catch (err) {
        console.error("Smart search failed", err);
      } finally {
        setSearchingSmart(false);
      }
    } else if (smartQuery.length === 0) {
      setSmartSearchResults([]);
    }
  };

  const addAsset = (asset: Asset) => {
    const token = localStorage.getItem("token");

    if (!asset.is_base_asset && !token) {
      alert(
        "This asset is restricted to logged-in users. Please log in or register to include it in your simulation.",
      );
      return;
    }

    if (!holdings.find((h) => h.ticker === asset.ticker)) {
      const newWeight = holdings.length === 0 ? 1 : 0;
      setHoldings([...holdings, { ticker: asset.ticker, weight: newWeight }]);
    }
    setQuery("");
    setSearchResults([]);
    setSmartQuery("");
    setSmartSearchResults([]);
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post("/portfolios/simulate", {
        name: "Draft Portfolio",
        holdings: holdings,
      });
      onSimulationComplete(response.data);
    } catch (err) {
      alert("Simulation failed. Ensure weights sum to 100%.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full overflow-hidden transition-colors duration-200">
      <SearchBar
        activeSearchTab={activeSearchTab}
        setActiveSearchTab={setActiveSearchTab}
        query={query}
        handleSearch={handleSearch}
        searchResults={searchResults}
        addAsset={addAsset}
        smartQuery={smartQuery}
        setSmartQuery={setSmartQuery}
        smartSearchResults={smartSearchResults}
        searchingSmart={searchingSmart}
        handleSmartSearch={handleSmartSearch}
      />
      <SelectedAssets
        holdings={holdings}
        setHoldings={setHoldings}
        loading={loading}
        runSimulation={runSimulation}
      />
    </div>
  );
};

export default PortfolioBuilder;
