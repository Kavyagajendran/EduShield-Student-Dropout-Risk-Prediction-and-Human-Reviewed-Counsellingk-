import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { RiskBadge } from "../components/common/RiskBadge";
import {
  FileText,
  Download,
  Filter,
  Users,
  AlertTriangle,
  HeartHandshake,
  ArrowRight
} from "lucide-react";

export const ReportsPage: React.FC = () => {
  const [department, setDepartment] = useState<string>("");
  const [riskCategory, setRiskCategory] = useState<string>("");
  const [reportData, setReportData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await api.getInstitutionalReport({ department, riskCategory, format: "json" });
      setReportData(data);
    } catch (err) {
      console.error("Failed to generate report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [department, riskCategory]);

  const handleDownloadCSV = () => {
    const query = new URLSearchParams();
    if (department) query.append("department", department);
    if (riskCategory) query.append("riskCategory", riskCategory);
    query.append("format", "csv");
    window.open(`/api/reports/institutional?${query.toString()}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>Institutional Retention & Risk Analytics Report</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive audit reports, cohort attrition breakdowns, and intervention tracking.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-2xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Roster as CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter Scope:</span>
        </div>

        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="p-1.5 border border-slate-300 rounded-lg text-slate-700 bg-slate-50"
        >
          <option value="">All Academic Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Information Technology">Information Technology</option>
          <option value="Electrical Engineering">Electrical Engineering</option>
          <option value="Mechanical Engineering">Mechanical Engineering</option>
          <option value="Civil Engineering">Civil Engineering</option>
          <option value="Data Science">Data Science</option>
        </select>

        <select
          value={riskCategory}
          onChange={(e) => setRiskCategory(e.target.value)}
          className="p-1.5 border border-slate-300 rounded-lg text-slate-700 bg-slate-50"
        >
          <option value="">All Risk Tiers</option>
          <option value="High">High Dropout Risk</option>
          <option value="Moderate">Moderate Risk</option>
          <option value="Low">Low Risk</option>
        </select>
      </div>

      {/* Summary Stats Grid */}
      {reportData && reportData.metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Evaluated Students</div>
            <div className="text-xl font-bold text-slate-900 mt-1">{reportData.metrics.totalEvaluated}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Critical High Risk</div>
            <div className="text-xl font-bold text-red-600 mt-1">{reportData.metrics.highRiskCount}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Human Reviews Required</div>
            <div className="text-xl font-bold text-amber-600 mt-1">{reportData.metrics.flaggedForHumanReview}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Active Counselling Cases</div>
            <div className="text-xl font-bold text-emerald-600 mt-1">{reportData.metrics.totalActiveCounsellingCases}</div>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Student Retention Status Roster</h3>
          <span className="text-xs text-slate-500">
            {reportData?.students?.length || 0} students matching filters
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Generating report...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Student ID</th>
                  <th className="py-2.5 px-4 font-semibold">Name</th>
                  <th className="py-2.5 px-4 font-semibold">Department</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Semester</th>
                  <th className="py-2.5 px-4 font-semibold text-center">GPA</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Attendance</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Backlogs</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Risk Score</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Counselling</th>
                  <th className="py-2.5 px-4 font-semibold text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.students?.map((s: any) => (
                  <tr key={s.student_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-600">{s.student_id}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-4 text-slate-600">{s.department}</td>
                    <td className="py-2.5 px-4 text-center font-mono">{s.semester}</td>
                    <td className="py-2.5 px-4 text-center font-mono">{s.gpa.toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-center font-mono">{s.attendance}%</td>
                    <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-700">{s.backlogs}</td>
                    <td className="py-2.5 px-4 text-center">
                      <RiskBadge category={s.riskCategory} score={s.riskScore} size="sm" />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium">
                        {s.counsellingStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <Link
                        to={`/students/${s.student_id}`}
                        className="text-brand-600 hover:text-brand-700 font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

