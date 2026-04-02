import { useState } from "react";
import PortfolioBuilder from "@/components/PortfolioBuilder";
import PortfolioAnalyzer from "@/components/PortfolioAnalyzer";
import { LineChart, LogIn, LogOut, Sun, Moon, User } from "lucide-react";
import { Link } from "react-router-dom";
import { authService } from "@/services/auth";

interface HomeProps {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

const Home = ({ theme, setTheme }: HomeProps) => {
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem("username"),
  );

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const handleLogout = () => {
    authService.logout();
    setUsername(null);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Simple Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center shrink-0 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500 p-1.5 rounded-lg">
            <LineChart className="text-white w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-500 dark:text-slate-300">
            GUINEA PIG <span className="text-indigo-500">PORTFOLIO</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-100 hover:text-indigo-400 dark:hover:text-indigo-600 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          {username ? (
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-sm font-medium text-slate-400">
                <User className="w-4 h-4" /> {username}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-indigo-400 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Login / Register
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto lg:overflow-hidden">
          {/* Left Side: Construction (Desktop 5/12) */}
          <div className="lg:col-span-5 flex flex-col min-h-[500px] lg:h-full">
            <PortfolioBuilder onSimulationComplete={setSimulationResult} />
          </div>

          {/* Right Side: Analysis (Desktop 7/12) */}
          <div className="lg:col-span-7 flex flex-col min-h-[600px] lg:h-full">
            <PortfolioAnalyzer result={simulationResult} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
