import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  BarChart3,
  HeartHandshake,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  GraduationCap
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const navItems = [
    {
      to: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ["admin", "faculty", "student"]
    },
    ...(role === "student"
      ? [
          {
            to: "/my-portal",
            label: "My Academic Health",
            icon: <GraduationCap className="w-4 h-4" />,
            roles: ["student"]
          }
        ]
      : [
          {
            to: "/students",
            label: "Student Directory",
            icon: <Users className="w-4 h-4" />,
            roles: ["admin", "faculty"]
          }
        ]),
    {
      to: "/explainability",
      label: "Explainable AI (SHAP)",
      icon: <BrainCircuit className="w-4 h-4" />,
      roles: ["admin", "faculty", "student"]
    },
    {
      to: "/models",
      label: "7-Model Benchmark",
      icon: <BarChart3 className="w-4 h-4" />,
      roles: ["admin", "faculty", "student"]
    },
    {
      to: "/counselling",
      label: "Human Counselling",
      icon: <HeartHandshake className="w-4 h-4" />,
      roles: ["admin", "faculty", "student"]
    },
    {
      to: "/reports",
      label: "Institutional Reports",
      icon: <FileText className="w-4 h-4" />,
      roles: ["admin", "faculty"]
    },
    {
      to: "/import",
      label: "CSV Batch Import",
      icon: <FileSpreadsheet className="w-4 h-4" />,
      roles: ["admin"]
    },
    {
      to: "/audit",
      label: "Security Audit Logs",
      icon: <ShieldCheck className="w-4 h-4" />,
      roles: ["admin"]
    }
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {filteredItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700 font-semibold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Champion Model</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">LightGBM (TreeSHAP)</p>
          <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-100 pt-1.5 flex justify-between">
            <span>Accuracy: 90.0%</span>
            <span>ROC-AUC: 0.979</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

