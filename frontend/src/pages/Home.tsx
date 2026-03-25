import React from "react";
import PortfolioBuilder from "../components/PortfolioBuilder";
import PortfolioAnalyzer from "../components/PortfolioAnalyzer";
import { LineChart, LayoutDashboard, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <LineChart className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Guniea Pig <span className="text-indigo-600">Portfolio</span>
          </h1>
        </div>
        <Link
          to="/auth"
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Login / Register
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden">
          {/* Left Side: Construction (Desktop 5/12) */}
          <div className="lg:col-span-5 flex flex-col min-h-[500px] lg:h-full">
            <PortfolioBuilder />
          </div>

          {/* Right Side: Analysis (Desktop 7/12) */}
          <div className="lg:col-span-7 flex flex-col min-h-[600px] lg:h-full">
            <PortfolioAnalyzer />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
