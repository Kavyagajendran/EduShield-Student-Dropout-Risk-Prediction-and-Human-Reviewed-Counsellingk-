import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export class MLServiceClient {
  private static baseURL = ML_SERVICE_URL;

  public static async getHealth() {
    const res = await axios.get(`${this.baseURL}/health`, { timeout: 4000 });
    return res.data;
  }

  public static async predictStudent(studentFeatures: any) {
    const res = await axios.post(`${this.baseURL}/predict`, studentFeatures, {
      timeout: 10000,
      headers: { "Content-Type": "application/json" }
    });
    return res.data;
  }

  public static async batchPredict(studentList: any[]) {
    const res = await axios.post(`${this.baseURL}/batch-predict`, studentList, {
      timeout: 30000,
      headers: { "Content-Type": "application/json" }
    });
    return res.data;
  }

  public static async getBenchmarkMetrics() {
    const res = await axios.get(`${this.baseURL}/models/benchmark`, { timeout: 6000 });
    return res.data;
  }

  public static async getGlobalFeatureImportance() {
    const res = await axios.get(`${this.baseURL}/models/feature-importance`, { timeout: 6000 });
    return res.data;
  }
}

