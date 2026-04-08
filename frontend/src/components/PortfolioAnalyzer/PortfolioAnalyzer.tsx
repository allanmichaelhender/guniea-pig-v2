import { useState, useEffect, useCallback } from "react";
import { BarChart3, History } from "lucide-react";
import apiClient from "@/services/client";
import HistoryTab from "@/components/PortfolioAnalyzer/HistoryTab";
import LatestTab from "@/components/PortfolioAnalyzer/LatestTab";
import {
  PortfolioAnalyzerProps,
  LLMAnalysisResponse,
  PortfolioResponse,
  RiskSummary
} from "@/types/types";

export default function PortfolioAnalyzer({ result }: PortfolioAnalyzerProps) {
  const [activeTab, setActiveTab] = useState<"latest" | "past">("latest");
  const [history, setHistory] = useState<PortfolioResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loadingNarrative, setLoadingNarrative] = useState(false);
  const [riskData, setRiskData] = useState<RiskSummary | null >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [portfolioName, setPortfolioName] = useState("");
  const [portfolioDescription, setPortfolioDescription] = useState("");

  const fetchRiskSummary = useCallback(async (tickers: string[] = []) => {
    try {
      const response = await apiClient.post("/assets/risk-summary", {
        tickers,
      });
      setRiskData(response.data);
    } catch (err) {
      console.error("Failed to fetch risk summary", err);
    }
  }, []);

  useEffect(() => {
    const tickers =
      result?.simulation_metadata?.holdings?.map((h: any) => h.ticker) || [];
    fetchRiskSummary(tickers);
  }, [result, fetchRiskSummary]);

  const handleSavePortfolio = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      await apiClient.post("/portfolios/", {
        name:
          portfolioName ||
          `Portfolio ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        description: portfolioDescription,
        holdings: result.simulation_metadata.holdings,
        start_date: result.simulation_metadata.requested_start_date,
      });
      // Refresh history so it's ready if they switch tabs
      fetchHistory();
      alert("Portfolio saved successfully!");
      setPortfolioName("");
      setPortfolioDescription("");
    } catch (err) {
      console.error("Failed to save portfolio", err);
      alert("Error saving portfolio. Please make sure you are logged in.");
    } finally {
      setIsSaving(false);
    }
  };


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

    useEffect(() => {
    if (result && !result.narrative) {
      fetchNarrative();
    } else if (result?.narrative) {
      setNarrative(result.narrative);
    }
  }, [result]);

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

    useEffect(() => {
    if (activeTab === "past") {
      fetchHistory();
    }
  }, [activeTab]);

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
            riskData={riskData}
            onSave={handleSavePortfolio}
            isSaving={isSaving}
            portfolioName={portfolioName}
            setPortfolioName={setPortfolioName}
            portfolioDescription={portfolioDescription}
            setPortfolioDescription={setPortfolioDescription}
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
}
