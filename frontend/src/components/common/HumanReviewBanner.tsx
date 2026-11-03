import React from "react";
import { ShieldAlert, UserCheck, ArrowRight } from "lucide-react";

interface HumanReviewBannerProps {
  studentName?: string;
  onInitiateReferral?: () => void;
  compact?: boolean;
}

export const HumanReviewBanner: React.FC<HumanReviewBannerProps> = ({
  studentName,
  onInitiateReferral,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 px-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-medium">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
        <span className="truncate">Requires human faculty review</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5 sm:mt-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-950 flex items-center gap-2">
              Human-Reviewed Faculty Assessment Required
              <span className="text-xs bg-amber-200/80 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                Ethical Safeguard Active
              </span>
            </h4>
            <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
              {studentName ? `${studentName} has been flagged` : "This record has been flagged"} for human faculty review.
              In compliance with EduShield governance principles, ML predictions serve as advisory evidence only;
              no disciplinary, grading, or status actions may occur without direct human review.
            </p>
          </div>
        </div>

        {onInitiateReferral && (
          <button
            onClick={onInitiateReferral}
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            <span>Open Counselling Referral</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};

