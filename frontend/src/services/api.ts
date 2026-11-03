import {
  User,
  Student,
  PredictionResult,
  CounsellingReferral,
  BenchmarkMetricsResponse,
  DashboardAnalytics,
  AuditLogItem
} from "../types";

const API_BASE = "/api";

const getHeaders = (isFormData: boolean = false): HeadersInit => {
  const token = localStorage.getItem("edushield_token");
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

const handleResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.error || errorMsg;
    } catch {
      // fallback to statusText
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
};

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    return handleResponse<{ message: string; token: string; user: User }>(res);
  },

  register: async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string; token: string; user: User }>(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse<{ user: User }>(res);
  },

  // Students
  getStudents: async (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") query.append(k, String(v));
      });
    }
    const res = await fetch(`${API_BASE}/students?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse<{
      students: Student[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(res);
  },

  getStudentById: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/students/${studentId}`, {
      headers: getHeaders()
    });
    return handleResponse<{ student: Student }>(res);
  },

  createStudent: async (data: any) => {
    const res = await fetch(`${API_BASE}/students`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string; student: Student }>(res);
  },

  updateStudent: async (studentId: string, data: any) => {
    const res = await fetch(`${API_BASE}/students/${studentId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string; student: Student }>(res);
  },

  deleteStudent: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/students/${studentId}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  importCSV: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/students/import/csv`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse<{ message: string; importedCount: number }>(res);
  },

  // Predictions & Explainable AI
  predictStudentRisk: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/predictions/${studentId}`, {
      method: "POST",
      headers: getHeaders()
    });
    return handleResponse<{ prediction: PredictionResult; recordId: string }>(res);
  },

  getStudentPredictionHistory: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/predictions/${studentId}/history`, {
      headers: getHeaders()
    });
    return handleResponse<{ history: PredictionResult[] }>(res);
  },

  getLatestPrediction: async (studentId: string) => {
    const res = await fetch(`${API_BASE}/predictions/${studentId}/latest`, {
      headers: getHeaders()
    });
    return handleResponse<{ prediction: PredictionResult }>(res);
  },

  // Counselling
  createReferral: async (data: any) => {
    const res = await fetch(`${API_BASE}/counselling`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string; referral: CounsellingReferral }>(res);
  },

  getReferrals: async (params?: Record<string, any>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== "") query.append(k, String(v));
      });
    }
    const res = await fetch(`${API_BASE}/counselling?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse<{ referrals: CounsellingReferral[]; count: number }>(res);
  },

  getReferralById: async (referralId: string) => {
    const res = await fetch(`${API_BASE}/counselling/${referralId}`, {
      headers: getHeaders()
    });
    return handleResponse<{ referral: CounsellingReferral }>(res);
  },

  addSession: async (referralId: string, sessionData: any) => {
    const res = await fetch(`${API_BASE}/counselling/${referralId}/sessions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(sessionData)
    });
    return handleResponse<{ message: string; referral: CounsellingReferral }>(res);
  },

  updateActionPlan: async (referralId: string, planData: any) => {
    const res = await fetch(`${API_BASE}/counselling/${referralId}/action-plan`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(planData)
    });
    return handleResponse<{ message: string; referral: CounsellingReferral }>(res);
  },

  resolveReferral: async (referralId: string, outcomeData: any) => {
    const res = await fetch(`${API_BASE}/counselling/${referralId}/resolve`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(outcomeData)
    });
    return handleResponse<{ message: string; referral: CounsellingReferral }>(res);
  },

  // Analytics
  getDashboardAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getHeaders()
    });
    return handleResponse<DashboardAnalytics>(res);
  },

  // Models Benchmark
  getBenchmarkMetrics: async () => {
    const res = await fetch(`${API_BASE}/models/benchmark`, {
      headers: getHeaders()
    });
    return handleResponse<BenchmarkMetricsResponse>(res);
  },

  getFeatureImportance: async () => {
    const res = await fetch(`${API_BASE}/models/feature-importance`, {
      headers: getHeaders()
    });
    return handleResponse<{
      champion_model: string;
      global_importance: Array<{ feature: string; importance: number; rank: number }>;
      feature_descriptions: Record<string, string>;
    }>(res);
  },

  // Reports
  getInstitutionalReport: async (params?: { department?: string; riskCategory?: string; format?: string }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, String(v));
      });
    }
    const res = await fetch(`${API_BASE}/reports/institutional?${query.toString()}`, {
      headers: getHeaders()
    });
    return handleResponse<any>(res);
  },

  // Audit Logs
  getAuditLogs: async (limit: number = 50) => {
    const res = await fetch(`${API_BASE}/audit?limit=${limit}`, {
      headers: getHeaders()
    });
    return handleResponse<{ logs: AuditLogItem[] }>(res);
  }
};

