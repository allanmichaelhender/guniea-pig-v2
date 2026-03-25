import React, { useState } from "react";
import { PlusCircle, Search, Trash2, Loader2 } from "lucide-react";
import { assetService, Asset } from "@/services/assetService";
import apiClient from "@/services/client";

interface PortfolioBuilderProps {
  onSimulationComplete: (result: any) => void;
}

const PortfolioBuilder = ({ onSimulationComplete }: PortfolioBuilderProps) => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [holdings, setHoldings] = useState<
    { ticker: string; weight: number }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 1) {
      const results = await assetService.searchTickers(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const addAsset = (asset: Asset) => {
    if (!holdings.find((h) => h.ticker === asset.ticker)) {
      const newWeight = holdings.length === 0 ? 1 : 0;
      setHoldings([...holdings, { ticker: asset.ticker, weight: newWeight }]);
    }
    setQuery("");
    setSearchResults([]);
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
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Construct Portfolio
        </h2>
        <p className="text-sm text-slate-500">
          Select assets and define your allocations.
        </p>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-transparent outline-none transition-colors"
            placeholder="Search tickers (e.g. AAPL, SPY)..."
            value={query}
            onChange={handleSearch}
          />
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
              {searchResults.map((asset) => (
                <button
                  key={asset.ticker}
                  onClick={() => addAsset(asset)}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 flex justify-between transition-colors"
                >
                  <span className="font-bold">{asset.ticker}</span>
                  <span className="text-slate-500 text-sm">{asset.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {holdings.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <PlusCircle className="w-10 h-10 mb-2 opacity-20" />
            <p>Search for tickers to start building your simulation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((h, idx) => (
              <div
                key={h.ticker}
                className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <span className="font-bold w-16 text-slate-800 dark:text-slate-200">
                  {h.ticker}
                </span>
                <input
                  type="number"
                  className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500"
                  value={h.weight * 100}
                  onChange={(e) => {
                    const newHoldings = [...holdings];
                    newHoldings[idx].weight = parseFloat(e.target.value) / 100;
                    setHoldings(newHoldings);
                  }}
                />
                <span className="text-slate-400 text-sm">%</span>
                <button
                  onClick={() =>
                    setHoldings(holdings.filter((_, i) => i !== idx))
                  }
                >
                  <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button
          disabled={holdings.length === 0 || loading}
          onClick={runSimulation}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Run Simulation"
          )}
        </button>
      </div>
    </div>
  );
};

export default PortfolioBuilder;
