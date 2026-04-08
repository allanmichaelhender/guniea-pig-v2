import { PlusCircle, Trash2, Loader2 } from "lucide-react";

interface selectedAssetsProps {
  holdings: { ticker: string; weight: number }[];
  setHoldings: (holdings: { ticker: string; weight: number }[]) => void;
  loading: boolean;
  runSimulation: () => Promise<void>;
}

export default function selectedAssets({
  holdings,
  setHoldings,
  loading,
  runSimulation,
}: selectedAssetsProps) {
  return (
    <div className="flex-1 flex flex-col justify-end p-6 pt-0">
      {holdings.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
          <PlusCircle className="w-10 h-10 mb-2 opacity-20" />
          <p>Search for tickers to start building your simulation</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-fit overflow-y-auto">
          {" "}
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
                    newHoldings[idx].weight = parseFloat(e.target.value) / 100;
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
      <div className="px-0 py-4 flex-none border-none">
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
}
