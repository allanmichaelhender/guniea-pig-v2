import { LatestTabProps, MetricCardProps } from "@/types/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  BrainCircuit,
  Loader2,
  AlertTriangle,
  LayoutGrid,
  Save,
} from "lucide-react";
import RiskMap from "@/components/PortfolioAnalyzer/RiskMap";

export default function LatestTab({
  loadingNarrative,
  narrative,
  formatPct,
  result,
  riskData,
  onSave,
  isSaving,
  portfolioName,
  setPortfolioName,
  portfolioDescription,
  setPortfolioDescription,
}: LatestTabProps) {
  const MetricCard = ({
    label,
    value,
    color = "text-slate-900",
  }: MetricCardProps) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-xl font-bold ${color} dark:text-slate-100`}>
        {value}
      </p>
    </div>
  );

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

  return result ? (
    <div className="space-y-6">
      {/* Save Action (Logged in only) */}
      {localStorage.getItem("token") && (
        <div className="flex flex-col md:flex-row items-end justify-start gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="w-full md:w-48">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">
              Portfolio Name
            </label>
            <input
              type="text"
              placeholder="My Genius Porfolio 1.0"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-100"
            />
          </div>
          <div className="w-full md:flex-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Optional notes"
              value={portfolioDescription}
              onChange={(e) => setPortfolioDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-slate-100"
            />
          </div>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Portfolio
          </button>
        </div>
      )}

      {/* Portfolio Risk Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-rose-50/30 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Portfolio Surges
            </p>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {riskData?.portfolio_surge_count || 0}
            <span className="text-xs font-bold text-slate-400 uppercase">
              {" "}
              Active Alerts
            </span>
          </p>
        </div>
        <div className="bg-emerald-50/30 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-500" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Risk Clusters
            </p>
          </div>
          <p className="text-2xl font-black text-slate-800 dark:text-slate-200">
            {riskData?.portfolio_clusters_count || 0}
            <span className="text-xs font-bold text-slate-400 uppercase">
              {" "}
              Groups
            </span>
          </p>
        </div>
      </div>

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

      {/* Analysis Row: Performance + Risk Map */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-[1.5] bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 min-h-[420px] flex flex-col">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
              Portfolio Growth
            </h3>
            <p className="text-[10px] text-slate-400 uppercase font-medium tracking-wide">
              Cumulative Wealth Index
            </p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart
                data={result.performance_chart}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  hide={false}
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  minTickGap={40}
                  axisLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  label={{
                    value: "TIMELINE",
                    position: "insideBottom",
                    offset: -12,
                    style: {
                      fontSize: "9px",
                      fontWeight: 700,
                      fill: "#94a3b8",
                      letterSpacing: "0.05em",
                    },
                  }}
                />
                <YAxis
                  hide={false}
                  domain={["auto", "auto"]}
                  tickCount={6}
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  axisLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
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
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:flex-1">
          <RiskMap data={riskData?.map_data || []} />
        </div>
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
              <Loader2 className="w-3 h-3 animate-spin" /> Analyzing portfolio
              dynamics...
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
      <p className="text-sm">Run a simulation to see the analysis here.</p>
    </div>
  );
}
