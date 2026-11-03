import { Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { AuthRequest, generateToken } from "../middleware/auth";
import { logAuditEvent } from "../services/auditService";

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const authPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      assignedStudentIds: user.assignedStudentIds || [],
      studentRefId: user.studentRefId
    };

    const token = generateToken(authPayload);

    // Audit log
    await logAuditEvent(
      { user: authPayload } as any,
      "USER_LOGIN",
      "User",
      user._id.toString(),
      `User ${user.email} logged in with role ${user.role}`
    );

    res.json({
      message: "Login successful",
      token,
      user: authPayload
    });
  } catch (err: any) {
    res.status(500).json({ error: `Login error: ${err.message}` });
  }
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, department, studentRefId } = req.body;

    if (!email || !password || !name || !role) {
      res.status(400).json({ error: "Email, password, name, and role are required" });
      return;
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "User with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role,
      department: department || "General",
      assignedStudentIds: [],
      studentRefId: studentRefId || null
    });

    const authPayload = {
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      department: newUser.department,
      assignedStudentIds: [],
      studentRefId: newUser.studentRefId
    };

    const token = generateToken(authPayload);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: authPayload
    });
  } catch (err: any) {
    res.status(500).json({ error: `Registration error: ${err.message}` });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }

    res.json({ user });
  } catch (err: any) {
    res.status(500).json({ error: `Profile error: ${err.message}` });
  }
};

