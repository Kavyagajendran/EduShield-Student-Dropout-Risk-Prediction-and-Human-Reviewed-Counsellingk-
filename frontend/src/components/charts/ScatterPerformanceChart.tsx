import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface ScatterPoint {
  student_id: string;
  name: string;
  gpa: number;
  attendance: number;
  backlogs: number;
  riskProbability: number;
  riskCategory: string;
}

interface ScatterPerformanceChartProps {
  data: ScatterPoint[];
}

export const ScatterPerformanceChart: React.FC<ScatterPerformanceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No data</div>;
  }

  const getColor = (category: string) => {
    switch (category) {
      case "High":
        return "#EF4444";
      case "Moderate":
        return "#F59E0B";
      default:
        return "#10B981";
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload as ScatterPoint;
      return (
        <div className="bg-white p-2.5 border border-slate-200 rounded-lg shadow-lg text-xs">
          <div className="font-semibold text-slate-900">{p.name} ({p.student_id})</div>
          <div className="text-slate-500 mt-1">GPA: <span className="font-mono text-slate-800">{p.gpa.toFixed(2)}</span></div>
          <div className="text-slate-500">Attendance: <span className="font-mono text-slate-800">{p.attendance}%</span></div>
          <div className="text-slate-500">Backlogs: <span className="font-mono text-slate-800">{p.backlogs}</span></div>
          <div className="mt-1 font-semibold" style={{ color: getColor(p.riskCategory) }}>
            {p.riskCategory} Risk ({p.riskProbability}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            type="number"
            dataKey="attendance"
            name="Attendance"
            unit="%"
            domain={[30, 100]}
            label={{ value: "Attendance Rate (%)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#64748b" }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="gpa"
            name="GPA"
            domain={[1.0, 4.0]}
            label={{ value: "Current GPA", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
            tick={{ fontSize: 10 }}
          />
          <ZAxis range={[30, 80]} />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.riskCategory)} fillOpacity={0.75} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

