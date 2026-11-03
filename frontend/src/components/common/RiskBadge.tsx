import React from "react";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

interface RiskBadgeProps {
  category: "Low" | "Moderate" | "High";
  score?: number;
  size?: "sm" | "md" | "lg";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ category, score, size = "md" }) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2"
  };

  const config = {
    High: {
      bg: "bg-red-50 text-red-700 border-red-200 ring-red-500/10",
      icon: <AlertTriangle className={size === "lg" ? "w-4 h-4 text-red-600" : "w-3.5 h-3.5 text-red-600"} />,
      label: "High Risk"
    },
    Moderate: {
      bg: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
      icon: <AlertCircle className={size === "lg" ? "w-4 h-4 text-amber-600" : "w-3.5 h-3.5 text-amber-600"} />,
      label: "Moderate Risk"
    },
    Low: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
      icon: <CheckCircle2 className={size === "lg" ? "w-4 h-4 text-emerald-600" : "w-3.5 h-3.5 text-emerald-600"} />,
      label: "Low Risk"
    }
  };

  const item = config[category] || config.Low;

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs ring-1 ring-inset ${item.bg} ${sizeClasses[size]}`}
    >
      {item.icon}
      <span>{item.label}</span>
      {score !== undefined && (
        <span className="opacity-75 font-mono">({score}%)</span>
      )}
    </span>
  );
};

