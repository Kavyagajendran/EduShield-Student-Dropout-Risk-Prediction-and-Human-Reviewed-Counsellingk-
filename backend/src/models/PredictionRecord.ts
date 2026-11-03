import mongoose, { Document, Schema } from "mongoose";

export interface ISHAPContribution {
  feature: string;
  feature_label: string;
  original_value: any;
  shap_value: number;
  direction: string;
  magnitude: number;
  description: string;
}

export interface ISuggestedIntervention {
  category: string;
  title: string;
  rationale: string;
  priority: string;
  suggested_action: string;
}

export interface IPredictionRecord extends Document {
  student_id: string;
  dropout_risk_probability: number;
  risk_category: "Low" | "Moderate" | "High";
  prediction_label: string;
  champion_model: string;
  base_value: number;
  confidence_score: number;
  top_contributing_features: ISHAPContribution[];
  positive_contributions: ISHAPContribution[];
  negative_contributions: ISHAPContribution[];
  plain_language_explanation: string;
  suggested_areas_for_review: string[];
  suggested_interventions: ISuggestedIntervention[];
  requires_human_review: boolean;
  evaluatedByUserId?: string;
  evaluatedAt: Date;
}

const SHAPContributionSchema = new Schema<ISHAPContribution>(
  {
    feature: { type: String, required: true },
    feature_label: { type: String, required: true },
    original_value: { type: Schema.Types.Mixed },
    shap_value: { type: Number, required: true },
    direction: { type: String, required: true },
    magnitude: { type: Number, required: true },
    description: { type: String, default: "" }
  },
  { _id: false }
);

const SuggestedInterventionSchema = new Schema<ISuggestedIntervention>(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    rationale: { type: String, required: true },
    priority: { type: String, required: true },
    suggested_action: { type: String, required: true }
  },
  { _id: false }
);

const PredictionRecordSchema = new Schema<IPredictionRecord>(
  {
    student_id: { type: String, required: true, index: true },
    dropout_risk_probability: { type: Number, required: true },
    risk_category: { type: String, required: true },
    prediction_label: { type: String, required: true },
    champion_model: { type: String, default: "LightGBM" },
    base_value: { type: Number, required: true },
    confidence_score: { type: Number, required: true },
    top_contributing_features: { type: [SHAPContributionSchema], default: [] },
    positive_contributions: { type: [SHAPContributionSchema], default: [] },
    negative_contributions: { type: [SHAPContributionSchema], default: [] },
    plain_language_explanation: { type: String, required: true },
    suggested_areas_for_review: { type: [String], default: [] },
    suggested_interventions: { type: [SuggestedInterventionSchema], default: [] },
    requires_human_review: { type: Boolean, default: false },
    evaluatedByUserId: { type: String, default: "system" },
    evaluatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const PredictionRecord = mongoose.model<IPredictionRecord>("PredictionRecord", PredictionRecordSchema);
