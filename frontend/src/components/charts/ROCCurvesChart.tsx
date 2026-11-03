import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ROCCurvesChartProps {
  rocCurves: Record<string, { fpr: number[]; tpr: number[]; auc: number }>;
}

export const ROCCurvesChart: React.FC<ROCCurvesChartProps> = ({ rocCurves }) => {
  if (!rocCurves || Object.keys(rocCurves).length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
        ROC curve data unavailable.
      </div>
    );
  }

  // Model colors
  const modelColors: Record<string, string> = {
    "LightGBM": "#2563EB",
    "XGBoost": "#8B5CF6",
    "Random Forest": "#10B981",
    "Support Vector Machine": "#F59E0B",
    "K-Nearest Neighbors": "#EC4899",
    "Logistic Regression": "#06B6D4",
    "Decision Tree": "#F97316"
  };

  // Harmonize sample points across models
  const sampleSteps = 25;
  const chartData: any[] = [];

  for (let s = 0; s <= sampleSteps; s++) {
    const fprTarget = s / sampleSteps;
    const point: any = {
      fpr: Math.round(fprTarget * 100) / 100,
      baseline: Math.round(fprTarget * 100) / 100
    };

    Object.entries(rocCurves).forEach(([modelName, rData]) => {
      // Find closest TPR for this FPR
      let closestTpr = 0;
      let minDiff = 999;
      for (let i = 0; i < rData.fpr.length; i++) {
        const diff = Math.abs(rData.fpr[i] - fprTarget);
        if (diff < minDiff) {
          minDiff = diff;
          closestTpr = rData.tpr[i];
        }
      }
      point[modelName] = Math.round(closestTpr * 1000) / 1000;
    });

    chartData.push(point);
  }

  return (
    <div className="w-full">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="fpr"
              label={{ value: "False Positive Rate (1 - Specificity)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#64748b" }}
              domain={[0, 1]}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              label={{ value: "True Positive Rate (Sensitivity / Recall)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
              domain={[0, 1.02]}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(value: any, name: string) => [
                value,
                rocCurves[name] ? `${name} (AUC: ${rocCurves[name].auc.toFixed(3)})` : name
              ]}
              labelFormatter={(label) => `FPR: ${label}`}
              contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#cbd5e1" }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
              formatter={(value) => (
                <span className="text-slate-700">
                  {value} {rocCurves[value] ? `(${rocCurves[value].auc.toFixed(3)})` : ""}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#cbd5e1"
              strokeDasharray="4 4"
              dot={false}
              name="Random Guess (0.500)"
            />
            {Object.keys(rocCurves).map((name) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={modelColors[name] || "#64748b"}
                strokeWidth={name === "LightGBM" ? 2.5 : 1.5}
                dot={false}
                name={name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

