import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`EduShield Backend running on port ${PORT}`);
      console.log(`API documentation available via /api/health`);
    });
  } catch (error) {
    console.error("Failed to start EduShield backend server:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;

