import RiskMap from "@/components/PortfolioAnalyzer/RiskMap";

interface SurgeAnalysisProps {
  riskData: any;
}

export default function SurgeAnalysis({ riskData }: SurgeAnalysisProps) {
  return (
    <div className="space-y-6 p-6 bg-slate-950 text-white min-h-screen">

      {/* Main Charts Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Performance History (60% width on large screens) */}
        <div className="flex-[1.5] bg-slate-900 p-4 rounded-xl border border-slate-800 min-h-[400px]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Portfolio Growth</h3>
            <p className="text-sm text-slate-400">
              Cumulative Wealth Index vs. Baseline
            </p>
          </div>
          {/* Placeholder for existing Performance LineChart */}
          <div className="h-[350px] flex items-center justify-center text-slate-600 italic">
            [Performance Line Chart Component]
          </div>
        </div>

        {/* Right: Risk Map (40% width on large screens) */}
        <div className="flex-1">
          <RiskMap data={riskData?.map_data || []} />
        </div>
      </div>
    </div>
  );
}

