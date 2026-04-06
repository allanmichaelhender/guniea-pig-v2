import { useState } from "react";
import { PlusCircle, Search, Trash2, Loader2, Sparkles } from "lucide-react";
import { assetService, Asset } from "@/services/assetService";
import { llmService } from "@/services/llmService";
import apiClient from "@/services/client";
import { PortfolioBuilderProps } from "@/types/types";



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

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 1) {
      const results = await assetService.searchTickers(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSmartSearch = async (e: React.KeyboardEvent<any>) => {
    if (e.key === "Enter" && smartQuery.length >= 3) {
      e.preventDefault();
      setSearchingSmart(true);
      try {
        const results = await llmService.smartSearch(smartQuery);
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
      <div className="p-6 pb-2 bg-slate-50/50 dark:bg-slate-800/30">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          Construct Portfolio
        </h2>
        <div className="flex mt-4 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => setActiveSearchTab("ticker")}
            className={`flex-1 py-2 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all ${
              activeSearchTab === "ticker"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Search className="w-3.5 h-3.5" /> Ticker Search
          </button>
          <button
            onClick={() => setActiveSearchTab("smart")}
            className={`flex-1 py-2 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all ${
              activeSearchTab === "smart"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Smart Search
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 pt-2 flex flex-col gap-4 overflow-y-auto">
        <div className="relative">
          {/* Ticker Search (Legacy) */}
          {activeSearchTab === "ticker" && (
            <div className="relative animate-in fade-in slide-in-from-left-2 duration-200">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-transparent outline-none transition-colors"
                placeholder="Ticker search (e.g. AAPL, SPY) - Log in for access to all assets."
                value={query}
                onChange={handleSearch}
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden border-t-4 border-t-slate-100">
                  {searchResults.map((asset) => {
                    const isRestricted =
                      !asset.is_base_asset && !localStorage.getItem("token");
                    return (
                      <button
                        key={asset.ticker}
                        onClick={() => addAsset(asset)}
                        className={`w-full px-4 py-2 text-left flex justify-between transition-colors border-t border-slate-50 dark:border-slate-700/50 first:border-none
                          ${isRestricted ? "opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/50" : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100"}`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{asset.ticker}</span>
                            {asset.is_base_asset ? (
                              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                Base Asset
                              </span>
                            ) : (
                              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                Logged in only
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[10px] uppercase font-medium truncate max-w-[200px]">
                            {asset.name}
                          </span>
                        </div>
                        <span className="text-slate-500 text-xs self-center">
                          {asset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Smart Search (AI) */}
          {activeSearchTab === "smart" && (
            <div className="relative animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="absolute top-3.5 left-3 flex items-start pointer-events-none">
                {searchingSmart ? (
                  <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                )}
              </div>
              <textarea
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 placeholder-indigo-400 dark:placeholder-indigo-400 focus:border-transparent outline-none transition-colors resize-none"
                placeholder="Describe an asset (e.g. 'Show me high-growth semiconductor stocks based in South East Asia') - Log in for for access for all assets."
                value={smartQuery}
                onChange={(e) => setSmartQuery(e.target.value)}
                onKeyDown={handleSmartSearch}
              />
              {smartSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden border-t-4 border-t-indigo-500">
                  <div className="px-4 py-1.5 bg-indigo-50/50 dark:bg-indigo-900/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                    Top Results
                  </div>
                  {smartSearchResults.map((asset) => {
                    const isRestricted =
                      !asset.is_base_asset && !localStorage.getItem("token");
                    return (
                      <button
                        key={asset.ticker}
                        onClick={() => addAsset(asset)}
                        className={`w-full px-4 py-2 text-left flex justify-between transition-colors border-t border-slate-50 dark:border-slate-700/50 first:border-none
                          ${isRestricted ? "opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/50" : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100"}`}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{asset.ticker}</span>
                            {asset.is_base_asset ? (
                              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                Base Asset
                              </span>
                            ) : (
                              <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                                Logged in only
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[10px] uppercase font-medium">
                            {asset.sector}
                          </span>
                        </div>
                        <span className="text-slate-500 text-xs text-right max-w-[150px] truncate">
                          {asset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {holdings.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <PlusCircle className="w-10 h-10 mb-2 opacity-20" />
            <p>Search for tickers to start building your simulation</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {holdings.map((h, idx) => (
              <div
                key={h.ticker}
                className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800"
              >
                <span className="font-bold w-16 text-slate-800 dark:text-slate-200">
                  {h.ticker}
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    className="w-16 text-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500"
                    value={h.weight * 100}
                    onChange={(e) => {
                      const newHoldings = [...holdings];
                      newHoldings[idx].weight =
                        parseFloat(e.target.value) / 100;
                      setHoldings(newHoldings);
                    }}
                  />
                  <span className="text-slate-400 text-sm font-medium">%</span>
                </div>
                <div className="flex-1" />
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
