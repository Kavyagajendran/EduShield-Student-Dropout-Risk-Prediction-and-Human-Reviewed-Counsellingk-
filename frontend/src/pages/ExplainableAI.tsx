import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { PredictionResult } from "../types";
import { SHAPWaterfallChart } from "../components/charts/SHAPWaterfallChart";
import { RiskBadge } from "../components/common/RiskBadge";
import {
  BrainCircuit,
  Sliders,
  Sparkles,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  BarChart,
  Lightbulb
} from "lucide-react";

export const ExplainableAI: React.FC = () => {
  const [globalImportance, setGlobalImportance] = useState<Array<{ feature: string; importance: number; rank: number }>>([]);
  const [featureDescriptions, setFeatureDescriptions] = useState<Record<string, string>>({});
  const [championModel, setChampionModel] = useState<string>("LightGBM");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Simulator state
  const [simGpa, setSimGpa] = useState<number>(2.4);
  const [simAttendance, setSimAttendance] = useState<number>(68.0);
  const [simBacklogs, setSimBacklogs] = useState<number>(2);
  const [simTuition, setSimTuition] = useState<number>(0);
  const [simLmsLogins, setSimLmsLogins] = useState<number>(6);
  const [simStress, setSimStress] = useState<number>(8);
  const [simAssignmentRate, setSimAssignmentRate] = useState<number>(65.0);

  const [simPrediction, setSimPrediction] = useState<PredictionResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    const fetchGlobalImportance = async () => {
      setIsLoading(true);
      try {
        const res = await api.getFeatureImportance();
        setGlobalImportance(res.global_importance || []);
        setFeatureDescriptions(res.feature_descriptions || {});
        setChampionModel(res.champion_model || "LightGBM");
      } catch (err) {
        console.error("Failed to load feature importance:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGlobalImportance();
  }, []);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      // Call direct prediction via fetch or proxy
      const payload = {
        student_id: "SIM-INTERACTIVE",
        department: "Computer Science",
        current_semester: 3,
        gpa_current: simGpa,
        gpa_previous_semester: simGpa + 0.1,
        high_school_gpa: 3.1,
        credits_completed_ratio: 0.70,
        attendance_rate: simAttendance,
        lab_attendance_rate: simAttendance,
        backlog_count: simBacklogs,
        repeated_courses_count: Math.max(0, simBacklogs - 1),
        assignment_submission_rate: simAssignmentRate,
        quiz_average_score: simAssignmentRate * 0.9,
        lms_logins_per_week: simLmsLogins,
        forum_participation_count: 2,
        library_checkouts: 3,
        video_watch_ratio: 0.6,
        study_hours_per_week: 10.0,
        scholarship_recipient: 0,
        tuition_fees_up_to_date: simTuition,
        parental_education_level: "Bachelor",
        family_income_bracket: "Medium",
        stress_level_score: simStress,
        sleep_hours_per_day: 6.5,
        commute_time_minutes: 35,
        social_belonging_score: 5
      };

      // Call ML prediction endpoint directly through backend client or fetch
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setSimPrediction(data);
    } catch (err) {
      console.warn("Direct ML call failed, using synthetic fallback simulator response:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run initial simulation on load
  useEffect(() => {
    runSimulation();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Explainable AI & TreeSHAP Hub</h1>
            <span className="text-xs font-mono font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
              Model: {championModel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global feature attribution rankings and real-time interactive What-If scenario simulator.
          </p>
        </div>
      </div>

      {/* Global Feature Importance vs Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Global Importance Table (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart className="w-4 h-4 text-brand-600" />
                <span>Global SHAP Feature Importance</span>
              </h3>
              <p className="text-xs text-slate-500">Mean absolute SHAP value across testing cohort</p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading importance rankings...</div>
          ) : (
            <div className="space-y-2">
              {globalImportance.slice(0, 10).map((item) => {
                const maxImp = globalImportance[0]?.importance || 1.0;
                const widthPct = Math.min(100, Math.round((item.importance / maxImp) * 100));
                const label = item.feature.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div key={item.feature} className="p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50/70 transition-colors text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 font-mono text-[10px] flex items-center justify-center font-bold text-slate-600">
                          {item.rank}
                        </span>
                        <span className="font-semibold text-slate-800">{label}</span>
                      </div>
                      <span className="font-mono text-slate-500 font-medium">|SHAP|: {item.importance.toFixed(3)}</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${widthPct}%` }}
                      ></div>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      {featureDescriptions[item.feature] || "Academic & behavioural signal"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: What-If Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Controls Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-brand-600" />
                  <span>Interactive What-If Simulation Laboratory</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust student parameters to observe immediate changes in predicted probability and SHAP attribution
                </p>
              </div>

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSimulating ? "Recalculating..." : "Simulate Scenario"}</span>
              </button>
            </div>

            {/* Slider Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              {/* GPA */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Cumulative GPA</span>
                  <span className="font-mono text-brand-700 font-bold">{simGpa.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.05"
                  value={simGpa}
                  onChange={(e) => setSimGpa(parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>1.00</span>
                  <span>4.00</span>
                </div>
              </div>

              {/* Attendance */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Attendance Rate (%)</span>
                  <span className="font-mono text-brand-700 font-bold">{simAttendance}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  step="1"
                  value={simAttendance}
                  onChange={(e) => setSimAttendance(parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>30%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Backlog Count */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Active Course Backlogs</span>
                  <span className="font-mono text-brand-700 font-bold">{simBacklogs} courses</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="1"
                  value={simBacklogs}
                  onChange={(e) => setSimBacklogs(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0</span>
                  <span>5+</span>
                </div>
              </div>

              {/* Tuition Fees */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Tuition Fee Standing</span>
                  <span className={`font-semibold ${simTuition === 1 ? "text-emerald-700" : "text-red-700"}`}>
                    {simTuition === 1 ? "Paid (Current)" : "Arrears (Unpaid)"}
                  </span>
                </div>
                <select
                  value={simTuition}
                  onChange={(e) => setSimTuition(parseInt(e.target.value, 10))}
                  className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                >
                  <option value={1}>Current (Up to date)</option>
                  <option value={0}>Arrears (Outstanding payment)</option>
                </select>
              </div>

              {/* Assignment Submission */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Assignment Completion</span>
                  <span className="font-mono text-brand-700 font-bold">{simAssignmentRate}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={simAssignmentRate}
                  onChange={(e) => setSimAssignmentRate(parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>

              {/* Stress Level */}
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-700">Well-Being Stress Score</span>
                  <span className="font-mono text-brand-700 font-bold">{simStress} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={simStress}
                  onChange={(e) => setSimStress(parseInt(e.target.value, 10))}
                  className="w-full accent-brand-600"
                />
              </div>
            </div>
          </div>

          {/* Simulation Output Card */}
          {simPrediction && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    {(simPrediction.dropout_risk_probability * 100).toFixed(1)}%
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-700">Simulated Dropout Likelihood</div>
                    <RiskBadge
                      category={simPrediction.risk_category}
                      score={Math.round(simPrediction.dropout_risk_probability * 100)}
                      size="sm"
                    />
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-500">Human Review Flag: </span>
                  <span className={`font-semibold ${simPrediction.requires_human_review ? "text-amber-700" : "text-emerald-700"}`}>
                    {simPrediction.requires_human_review ? "Required" : "Standard"}
                  </span>
                </div>
              </div>

              {/* Simulated SHAP Chart */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Simulated TreeSHAP Local Explanation</h4>
                <SHAPWaterfallChart
                  contributions={simPrediction.top_contributing_features}
                  baseValue={simPrediction.base_value}
                  probability={simPrediction.dropout_risk_probability}
                />
              </div>

              {/* Explanation Text */}
              <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200/60 leading-relaxed">
                {simPrediction.plain_language_explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

