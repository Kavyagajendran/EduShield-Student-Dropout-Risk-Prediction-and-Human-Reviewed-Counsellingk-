import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, DEMO_CREDENTIALS } from "../context/AuthContext";
import { UserRole } from "../types";
import { Shield, Lock, Mail, Users, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await switchDemoRole(role);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white mx-auto shadow-md shadow-brand-500/20">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          EduShield
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 max-w-sm mx-auto">
          An Explainable AI Framework for Student Dropout Risk Prediction and Human-Reviewed Counselling
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-2xl sm:px-10 border border-slate-200/80">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Institutional Email
              </label>
              <div className="mt-1 relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@edushield.edu"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors disabled:opacity-50"
            >
              <span>{isSubmitting ? "Authenticating..." : "Sign In to EduShield"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Switcher */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-3">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Instant Demonstration Personas (1-Click)</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemo("admin")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100/60 text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-purple-900">Administrator Portal</div>
                  <div className="text-[11px] text-purple-700 font-mono">admin@edushield.edu</div>
                </div>
                <span className="text-[10px] bg-purple-200/80 text-purple-800 font-semibold px-2 py-0.5 rounded">Dean</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("faculty")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-blue-900">Faculty Advisor Portal</div>
                  <div className="text-[11px] text-blue-700 font-mono">faculty.smith@edushield.edu</div>
                </div>
                <span className="text-[10px] bg-blue-200/80 text-blue-800 font-semibold px-2 py-0.5 rounded">Advisor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("student")}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/60 text-left transition-colors"
              >
                <div>
                  <div className="text-xs font-semibold text-emerald-900">Student Portal</div>
                  <div className="text-[11px] text-emerald-700 font-mono">student.alex@edushield.edu</div>
                </div>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-800 font-semibold px-2 py-0.5 rounded">Student</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Academic Transparency */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>TreeSHAP Model Explainability Active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Compliant with Educational Data Ethics & Human-in-the-Loop Decision Protocols
          </p>
        </div>
      </div>
    </div>
  );
};

