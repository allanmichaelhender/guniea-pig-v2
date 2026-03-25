import React from "react";
import { PlusCircle, Search } from "lucide-react";

const PortfolioBuilder = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-800">
          Construct Portfolio
        </h2>
        <p className="text-sm text-slate-500">
          Select assets and define your allocations.
        </p>
      </div>
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        {/* Placeholder for the construction logic */}
        <div className="border-2 border-dashed border-slate-200 rounded-xl flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
          <PlusCircle className="w-10 h-10 mb-2 opacity-20" />
          <p>Search for tickers to start building your simulation</p>
        </div>
      </div>
      <div className="p-4 border-t border-slate-100">
        <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-100">
          Run Simulation
        </button>
      </div>
    </div>
  );
};

export default PortfolioBuilder;
