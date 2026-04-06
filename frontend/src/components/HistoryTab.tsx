import { PortfolioResponse } from "@/types/types";
import { History, Loader2, TrendingUp } from "lucide-react";

interface HistoryCardProps {
  loadingHistory: boolean;
  history: PortfolioResponse[];
  formatPct: (val: number) => string;
}

export default function HistoryTab({
  loadingHistory,
  history,
  formatPct,
}: HistoryCardProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
        Saved Portfolios
      </h3>
      {loadingHistory ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : history.length > 0 ? (
        <div className="grid gap-4">
          {history.map((p) => (
            <div
              key={p.id}
              className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center group hover:border-indigo-300 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {p.name}
                </p>
                <p className="text-xs text-slate-500">{p.start_date}</p>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Return</p>
                  <p className="font-semibold text-emerald-600">
                    {formatPct(p.annualized_return || 0)}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 text-slate-400">
          <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
          <p>
            No saved portfolios found. Save your first simulation to see it
            here.
          </p>
          <br />
          <p>You must be logged in to save portfolios.</p>
        </div>
      )}
    </div>
  );
}
