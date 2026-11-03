import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { DashboardAnalytics, Student } from "../types";
import { RiskBadge } from "../components/common/RiskBadge";
import { RiskDistributionChart } from "../components/charts/RiskDistributionChart";
import { ScatterPerformanceChart } from "../components/charts/ScatterPerformanceChart";
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  HeartHandshake,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  Sparkles,
  BarChart3
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [highRiskStudents, setHighRiskStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [analyticsRes, studentsRes] = await Promise.all([
          api.getDashboardAnalytics(),
          api.getStudents({ limit: 6, riskCategory: "High", requiresReview: "true" })
        ]);
        setAnalytics(analyticsRes);
        setHighRiskStudents(studentsRes.students);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500">Loading EduShield analytics & student risk models...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <h3 className="font-semibold text-sm">Failed to load dashboard</h3>
        <p className="text-xs mt-1">{error || "Analytics service unreachable"}</p>
      </div>
    );
  }

  const { summary, departmentDistribution, riskDistribution, scatterData } = analytics;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {user?.role === "admin" && "Institutional Retention & Attrition Cockpit"}
              {user?.role === "faculty" && `Departmental Advising Roster — ${user.department || "General"}`}
              {user?.role === "student" && `Welcome, ${user.name}`}
            </h1>
            <span className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-full font-medium">
              Live Evaluation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time dropout risk predictions powered by LightGBM and explainable TreeSHAP attributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/explainability"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>SHAP Simulator</span>
          </Link>
          <Link
            to="/models"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-2xs"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>7-Model Benchmark</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cohort Evaluated</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{summary.totalStudents}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
              <span>Full active enrollment</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* High Risk Count & % */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Dropout Risk</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {summary.highRiskCount}{" "}
              <span className="text-xs font-medium text-slate-500">({summary.highRiskPercentage}%)</span>
            </div>
            <div className="text-[11px] text-red-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Critical attrition threshold</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Pending Human Reviews */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Human Reviews Required</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{summary.requiresReviewCount}</div>
            <div className="text-[11px] text-amber-700 font-medium mt-0.5 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Faculty triage queue</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Active Counselling Cases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Counselling Interventions</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{summary.activeReferralsCount}</div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Active support plans</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Probability Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Dropout Risk Probability Distribution</h3>
              <p className="text-xs text-slate-500">Cohort frequency across risk probability intervals</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">N={summary.totalStudents}</span>
          </div>
          <RiskDistributionChart distribution={riskDistribution} />
        </div>

        {/* Attendance vs GPA Scatter Plot */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance vs GPA vs Dropout Risk</h3>
              <p className="text-xs text-slate-500">Hover individual student data points for metrics</p>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Low</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>High</span>
            </div>
          </div>
          <ScatterPerformanceChart data={scatterData} />
        </div>
      </div>

      {/* Department Breakdown Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Academic Department Risk Overview</h3>
            <p className="text-xs text-slate-500">Cross-departmental retention indicators and average performance</p>
          </div>
          <Link to="/reports" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>View Full Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Department</th>
                <th className="py-2.5 px-4 font-semibold text-center">Enrolled</th>
                <th className="py-2.5 px-4 font-semibold text-center">Avg GPA</th>
                <th className="py-2.5 px-4 font-semibold text-center">Avg Attendance</th>
                <th className="py-2.5 px-4 font-semibold text-center">High Risk</th>
                <th className="py-2.5 px-4 font-semibold text-center">Moderate</th>
                <th className="py-2.5 px-4 font-semibold text-center">Low Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentDistribution.map((d) => (
                <tr key={d.department} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">{d.department}</td>
                  <td className="py-3 px-4 text-center font-mono">{d.total}</td>
                  <td className="py-3 px-4 text-center font-mono font-medium">{d.avgGpa.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center font-mono">{d.avgAttendance}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-mono font-bold">
                      {d.highRisk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-mono">
                      {d.moderateRisk}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono">
                      {d.lowRisk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Priority Human-in-the-Loop Review Roster */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Priority Human Review Triage</h3>
              <p className="text-xs text-slate-500">
                Students flagged by LightGBM model requiring faculty evidence evaluation & counselling referral
              </p>
            </div>
          </div>
          <Link to="/students?requiresReview=true" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            <span>Explore All Flagged ({summary.requiresReviewCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Student ID & Name</th>
                <th className="py-2.5 px-4 font-semibold">Department</th>
                <th className="py-2.5 px-4 font-semibold text-center">Current GPA</th>
                <th className="py-2.5 px-4 font-semibold text-center">Attendance</th>
                <th className="py-2.5 px-4 font-semibold text-center">Backlogs</th>
                <th className="py-2.5 px-4 font-semibold text-center">Dropout Risk Score</th>
                <th className="py-2.5 px-4 font-semibold text-center">Counselling Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highRiskStudents.map((s) => (
                <tr key={s.student_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{s.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{s.student_id}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{s.department} (Sem {s.current_semester})</td>
                  <td className="py-3 px-4 text-center font-mono font-medium">{s.gpa_current.toFixed(2)}</td>
                  <td className="py-3 px-4 text-center font-mono">{s.attendance_rate}%</td>
                  <td className="py-3 px-4 text-center font-mono">
                    <span className={s.backlog_count > 0 ? "text-red-600 font-bold" : "text-slate-600"}>
                      {s.backlog_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <RiskBadge category={s.currentRiskCategory} score={Math.round(s.currentRiskProbability * 100)} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium border border-slate-200">
                      {s.counsellingStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/students/${s.student_id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs transition-colors"
                    >
                      <span>Explain & Review</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

