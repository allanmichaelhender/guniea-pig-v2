import { useState, useEffect } from "react";
import {
  BarChart3,
  History,
  BrainCircuit,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import apiClient from "@/services/client";
import HistoryTab from "@/components/HistoryTab";
import { PortfolioAnalyzerProps, LLMAnalysisResponse, PortfolioResponse, MetricCardProps } from "@/types/types";

const PortfolioAnalyzer = ({ result }: PortfolioAnalyzerProps) => {
  const [activeTab, setActiveTab] = useState<"latest" | "past">("latest");
  const [history, setHistory] = useState<PortfolioResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  useEffect(() => {
    if (activeTab === "past") {
      fetchHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    if (result && !result.narrative) {
      fetchNarrative();
    } else if (result?.narrative) {
      setNarrative(result.narrative);
    }
  }, [result]);

  const fetchNarrative = async () => {
    setNarrative(null);
    setLoadingNarrative(true);
    try {
      const response = await apiClient.post<LLMAnalysisResponse>("/llm/analyze", {
        name: "Draft Portfolio",
        holdings: result.simulation_metadata.holdings,
      });
      setNarrative(response.data.analysis);
    } catch (err) {
      setNarrative("Failed to generate analysis.");
    } finally {
      setLoadingNarrative(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await apiClient.get<PortfolioResponse[]>("/portfolios/");
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper function to format our LLM returned narritive text
  const formatNarrative = (text: string) => {
    if (!text) return null;

    return text.split("\n").map((line, i) => {
      const trimmedLine = line.trim();

      // Render Headers (###)
      if (trimmedLine.startsWith("###")) {
        return (
          <h4
            key={i}
            className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mt-5 mb-2 first:mt-0 uppercase tracking-tight"
          >
            {trimmedLine.replace(/^###\s*/, "")}
          </h4>
        );
      }

      // Render Bullets (*)
      if (trimmedLine.startsWith("*") || trimmedLine.startsWith("-")) {
        return (
          <div key={i} className="flex gap-3 ml-1 mb-2">
            <span className="text-indigo-500 font-bold">•</span>
            <span className="text-slate-700 dark:text-slate-300">
              {trimmedLine.replace(/^[*|-]\s*/, "")}
            </span>
          </div>
        );
      }

      // Render Disclaimer
      if (trimmedLine.toLowerCase().startsWith("disclaimer:")) {
        return (
          <p
            key={i}
            className="mt-4 pt-4 border-t border-indigo-100 dark:border-indigo-900/50 text-[11px] italic text-slate-500 dark:text-slate-400 leading-tight"
          >
            {trimmedLine}
          </p>
        );
      }

      return trimmedLine ? (
        <p key={i} className="mb-2 text-slate-700 dark:text-slate-300">
          {trimmedLine}
        </p>
      ) : (
        <div key={i} className="h-1" />
      );
    });
  };

  const formatPct = (val: number) => (val * 100).toFixed(2) + "%";

  const MetricCard = ({ label, value, color = "text-slate-900" }: MetricCardProps) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-xl font-bold ${color} dark:text-slate-100`}>
        {value}
      </p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full overflow-hidden transition-colors duration-200">
      <div className="flex border-b border-slate-100 dark:border-slate-800 shrink-0">
        <button
          onClick={() => setActiveTab("latest")}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${activeTab === "latest" ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
        >
          <BarChart3 className="w-4 h-4" /> Latest Analysis
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${activeTab === "past" ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
        >
          <History className="w-4 h-4" /> History
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/20 dark:bg-slate-900/20">
        {activeTab === "latest" ? (
          result ? (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                  label="Ann. Return"
                  value={formatPct(result.metrics.annualized_return)}
                  color="text-emerald-600"
                />
                <MetricCard
                  label="Volatility"
                  value={formatPct(result.metrics.volatility)}
                />
                <MetricCard
                  label="Sharpe"
                  value={result.metrics.sharpe_ratio.toFixed(2)}
                />
                <MetricCard
                  label="Max DD"
                  value={formatPct(result.metrics.max_drawdown)}
                  color="text-rose-600"
                />
              </div>

              {/* Chart */}
              <div className="h-64 w-full bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={result.performance_chart}
                    margin={{ top: 10, right: 10, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={true}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      hide={false}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      minTickGap={40}
                      axisLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                      label={{
                        value: "TIMELINE",
                        position: "insideBottom",
                        offset: -12,
                        style: {
                          fontSize: "10px",
                          fontWeight: 700,
                          fill: "#94a3b8",
                          letterSpacing: "0.05em",
                        },
                      }}
                    />
                    <YAxis
                      hide={false}
                      domain={["auto", "auto"]}
                      tickCount={8}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                      label={{
                        value: "GROWTH INDEX",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        style: {
                          fontSize: "10px",
                          fontWeight: 700,
                          fill: "#94a3b8",
                          letterSpacing: "0.05em",
                        },
                      }}
                    />
                    <Tooltip
                      labelFormatter={(label) => `Date: ${label}`}
                      formatter={(value: any) => [
                        typeof value === "number" ? value.toFixed(4) : value,
                        "Growth Index",
                      ]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                      }}
                      itemStyle={{
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#4f46e5",
                      }}
                      labelStyle={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#64748b",
                        marginBottom: "4px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* AI Narrative */}
              <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <BrainCircuit className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                  <h3 className="font-semibold text-indigo-900 dark:text-indigo-100">
                    Key Insights - Powered By Llama 3.3
                  </h3>
                </div>
                <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {loadingNarrative ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Analyzing
                      portfolio dynamics...
                    </span>
                  ) : (
                    formatNarrative(narrative || "") || "No analysis available."
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <BarChart3 className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm">
                Run a simulation to see the analysis here.
              </p>
            </div>
          )
        ) : (
            <HistoryTab
              loadingHistory={loadingHistory}
              history={history}
              formatPct={formatPct}
            />
            )}
      </div>
    </div>
    );
};
    


          /* History Tab */
    //       <div className="space-y-6">
    //         <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
    //           Saved Portfolios
    //         </h3>
    //         {loadingHistory ? (
    //           <div className="flex justify-center p-12">
    //             <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    //           </div>
    //         ) : history.length > 0 ? (
    //           <div className="grid gap-4">
    //             {history.map((p) => (
    //               <div
    //                 key={p.id}
    //                 className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center group hover:border-indigo-300 transition-colors cursor-pointer"
    //               >
    //                 <div>
    //                   <p className="font-bold text-slate-900 dark:text-slate-100">
    //                     {p.name}
    //                   </p>
    //                   <p className="text-xs text-slate-500">{p.start_date}</p>
    //                 </div>
    //                 <div className="text-right flex items-center gap-4">
    //                   <div>
    //                     <p className="text-xs text-slate-400 uppercase">
    //                       Return
    //                     </p>
    //                     <p className="font-semibold text-emerald-600">
    //                       {formatPct(p.annualized_return || 0)}
    //                     </p>
    //                   </div>
    //                   <div className="opacity-0 group-hover:opacity-100 transition-opacity">
    //                     <TrendingUp className="w-5 h-5 text-indigo-500" />
    //                   </div>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         ) : (
    //           <div className="text-center p-12 text-slate-400">
    //             <History className="w-12 h-12 mx-auto mb-4 opacity-10" />
    //             <p>
    //               No saved portfolios found. Save your first simulation to see
    //               it here.
    //             </p>
    //             <br />
    //             <p>You must be logged in to save portfolios.</p>
    //           </div>
    //         )}
    //       </div>
    //     )}
    //   </div>
    // </div>
//   );
// };

export default PortfolioAnalyzer;
