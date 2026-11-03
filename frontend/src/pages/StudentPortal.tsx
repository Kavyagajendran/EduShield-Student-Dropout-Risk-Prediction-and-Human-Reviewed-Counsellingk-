import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Student, PredictionResult } from "../types";
import { RiskBadge } from "../components/common/RiskBadge";
import { SHAPWaterfallChart } from "../components/charts/SHAPWaterfallChart";
import {
  GraduationCap,
  Heart,
  BookOpen,
  Calendar,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  Send,
  UserCheck
} from "lucide-react";

export const StudentPortal: React.FC = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Voluntary well-being survey state
  const [stress, setStress] = useState<number>(5);
  const [sleep, setSleep] = useState<number>(7.0);
  const [commute, setCommute] = useState<number>(30);
  const [belonging, setBelonging] = useState<number>(6);
  const [surveySubmitted, setSurveySubmitted] = useState<boolean>(false);
  const [isUpdatingSurvey, setIsUpdatingSurvey] = useState<boolean>(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      const studentId = user?.studentRefId || "STU-2026-1000";
      setIsLoading(true);
      try {
        const res = await api.getStudentById(studentId);
        setStudent(res.student);
        setStress(res.student.stress_level_score || 5);
        setSleep(res.student.sleep_hours_per_day || 7.0);
        setCommute(res.student.commute_time_minutes || 30);
        setBelonging(res.student.social_belonging_score || 6);

        // Fetch prediction
        try {
          const predRes = await api.getLatestPrediction(studentId);
          setPrediction(predRes.prediction);
        } catch {
          // If no prediction yet, run one
          const pred = await api.predictStudentRisk(studentId);
          setPrediction(pred.prediction);
        }
      } catch (err) {
        console.error("Failed to load student data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setIsUpdatingSurvey(true);
    try {
      await api.updateStudent(student.student_id, {
        stress_level_score: stress,
        sleep_hours_per_day: sleep,
        commute_time_minutes: commute,
        social_belonging_score: belonging
      });
      setSurveySubmitted(true);
      setTimeout(() => setSurveySubmitted(false), 4000);
    } catch (err) {
      console.error("Failed to update survey:", err);
    } finally {
      setIsUpdatingSurvey(false);
    }
  };

  if (isLoading || !student) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500">Loading your academic health portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-brand-500/20">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{student.name}</h1>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {student.student_id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {student.department} • Semester {student.current_semester} • Advisor: {student.assignedFacultyEmail || "Advisory Office"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Academic Status</div>
              <RiskBadge
                category={student.currentRiskCategory}
                score={Math.round(student.currentRiskProbability * 100)}
                size="md"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Cumulative GPA</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{student.gpa_current.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Scale: 4.00</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Attendance Rate</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${student.attendance_rate < 75 ? "text-amber-600" : "text-slate-900"}`}>
            {student.attendance_rate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Target: &gt; 75%</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Active Backlogs</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${student.backlog_count > 0 ? "text-red-600" : "text-emerald-600"}`}>
            {student.backlog_count}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Remedial modules</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">Credits Completed</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {(student.credits_completed_ratio * 100).toFixed(0)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Degree progress</div>
        </div>
      </div>

      {/* Accessible Explainable AI Feedback */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Transparent Progression Insights (AI Explanation)</span>
          </h3>
          <p className="text-xs text-slate-500">
            EduShield explains how your coursework and engagement metrics shape your academic progress.
          </p>
        </div>

        {prediction && (
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-800 leading-relaxed">
            {prediction.plain_language_explanation}
          </div>
        )}

        {prediction && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* What's Helping You */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What's Keeping You on Track:</span>
              </h4>
              <ul className="space-y-1.5 text-emerald-950 text-[11px]">
                {prediction.negative_contributions.slice(0, 3).map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="font-bold">•</span>
                    <span><strong>{c.feature_label}</strong>: Observed {String(c.original_value)} is an academic strength.</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas Where Extra Support is Available */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-2">
              <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>Areas Where Campus Support Can Help:</span>
              </h4>
              <ul className="space-y-1.5 text-amber-950 text-[11px]">
                {prediction.positive_contributions.slice(0, 3).map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="font-bold">•</span>
                    <span><strong>{c.feature_label}</strong>: Raising this can significantly reduce academic stress.</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Voluntary Well-Being Check-in Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span>Voluntary Wellness Check-In</span>
            </h3>
            <p className="text-xs text-slate-500">
              Completely voluntary and confidential. Helps advisors recommend schedule feasibility and health resources.
            </p>
          </div>

          {surveySubmitted && (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Wellness Check-In Updated</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSurveySubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Perceived Academic Stress Level</span>
                <span className="font-mono text-brand-700">{stress} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stress}
                onChange={(e) => setStress(parseInt(e.target.value, 10))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 (Relaxed)</span>
                <span>10 (Overwhelmed)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Average Daily Nightly Sleep</span>
                <span className="font-mono text-brand-700">{sleep} hrs</span>
              </div>
              <input
                type="range"
                min="3.5"
                max="10"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(parseFloat(e.target.value))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>4.0 hrs</span>
                <span>10.0 hrs</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>One-Way Commute Duration</span>
                <span className="font-mono text-brand-700">{commute} minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={commute}
                onChange={(e) => setCommute(parseInt(e.target.value, 10))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>5 mins</span>
                <span>120 mins</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Sense of Campus Community & Belonging</span>
                <span className="font-mono text-brand-700">{belonging} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={belonging}
                onChange={(e) => setBelonging(parseInt(e.target.value, 10))}
                className="w-full accent-brand-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 (Isolated)</span>
                <span>10 (Connected)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingSurvey}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isUpdatingSurvey ? "Updating..." : "Save Confidential Check-In"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Campus Support Directory */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600" />
            <span>Campus Academic & Support Resources</span>
          </h3>
          <p className="text-xs text-slate-500">Free university programs designed to assist students</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <div className="font-semibold text-slate-900">Peer Tutoring Center</div>
            <p className="text-slate-500 text-[11px]">Free one-on-one sessions in core science and engineering subjects.</p>
            <div className="text-[11px] font-mono text-brand-600 pt-1">Mon-Fri 10am-6pm (Library Hall B)</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <div className="font-semibold text-slate-900">Financial Aid & Bursary Cell</div>
            <p className="text-slate-500 text-[11px]">Emergency tuition grants, flexible installment payment scheduling.</p>
            <div className="text-[11px] font-mono text-brand-600 pt-1">bursar@edushield.edu</div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
            <div className="font-semibold text-slate-900">Student Wellness Counseling</div>
            <p className="text-slate-500 text-[11px]">Confidential stress reduction, mental health, and study balance counselling.</p>
            <div className="text-[11px] font-mono text-brand-600 pt-1">wellness@edushield.edu</div>
          </div>
        </div>
      </div>
    </div>
  );
};

