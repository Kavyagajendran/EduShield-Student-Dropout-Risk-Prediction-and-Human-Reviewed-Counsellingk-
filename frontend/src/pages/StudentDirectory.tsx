import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { Student } from "../types";
import { RiskBadge } from "../components/common/RiskBadge";
import {
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  GraduationCap
} from "lucide-react";

export const StudentDirectory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter states from query params
  const search = searchParams.get("search") || "";
  const department = searchParams.get("department") || "";
  const riskCategory = searchParams.get("riskCategory") || "";
  const requiresReview = searchParams.get("requiresReview") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const res = await api.getStudents({
          page,
          limit: 15,
          search,
          department,
          riskCategory,
          requiresReview
        });
        setStudents(res.students);
        setPagination(res.pagination);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [search, department, riskCategory, requiresReview, page]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set("page", "1");
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", searchInput);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Student Academic Directory</span>
            <span className="text-xs font-mono font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {pagination.total} Records
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse enrolled cohorts, inspect risk scores, and conduct explainable AI evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/import"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Import CSV</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50"
            />
          </form>

          {/* Department Filter */}
          <div>
            <select
              value={department}
              onChange={(e) => updateParam("department", e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700"
            >
              <option value="">All Academic Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={riskCategory}
              onChange={(e) => updateParam("riskCategory", e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700"
            >
              <option value="">All Risk Tiers</option>
              <option value="High">Critical / High Risk</option>
              <option value="Moderate">Moderate Risk</option>
              <option value="Low">Low Risk / Stable</option>
            </select>
          </div>

          {/* Requires Review Filter */}
          <div>
            <select
              value={requiresReview}
              onChange={(e) => updateParam("requiresReview", e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 bg-slate-50/50 text-slate-700"
            >
              <option value="">All Review Statuses</option>
              <option value="true">Flagged for Human Review</option>
              <option value="false">Standard Monitoring</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading student roster...
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Student Identifier & Name</th>
                  <th className="py-2.5 px-4 font-semibold">Department & Term</th>
                  <th className="py-2.5 px-4 font-semibold text-center">GPA</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Attendance</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Backlogs</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Fee Status</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Dropout Risk</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Safeguard Flag</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Profile & XAI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{s.student_id}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{s.department}</div>
                      <div className="text-[11px] text-slate-400">Semester {s.current_semester}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium">
                      {s.gpa_current.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={s.attendance_rate < 75 ? "text-amber-600 font-bold" : "text-slate-700"}>
                        {s.attendance_rate}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={s.backlog_count > 0 ? "text-red-600 font-bold" : "text-slate-500"}>
                        {s.backlog_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.tuition_fees_up_to_date === 1 ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-medium border border-emerald-200">
                          Current
                        </span>
                      ) : (
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px] font-medium border border-red-200">
                          Arrears
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <RiskBadge category={s.currentRiskCategory} score={Math.round(s.currentRiskProbability * 100)} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.requiresHumanReview ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          <span>Review</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/students/${s.student_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs transition-colors"
                      >
                        <span>Examine</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} students)
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page <= 1}
              onClick={() => updateParam("page", String(pagination.page - 1))}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => updateParam("page", String(pagination.page + 1))}
              className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

