import { useState, useEffect } from "react";
import { BarChart3, History } from "lucide-react";
import apiClient from "@/services/client";
import HistoryTab from "@/components/PortfolioAnalyzer/HistoryTab";
import LatestTab from "@/components/PortfolioAnalyzer/LatestTab";
import {
  PortfolioAnalyzerProps,
  LLMAnalysisResponse,
  PortfolioResponse,
} from "@/types/types";

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
      const response = await apiClient.post<LLMAnalysisResponse>(
        "/llm/analyze",
        {
          name: "Draft Portfolio",
          holdings: result.simulation_metadata.holdings,
        },
      );
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

  const formatPct = (val: number) => (val * 100).toFixed(2) + "%";

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
          <LatestTab
            loadingNarrative={loadingNarrative}
            narrative={narrative}
            formatPct={formatPct}
            result={result}
          />
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

export default PortfolioAnalyzer;
