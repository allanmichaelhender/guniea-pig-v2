import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";
import { RiskMapProps } from "@/types/types";





const CLUSTER_COLORS = [
  "#6366f1",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-2 rounded shadow-xl text-xs">
        <p className="font-bold text-white">{data.ticker}</p>
        <p className="text-slate-400">Cluster: {data.cluster_id}</p>
        {data.is_volatility_surge && (
          <p className="text-red-400 font-semibold mt-1">⚠️ Volatility Surge</p>
        )}
      </div>
    );
  }
  return null;
};

export default function RiskMap({ data }: RiskMapProps) {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Hidden Risk Map</h3>
        <p className="text-sm text-slate-400">
          KMeans Clustering of 3yr relative returns
        </p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            type="number"
            dataKey="cluster_x"
            tick={{ fontSize: 9, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            label={{
              value: "X",
              position: "insideBottomRight",
              offset: -10,
              style: { fontSize: "10px", fontWeight: 700, fill: "#94a3b8" },
            }}
          />
          <YAxis
            type="number"
            dataKey="cluster_y"
            tick={{ fontSize: 9, fill: "#94a3b8" }}
            axisLine={{ stroke: "#e2e8f0" }}
            label={{
              value: "Y",
              angle: -90,
              position: "insideTopLeft",
              offset: 10,
              style: { fontSize: "10px", fontWeight: 700, fill: "#94a3b8" },
            }}
          />
          <ZAxis type="number" range={[60, 400]} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Scatter name="Assets" data={data}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CLUSTER_COLORS[entry.cluster_id % CLUSTER_COLORS.length]}
                stroke={entry.is_volatility_surge ? "#ffffff" : "none"}
                strokeWidth={entry.is_volatility_surge ? 2 : 0}
                className={entry.is_volatility_surge ? "animate-pulse" : ""}
              />
            ))}
            <LabelList
              dataKey="ticker"
              position="top"
              style={{
                fontSize: "10px",
                fill: "#94a3b8",
                pointerEvents: "none",
              }}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="mt-2 flex flex-wrap gap-2">
        {Array.from(new Set(data.map((d) => d.cluster_id)))
          .sort()
          .map((id) => (
            <div
              key={id}
              className="flex items-center gap-1 text-[10px] text-slate-400"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: CLUSTER_COLORS[id % CLUSTER_COLORS.length],
                }}
              />
              Group {id}
            </div>
          ))}
      </div>
    </div>
  );
}
