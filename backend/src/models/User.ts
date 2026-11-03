import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: "admin" | "faculty" | "student";
  department?: string;
  assignedStudentIds?: string[];
  studentRefId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, enum: ["admin", "faculty", "student"], required: true },
    department: { type: String, default: "General" },
    assignedStudentIds: { type: [String], default: [] },
    studentRefId: { type: String, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);

