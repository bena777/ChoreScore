import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tasksRouter from "./routes/tasks.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "API is up" });
});

try {
  const mod = await import("./routes/auth.js");
  const authRouter = mod.default ?? mod;
  if (authRouter) app.use("/api", authRouter);
} catch {}

app.use("/api/tasks", tasksRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
