import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 transition-colors duration-200">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Welcome Back
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Sign in to save and compare your portfolio simulations.
        </p>

        <div className="space-y-6">
          <p className="text-center text-slate-400 italic py-10">
            Auth Forms Coming Soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
