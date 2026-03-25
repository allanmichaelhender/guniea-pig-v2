import React, { useState } from "react";
import { BarChart3, History, GitCompare } from "lucide-react";

const PortfolioAnalyzer = () => {
  const [activeTab, setActiveTab] = useState<"latest" | "past" | "compare">(
    "latest",
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="flex border-b border-slate-100 shrink-0">
        <button
          onClick={() => setActiveTab("latest")}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "latest" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-500 hover:text-slate-700"}`}
        >
          <BarChart3 className="w-4 h-4" /> Latest Analysis
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "past" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-500 hover:text-slate-700"}`}
        >
          <History className="w-4 h-4" /> History
        </button>
        <button
          onClick={() => setActiveTab("compare")}
          className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === "compare" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-500 hover:text-slate-700"}`}
        >
          <GitCompare className="w-4 h-4" /> Compare
        </button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50/20">
        {/* Content changes based on tab */}
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <BarChart3 className="w-12 h-12 mb-4 opacity-10" />
          <p className="text-sm">
            Run a simulation to see the Grok analysis here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalyzer;
