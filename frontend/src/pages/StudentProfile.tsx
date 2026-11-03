import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { Student, PredictionResult, CounsellingReferral } from "../types";
import { RiskBadge } from "../components/common/RiskBadge";
import { HumanReviewBanner } from "../components/common/HumanReviewBanner";
import { SHAPWaterfallChart } from "../components/charts/SHAPWaterfallChart";
import {
  ArrowLeft,
  Sparkles,
  UserCheck,
  BrainCircuit,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  DollarSign,
  Heart,
  Activity,
  CheckCircle2,
  AlertTriangle,
  History,
  Send
} from "lucide-react";

export const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [referrals, setReferrals] = useState<CounsellingReferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [evalSuccess, setEvalSuccess] = useState(false);

  // Referral Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [refCategory, setRefCategory] = useState<"Academic" | "Attendance" | "Financial" | "Well-being" | "Engagement">("Academic");
  const [refUrgency, setRefUrgency] = useState<"High" | "Medium" | "Routine">("High");
  const [refReason, setRefReason] = useState("");
  const [refGoals, setRefGoals] = useState("");
  const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) return;
      setIsLoading(true);
      try {
        const studentRes = await api.getStudentById(studentId);
        setStudent(studentRes.student);

        // Fetch latest prediction or generate
        try {
          const predRes = await api.getLatestPrediction(studentId);
          setPrediction(predRes.prediction);
        } catch {
          // If no prediction yet, run one
          const livePred = await api.predictStudentRisk(studentId);
          setPrediction(livePred.prediction);
        }

        // Fetch referrals
        const refRes = await api.getReferrals({ studentId });
        setReferrals(refRes.referrals);
      } catch (err) {
        console.error("Failed to load student profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleRunEvaluation = async () => {
    if (!studentId) return;
    setIsPredicting(true);
    setEvalSuccess(false);
    try {
      const res = await api.predictStudentRisk(studentId);
      setPrediction(res.prediction);
      // Refresh student object
      const updatedStu = await api.getStudentById(studentId);
      setStudent(updatedStu.student);
      setEvalSuccess(true);
      setTimeout(() => setEvalSuccess(false), 4000);
    } catch (err) {
      console.error("Evaluation failed:", err);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleCreateReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !student) return;
    setIsSubmittingReferral(true);
    try {
      const evidence = prediction
        ? `TreeSHAP Attribution: Top risk drivers include ${prediction.positive_contributions.slice(0, 3).map((c) => `${c.feature_label} (+${c.shap_value})`).join(", ")}.`
        : "";

      await api.createReferral({
        student_id: student.student_id,
        urgency: refUrgency,
        category: refCategory,
        reason: refReason,
        shapEvidenceSummary: evidence,
        targetGoals: refGoals.split("\n").filter((g) => g.trim().length > 0)
      });

      setModalOpen(false);
      setRefReason("");
      setRefGoals("");

      // Refresh referrals
      const refRes = await api.getReferrals({ studentId });
      setReferrals(refRes.referrals);

      // Refresh student
      const stuRes = await api.getStudentById(studentId);
      setStudent(stuRes.student);
    } catch (err) {
      console.error("Failed to create referral:", err);
    } finally {
      setIsSubmittingReferral(false);
    }
  };

  if (isLoading || !student) {
    return (
      <div className="min-h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500">Loading student clinical and academic profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button and Profile Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          {evalSuccess && (
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>TreeSHAP Inference Updated</span>
            </span>
          )}

          <button
            onClick={handleRunEvaluation}
            disabled={isPredicting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isPredicting ? "Computing TreeSHAP..." : "Run Real-time ML Evaluation"}</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open Counselling Referral</span>
          </button>
        </div>
      </div>

      {/* Student Identity Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-brand-500/10">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{student.name}</h1>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {student.student_id}
                </span>
                <RiskBadge
                  category={student.currentRiskCategory}
                  score={Math.round(student.currentRiskProbability * 100)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                <span>{student.email}</span>
                <span>•</span>
                <span>{student.department}</span>
                <span>•</span>
                <span>Semester {student.current_semester}</span>
                <span>•</span>
                <span>Advisor: {student.assignedFacultyEmail || "General Advisory Cell"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
            <div className="text-center px-3 py-1">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Current GPA</div>
              <div className="text-lg font-bold font-mono text-slate-900">{student.gpa_current.toFixed(2)}</div>
            </div>
            <div className="text-center px-3 py-1 border-l border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Attendance</div>
              <div className={`text-lg font-bold font-mono ${student.attendance_rate < 75 ? "text-amber-600" : "text-slate-900"}`}>
                {student.attendance_rate}%
              </div>
            </div>
            <div className="text-center px-3 py-1 border-l border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Backlogs</div>
              <div className={`text-lg font-bold font-mono ${student.backlog_count > 0 ? "text-red-600" : "text-slate-900"}`}>
                {student.backlog_count}
              </div>
            </div>
            <div className="text-center px-3 py-1 border-l border-slate-100">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Tuition Fee</div>
              <div className="text-xs font-semibold mt-1">
                {student.tuition_fees_up_to_date === 1 ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Current</span>
                ) : (
                  <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">Arrears</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Human Review Banner if required */}
      {student.requiresHumanReview && (
        <HumanReviewBanner
          studentName={student.name}
          onInitiateReferral={() => setModalOpen(true)}
        />
      )}

      {/* Main Grid: Explainable AI & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Academic & Behaviour Metrics Breakdown */}
        <div className="space-y-6 lg:col-span-1">
          {/* Academic & Engagement Indicators */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-600" />
              <span>Academic & Coursework Metrics</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Prior Semester GPA</span>
                <span className="font-mono font-semibold text-slate-800">{student.gpa_previous_semester.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">High School Entrance GPA</span>
                <span className="font-mono font-semibold text-slate-800">{student.high_school_gpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Credits Earned Ratio</span>
                <span className="font-mono font-semibold text-slate-800">{(student.credits_completed_ratio * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Assignment Submission Rate</span>
                <span className="font-mono font-semibold text-slate-800">{student.assignment_submission_rate}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Quiz Assessment Average</span>
                <span className="font-mono font-semibold text-slate-800">{student.quiz_average_score}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lab Session Attendance</span>
                <span className="font-mono font-semibold text-slate-800">{student.lab_attendance_rate}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Repeated Courses Count</span>
                <span className="font-mono font-semibold text-slate-800">{student.repeated_courses_count}</span>
              </div>
            </div>
          </div>

          {/* Behaviour & LMS Activity */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Learning Engagement & Behaviour</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">LMS Logins / Week</span>
                <span className="font-mono font-semibold text-slate-800">{student.lms_logins_per_week} logins</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Forum Queries & Posts</span>
                <span className="font-mono font-semibold text-slate-800">{student.forum_participation_count} posts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Library Book Checkouts</span>
                <span className="font-mono font-semibold text-slate-800">{student.library_checkouts} books</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Video Lecture Watch Ratio</span>
                <span className="font-mono font-semibold text-slate-800">{(student.video_watch_ratio * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Self-Reported Study Hours</span>
                <span className="font-mono font-semibold text-slate-800">{student.study_hours_per_week} hrs/wk</span>
              </div>
            </div>
          </div>

          {/* Confidential Well-Being Survey Panel */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Voluntary Well-Being Indicators</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                Confidential
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Self-reported metrics from institutional wellness surveys, protected under ethical research protocols.
            </p>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Stress Level Score (1-10)</span>
                <span className={`font-mono font-semibold ${student.stress_level_score >= 8 ? "text-red-600" : "text-slate-800"}`}>
                  {student.stress_level_score} / 10
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Daily Nightly Sleep</span>
                <span className="font-mono font-semibold text-slate-800">{student.sleep_hours_per_day} hrs</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Daily Commute Duration</span>
                <span className="font-mono font-semibold text-slate-800">{student.commute_time_minutes} mins</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Campus Social Belonging</span>
                <span className="font-mono font-semibold text-slate-800">{student.social_belonging_score} / 10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (2 cols): TreeSHAP Explainability & Recommendations */}
        <div className="space-y-6 lg:col-span-2">
          {/* SHAP Waterfall Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-brand-600" />
                  <span>TreeSHAP Feature Attribution Waterfall</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Exact mathematical contribution of student indicators to predicted dropout probability
                </p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                Model: LightGBM
              </span>
            </div>

            {prediction && (
              <SHAPWaterfallChart
                contributions={prediction.top_contributing_features}
                baseValue={prediction.base_value}
                probability={prediction.dropout_risk_probability}
              />
            )}
          </div>

          {/* Plain-Language Clinical Synthesis */}
          {prediction && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-5 rounded-xl border border-blue-100 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Plain-Language Synthesis for Faculty Advisor</span>
              </h4>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">
                {prediction.plain_language_explanation}
              </p>
            </div>
          )}

          {/* Positive (Risk Elevating) & Negative (Protective) Breakdown */}
          {prediction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Risk Drivers */}
              <div className="bg-white p-4 rounded-xl border border-red-200/80 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Key Risk Factors (Elevating Risk)</span>
                </h4>
                <div className="space-y-2">
                  {prediction.positive_contributions.slice(0, 4).map((c, i) => (
                    <div key={i} className="p-2 bg-red-50/50 rounded-lg text-xs border border-red-100">
                      <div className="flex items-center justify-between font-semibold text-red-950">
                        <span>{c.feature_label}</span>
                        <span className="font-mono text-red-700">+{c.shap_value}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Observed value: <span className="font-mono font-medium text-slate-800">{String(c.original_value)}</span>
                      </div>
                      <div className="text-[10px] text-red-800/80 mt-0.5">{c.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protective Mitigators */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Protective Assets (Mitigating Risk)</span>
                </h4>
                <div className="space-y-2">
                  {prediction.negative_contributions.slice(0, 4).map((c, i) => (
                    <div key={i} className="p-2 bg-emerald-50/50 rounded-lg text-xs border border-emerald-100">
                      <div className="flex items-center justify-between font-semibold text-emerald-950">
                        <span>{c.feature_label}</span>
                        <span className="font-mono text-emerald-700">{c.shap_value}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        Observed value: <span className="font-mono font-medium text-slate-800">{String(c.original_value)}</span>
                      </div>
                      <div className="text-[10px] text-emerald-800/80 mt-0.5">{c.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actionable Human-Reviewed Interventions */}
          {prediction && prediction.suggested_interventions.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recommended Areas for Human Intervention</h3>
                <p className="text-xs text-slate-500">
                  Targeted, non-punitive support strategies tailored to this student's specific risk drivers
                </p>
              </div>

              <div className="space-y-3">
                {prediction.suggested_interventions.map((inv, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{inv.title}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                          {inv.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          inv.priority === "High" ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-700"
                        }`}>
                          {inv.priority} Priority
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-600 text-[11px]">{inv.rationale}</div>
                    <div className="text-brand-900 font-medium bg-brand-50/70 p-2 rounded-lg border border-brand-100 text-[11px]">
                      Recommended Action: {inv.suggested_action}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Counselling Case History & Longitudinal Notes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-brand-600" />
                <span>Counselling Case History & Action Plans</span>
              </h3>
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                + New Referral
              </button>
            </div>

            {referrals.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs italic bg-slate-50/60 rounded-lg border border-slate-100">
                No active or historical counselling cases recorded for this student.
              </div>
            ) : (
              <div className="space-y-4">
                {referrals.map((ref) => (
                  <div key={ref._id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{ref.category} Support Referral</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 font-medium border border-slate-200">
                          Status: {ref.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ref.referralDate).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px]">{ref.reason}</p>

                    {ref.actionPlan?.targetGoals?.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 text-[11px]">
                        <div className="font-semibold text-slate-700 mb-1">Target Goals:</div>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                          {ref.actionPlan.targetGoals.map((g, gi) => (
                            <li key={gi}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {ref.sessions?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-semibold text-slate-700">Conducted Sessions ({ref.sessions.length}):</div>
                        {ref.sessions.map((sess, si) => (
                          <div key={si} className="p-2 rounded bg-slate-50 text-[11px] text-slate-600 border border-slate-100">
                            <div className="flex justify-between font-medium text-slate-800">
                              <span>Session by {sess.counsellorName}</span>
                              <span className="text-slate-400">{new Date(sess.sessionDate).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-1">{sess.notes}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Referral Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Initiate Counselling Referral</h3>
                <p className="text-xs text-slate-500">For student {student.name} ({student.student_id})</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReferralSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Intervention Category</label>
                  <select
                    value={refCategory}
                    onChange={(e: any) => setRefCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Academic">Academic Tutoring</option>
                    <option value="Attendance">Attendance Regularity</option>
                    <option value="Financial">Financial / Tuition Aid</option>
                    <option value="Well-being">Voluntary Well-Being</option>
                    <option value="Engagement">Campus Engagement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Triage Urgency</label>
                  <select
                    value={refUrgency}
                    onChange={(e: any) => setRefUrgency(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="High">High Urgency</option>
                    <option value="Medium">Medium</option>
                    <option value="Routine">Routine Advisory</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason & Clinical Observations</label>
                <textarea
                  rows={3}
                  required
                  value={refReason}
                  onChange={(e) => setRefReason(e.target.value)}
                  placeholder="Detail the circumstances, missed coursework, or observations motivating this referral..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Goals (One per line)</label>
                <textarea
                  rows={3}
                  value={refGoals}
                  onChange={(e) => setRefGoals(e.target.value)}
                  placeholder="e.g.&#10;Complete backlog tutoring sessions&#10;Maintain 80% lecture attendance"
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReferral}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReferral ? "Creating..." : "Submit Referral"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

