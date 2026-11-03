import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from "recharts";
import { SHAPFeatureContribution } from "../../types";

interface SHAPWaterfallChartProps {
  contributions: SHAPFeatureContribution[];
  baseValue?: number;
  probability?: number;
}

export const SHAPWaterfallChart: React.FC<SHAPWaterfallChartProps> = ({
  contributions,
  baseValue,
  probability
}) => {
  if (!contributions || contributions.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm italic">
        No SHAP attribution values available for this student.
      </div>
    );
  }

  // Format data for chart
  const data = contributions.slice(0, 10).map((c) => ({
    name: c.feature_label,
    shapValue: c.shap_value,
    originalValue: String(c.original_value),
    direction: c.direction,
    magnitude: c.magnitude
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const isPositive = item.shapValue > 0;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg text-xs">
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-500 mt-1">Student Value: <span className="font-mono font-medium text-slate-800">{item.originalValue}</span></div>
          <div className="mt-1 flex items-center gap-1.5 font-mono">
            <span>SHAP Impact:</span>
            <span className={isPositive ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
              {item.shapValue > 0 ? `+${item.shapValue}` : item.shapValue}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {isPositive ? "Elevates predicted dropout probability" : "Protective factor; mitigates dropout probability"}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-red-500 inline-block"></span>
            <span>Increases Dropout Risk (+)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
            <span>Protective / Decreases Risk (-)</span>
          </span>
        </div>
        {baseValue !== undefined && probability !== undefined && (
          <div className="font-mono text-[11px] text-slate-600">
            Base: {baseValue.toFixed(3)} → Final Risk: {(probability * 100).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={["auto", "auto"]}
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#334155" }}
              width={140}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
            <Bar dataKey="shapValue" radius={[3, 3, 3, 3]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.shapValue > 0 ? "#EF4444" : "#10B981"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

