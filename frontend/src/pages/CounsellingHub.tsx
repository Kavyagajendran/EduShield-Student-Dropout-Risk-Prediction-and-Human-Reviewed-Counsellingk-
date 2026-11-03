import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { CounsellingReferral } from "../types";
import {
  HeartHandshake,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MessageSquare,
  Plus,
  Send,
  ArrowRight,
  Filter
} from "lucide-react";

export const CounsellingHub: React.FC = () => {
  const [referrals, setReferrals] = useState<CounsellingReferral[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add Session Modal
  const [sessionModalOpen, setSessionModalOpen] = useState<boolean>(false);
  const [selectedReferral, setSelectedReferral] = useState<CounsellingReferral | null>(null);
  const [sessionNotes, setSessionNotes] = useState<string>("");
  const [interventionsApplied, setInterventionsApplied] = useState<string>("");
  const [studentResponse, setStudentResponse] = useState<string>("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState<string>("");
  const [isSubmittingSession, setIsSubmittingSession] = useState<boolean>(false);

  // Resolve Modal
  const [resolveModalOpen, setResolveModalOpen] = useState<boolean>(false);
  const [finalOutcome, setFinalOutcome] = useState<string>("");
  const [progressRating, setProgressRating] = useState<"Stable" | "Improving" | "Resolved">("Resolved");
  const [isSubmittingResolve, setIsSubmittingResolve] = useState<boolean>(false);

  const fetchReferrals = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (activeTab !== "All") params.status = activeTab;
      if (categoryFilter) params.category = categoryFilter;
      const res = await api.getReferrals(params);
      setReferrals(res.referrals);
    } catch (err) {
      console.error("Failed to load referrals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [activeTab, categoryFilter]);

  const handleAddSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral) return;
    setIsSubmittingSession(true);
    try {
      await api.addSession(selectedReferral._id, {
        notes: sessionNotes,
        interventionsApplied: interventionsApplied.split(",").map((s) => s.trim()).filter(Boolean),
        studentResponse,
        nextFollowUpDate: nextFollowUpDate || undefined
      });
      setSessionModalOpen(false);
      setSessionNotes("");
      setInterventionsApplied("");
      setStudentResponse("");
      setNextFollowUpDate("");
      fetchReferrals();
    } catch (err) {
      console.error("Failed to add session:", err);
    } finally {
      setIsSubmittingSession(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral) return;
    setIsSubmittingResolve(true);
    try {
      await api.resolveReferral(selectedReferral._id, {
        finalOutcome,
        progressRating
      });
      setResolveModalOpen(false);
      setFinalOutcome("");
      fetchReferrals();
    } catch (err) {
      console.error("Failed to resolve referral:", err);
    } finally {
      setIsSubmittingResolve(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Human-Reviewed Counselling & Intervention Hub</span>
            <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full border border-brand-200 font-medium">
              Human-in-the-Loop Authority
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervised support workflows, clinical intervention logs, and student action plan oversight.
          </p>
        </div>

        <Link
          to="/students?requiresReview=true"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-2xs"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Triage Flagged Students</span>
        </Link>
      </div>

      {/* Filter and Tab Navigation */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {["All", "Referred", "In Progress", "Resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1 px-2.5 border border-slate-200 rounded-lg text-slate-700 bg-slate-50"
          >
            <option value="">All Categories</option>
            <option value="Academic">Academic Tutoring</option>
            <option value="Attendance">Attendance Regularity</option>
            <option value="Financial">Financial Aid</option>
            <option value="Well-being">Voluntary Well-Being</option>
            <option value="Engagement">Campus Engagement</option>
          </select>
        </div>
      </div>

      {/* Referrals Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading counselling cases...
        </div>
      ) : referrals.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 text-xs rounded-xl border border-slate-200">
          No counselling cases found for the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {referrals.map((r) => {
            const isResolved = r.status === "Resolved";
            return (
              <div
                key={r._id}
                className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/students/${r.student_id}`}
                          className="font-bold text-sm text-slate-900 hover:text-brand-600 transition-colors"
                        >
                          {r.studentName}
                        </Link>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {r.student_id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Referred by {r.referredByName} on {new Date(r.referralDate).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                        {r.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          r.urgency === "High"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.urgency}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {r.reason}
                  </p>

                  {r.shapEvidenceSummary && (
                    <div className="text-[11px] text-slate-600 bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                      <span className="font-semibold text-brand-900">XAI Rationale: </span>
                      <span>{r.shapEvidenceSummary}</span>
                    </div>
                  )}

                  {r.actionPlan?.targetGoals?.length > 0 && (
                    <div className="space-y-1 text-xs">
                      <div className="text-[11px] font-semibold text-slate-700">Target Action Plan:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                        {r.actionPlan.targetGoals.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sessions Log */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Intervention Sessions ({r.sessions.length})</span>
                      <span className="text-[10px] text-slate-400">
                        Progress: <span className="text-brand-700 font-bold">{r.progressRating}</span>
                      </span>
                    </div>

                    {r.sessions.length === 0 ? (
                      <div className="text-[11px] text-slate-400 italic">No formal sessions recorded yet.</div>
                    ) : (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {r.sessions.map((sess, idx) => (
                          <div key={idx} className="p-2 rounded bg-slate-50 text-[11px] border border-slate-100">
                            <div className="flex justify-between font-medium text-slate-800">
                              <span>{sess.counsellorName}</span>
                              <span className="text-slate-400">{new Date(sess.sessionDate).toLocaleDateString()}</span>
                            </div>
                            <div className="text-slate-600 mt-1">{sess.notes}</div>
                            {sess.interventionsApplied?.length > 0 && (
                              <div className="text-[10px] text-brand-800 mt-1">
                                Interventions: {sess.interventionsApplied.join(", ")}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {isResolved && r.finalOutcome && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs">
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Final Case Outcome:</span>
                      </div>
                      <div className="text-[11px] mt-0.5">{r.finalOutcome}</div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${
                    isResolved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {r.status}
                  </span>

                  <div className="flex items-center gap-2">
                    {!isResolved && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedReferral(r);
                            setSessionModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded transition-colors flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Log Session</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReferral(r);
                            setResolveModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolve Case</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Log Session Modal */}
      {sessionModalOpen && selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Counselling Session</h3>
                <p className="text-xs text-slate-500">Student: {selectedReferral.studentName} ({selectedReferral.student_id})</p>
              </div>
              <button onClick={() => setSessionModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSessionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Counsellor Notes & Dialogue</label>
                <textarea
                  rows={3}
                  required
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Record summary of conversation, obstacles identified, and guidance delivered..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interventions Applied (comma separated)</label>
                <input
                  type="text"
                  value={interventionsApplied}
                  onChange={(e) => setInterventionsApplied(e.target.value)}
                  placeholder="e.g. Peer Tutoring, Bursary Application, Attendance Contract"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student Response & Commitment</label>
                <input
                  type="text"
                  value={studentResponse}
                  onChange={(e) => setStudentResponse(e.target.value)}
                  placeholder="e.g. Student receptive, agreed to 3 weekly tutoring sessions"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Follow-Up Date</label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSessionModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSession}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingSession ? "Saving..." : "Save Session"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModalOpen && selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Resolve Counselling Case</h3>
                <p className="text-xs text-slate-500">Document the final resolution for {selectedReferral.studentName}</p>
              </div>
              <button onClick={() => setResolveModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Final Outcome & Resolution Summary</label>
                <textarea
                  rows={3}
                  required
                  value={finalOutcome}
                  onChange={(e) => setFinalOutcome(e.target.value)}
                  placeholder="Detail how the student's risk was mitigated, completed examinations, or resolved issues..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Progress Assessment</label>
                <select
                  value={progressRating}
                  onChange={(e: any) => setProgressRating(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Resolved">Resolved (Risk safely stabilized)</option>
                  <option value="Improving">Improving (Continued standard monitoring)</option>
                  <option value="Stable">Stable</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolveModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResolve}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isSubmittingResolve ? "Closing Case..." : "Confirm Resolution"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

