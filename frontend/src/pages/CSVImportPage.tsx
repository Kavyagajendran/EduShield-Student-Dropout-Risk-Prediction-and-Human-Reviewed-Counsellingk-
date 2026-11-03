import React, { useState } from "react";
import { api } from "../services/api";
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ArrowRight
} from "lucide-react";

export const CSVImportPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResultMessage(null);
      setErrorMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setResultMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.importCSV(file);
      setResultMessage(res.message);
      setFile(null);
    } catch (err: any) {
      setErrorMessage(err.message || "CSV import failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      "student_id", "name", "email", "department", "current_semester",
      "gpa_current", "gpa_previous_semester", "high_school_gpa", "credits_completed_ratio",
      "attendance_rate", "lab_attendance_rate", "backlog_count", "repeated_courses_count",
      "assignment_submission_rate", "quiz_average_score", "lms_logins_per_week",
      "forum_participation_count", "library_checkouts", "video_watch_ratio",
      "study_hours_per_week", "scholarship_recipient", "tuition_fees_up_to_date",
      "parental_education_level", "family_income_bracket", "stress_level_score",
      "sleep_hours_per_day", "commute_time_minutes", "social_belonging_score"
    ];

    const sampleRow = [
      "STU-2026-9999", "Sample Student", "sample@edushield.edu", "Computer Science", "3",
      "2.85", "2.90", "3.20", "0.85",
      "78.5", "80.0", "1", "0",
      "80.0", "75.0", "12",
      "4", "5", "0.75",
      "14.0", "0", "1",
      "Bachelor", "Medium", "5",
      "7.0", "35", "6"
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), sampleRow.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "edushield_student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>CSV Batch Student Ingestion</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Import new student cohorts and academic attributes for explainable AI dropout risk evaluation.
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-brand-600" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* Upload Box */}
      <div className="bg-white p-8 rounded-xl border border-slate-200/80 shadow-2xs space-y-6">
        {resultMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{resultMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-800">
              {file ? file.name : "Select or drag and drop a student dataset CSV"}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supports standard commas or semicolon delimited student records
            </p>

            <label className="mt-4 inline-block px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs rounded-lg cursor-pointer transition-colors border border-brand-200">
              <span>Browse Local Files</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={!file || isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs disabled:opacity-40"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isUploading ? "Validating & Ingesting..." : "Process and Ingest Dataset"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Guidance Card */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800">CSV Import Requirements & Guidance:</h4>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
          <li>Required columns: <code className="font-mono text-slate-700">student_id</code>, <code className="font-mono text-slate-700">department</code>, <code className="font-mono text-slate-700">gpa_current</code>, <code className="font-mono text-slate-700">attendance_rate</code>, <code className="font-mono text-slate-700">backlog_count</code>.</li>
          <li>GPA must follow the standard 0.00 – 4.00 scale; attendance must be reported as a percentage (0 – 100).</li>
          <li>Existing student IDs will be updated; novel student records will be created automatically.</li>
        </ul>
      </div>
    </div>
  );
};

