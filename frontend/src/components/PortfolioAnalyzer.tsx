import React, { useState } from "react";
import { BarChart3, History, GitCompare, BrainCircuit } from "lucide-react";

interface PortfolioAnalyzerProps {
  result: any;
}

const PortfolioAnalyzer = ({ result }: PortfolioAnalyzerProps) => {
  const [activeTab, setActiveTab] = useState<"latest" | "past" | "compare">(
    "latest",
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
        <button
          onClick={() => setActiveTab("compare")}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${activeTab === "compare" ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
        >
          <GitCompare className="w-4 h-4" /> Compare
        </button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/20 dark:bg-slate-900/20">
        {/* Content changes based on tab */}
        {result ? (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl flex items-center gap-3">
              <BrainCircuit className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                Simulation Complete. Ready for Grok Analysis.
              </p>
            </div>
            {/* Performance metrics and chart will go here next */}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <BarChart3 className="w-12 h-12 mb-4 opacity-10" />
            <p className="text-sm">
              Run a simulation to see the Grok analysis here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioAnalyzer;
