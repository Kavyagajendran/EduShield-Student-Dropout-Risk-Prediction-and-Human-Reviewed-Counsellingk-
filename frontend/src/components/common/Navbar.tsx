import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, DEMO_CREDENTIALS } from "../../context/AuthContext";
import { UserRole } from "../../types";
import { Shield, Users, LogOut, ChevronDown, Check, UserCircle } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (role: UserRole) => {
    setDemoMenuOpen(false);
    await switchDemoRole(role);
    navigate("/");
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case "admin":
        return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">Admin</span>;
      case "faculty":
        return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">Faculty</span>;
      case "student":
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">Student</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">EduShield</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 font-semibold">
                XAI Framework
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Explainable AI Dropout Prevention & Counselling</p>
          </div>
        </Link>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-brand-600" />
              <span>Demo Switcher</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 text-slate-500 font-medium text-[11px]">
                  Switch Role Persona:
                </div>
                {(["admin", "faculty", "student"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSwitch(r)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700 font-medium"
                  >
                    <div>
                      <div className="capitalize font-semibold text-slate-800">{r} Portal</div>
                      <div className="text-[10px] text-slate-500">{DEMO_CREDENTIALS[r].title}</div>
                    </div>
                    {user?.role === r && <Check className="w-4 h-4 text-brand-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Info */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <UserCircle className="w-5 h-5 text-slate-500" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1.5">
                  <span>{user.name}</span>
                  {getRoleBadge(user.role)}
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{user.email}</div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

