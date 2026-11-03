import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface RiskDistributionChartProps {
  distribution: Array<{ bin: string; count: number; label: string }>;
}

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ distribution }) => {
  if (!distribution || distribution.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No data</div>;
  }

  const colors = ["#10B981", "#34D399", "#FBBF24", "#F97316", "#EF4444"];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="bin" tick={{ fontSize: 11, fill: "#64748b" }} />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
          <Tooltip
            formatter={(value: any, _name, item: any) => [
              `${value} students (${item.payload.label})`,
              "Cohort Size"
            ]}
            contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#cbd5e1" }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {distribution.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

