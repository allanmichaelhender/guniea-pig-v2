import { Search, Loader2, Sparkles } from "lucide-react";
import { Asset } from "@/services/assetService";

interface searchBarProps {
  activeSearchTab: "ticker" | "smart";
  setActiveSearchTab: (tab: "ticker" | "smart") => void;
  query: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchResults: Asset[];
  addAsset: (asset: Asset) => void;
  smartQuery: string;
  setSmartQuery: (query: string) => void;
  smartSearchResults: Asset[];
  searchingSmart: boolean;
  handleSmartSearch: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function SearchBar({
  activeSearchTab,
  setActiveSearchTab,
  query,
  handleSearch,
  searchResults,
  addAsset,
  smartQuery,
  setSmartQuery,
  smartSearchResults,
  searchingSmart,
  handleSmartSearch,
}: searchBarProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-none p-6 pb-2 bg-slate-50/50 dark:bg-slate-800/30">
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
                <div className="relative w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
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
                <div className="relative w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
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
      </div>
    </div>
  );
}
