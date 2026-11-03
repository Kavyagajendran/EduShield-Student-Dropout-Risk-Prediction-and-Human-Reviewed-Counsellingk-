import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: "admin" | "faculty" | "student";
  name: string;
  department?: string;
  assignedStudentIds?: string[];
  studentRefId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

const JWT_SECRET = process.env.JWT_SECRET || "edushield_research_jwt_secret_key_2026";

export const generateToken = (user: AuthenticatedUser): string => {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      assignedStudentIds: user.assignedStudentIds || [],
      studentRefId: user.studentRefId
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired access token" });
  }
};

export const requireRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Role '${req.user.role}' lacks permission for this resource.`
      });
      return;
    }

    next();
  };
};

