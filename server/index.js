import express from "express";
import tasksRouter from "./routes/tasks.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import {
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
} from "./authMiddleware.js";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.json({ message: "API is up" });
});

try {
  const mod = await import("./routes/auth.js");
  const authRouter = mod.default ?? mod;
  if (authRouter) app.use("/api", authRouter);
} catch {}

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT * FROM users.students WHERE username = $1",
      [username]
    );
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    setAuthCookie(res, {
      id: user.id,
      username: user.username,
      is_ra: user.is_ra,
    });
    return res.json({
      success: true,
      message: "Login successful!",
      username: username,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/logout", (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

app.post("/api/register", async (req, res) => {
  const { username, password, first_name, last_name } = req.body;
  if (!username || !password || !first_name || !last_name) {
    return res.status(400).json({ message: "Missing a field" });
  }
  try {
    const result = await pool.query(
      "SELECT * FROM users.students WHERE username = $1 ",
      [username]
    );
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate random hex color for avatar
    const randomColor = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");
    // Generate avatar URL with the assigned color
    const fullName = `${first_name} ${last_name}`.trim();
    const avatarUrl = `https://www.s11-avatar.com/api/avatar?name=${encodeURIComponent(
      fullName
    )}&size=128&background=${randomColor}&color=ffffff&rounded=true&bold=true&length=2&format=png`;
    await pool.query(
      "INSERT INTO users.students (first_name,last_name,username,password,pfp_url) VALUES ($1,$2,$3,$4,$5)",
      [first_name, last_name, username, hashedPassword, avatarUrl]
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/users", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, last_name, username, roomate_group, is_ra, pfp_url FROM users.students"
    );
    const users = result.rows.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      roomate_group: user.roomate_group,
      is_ra: user.is_ra,
      avatar: user.pfp_url,
    }));
    res.json({ users });
    // Create a roommate group: generate a unique integer ID and assign to user
    app.post("/api/groups", requireAuth, async (req, res) => {
      const { name } = req.body || {};
      const username = req.user && req.user.username;
      if (!username)
        return res.status(401).json({ message: "not authenticated" });
      try {
        // Generate a unique integer group id
        let groupId;
        const min = 100000;
        const max = 999999;
        for (let i = 0; i < 50; i++) {
          const candidate = Math.floor(Math.random() * (max - min + 1)) + min;
          const exists = await pool.query(
            "SELECT 1 FROM users.students WHERE roomate_group = $1 LIMIT 1",
            [candidate]
          );
          if (exists.rowCount === 0) {
            groupId = candidate;
            break;
          }
        }
        if (!groupId)
          return res
            .status(500)
            .json({ message: "failed to generate group id" });
        // Assign to the user
        await pool.query(
          "UPDATE users.students SET roomate_group = $1 WHERE username = $2",
          [groupId, username]
        );
        // Optionally: could store group name elsewhere if a groups table exists
        res.status(201).json({ group_id: groupId });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "database error" });
      }
    });

    // Join a roommate group: set user's roomate_group to provided integer if it exists
    app.post("/api/groups/join", requireAuth, async (req, res) => {
      const { group_id } = req.body || {};
      const username = req.user && req.user.username;
      if (!username)
        return res.status(401).json({ message: "not authenticated" });
      if (!group_id)
        return res.status(400).json({ message: "group_id required" });
      try {
        const exists = await pool.query(
          "SELECT 1 FROM users.students WHERE roomate_group = $1 LIMIT 1",
          [Number(group_id)]
        );
        if (exists.rowCount === 0)
          return res.status(404).json({ message: "group not found" });
        await pool.query(
          "UPDATE users.students SET roomate_group = $1 WHERE username = $2",
          [Number(group_id), username]
        );
        res.json({ success: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "database error" });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

app.use("/api/tasks", tasksRouter);

// Update user profile
app.put("/api/users/:username", requireAuth, async (req, res) => {
  const { username } = req.params;
  const { first_name, last_name, avatar } = req.body || {};

  if (req.user.username !== username && !req.user.is_ra) {
    return res.status(403).json({ message: "forbidden" });
  }

  try {
    const result = await pool.query(
      "UPDATE users.students SET first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name), pfp_url = COALESCE($3, pfp_url) WHERE username = $4 RETURNING id, first_name, last_name, username, roomate_group, is_ra, pfp_url",
      [first_name, last_name, avatar, username]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = {
      id: result.rows[0].id,
      username: result.rows[0].username,
      name: result.rows[0].username,
      first_name: result.rows[0].first_name,
      last_name: result.rows[0].last_name,
      roomate_group: result.rows[0].roomate_group,
      is_ra: result.rows[0].is_ra,
      avatar: result.rows[0].pfp_url,
    };

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

// Delete user account
app.delete("/api/users/:username", requireAuth, async (req, res) => {
  const { username } = req.params;

  if (req.user.username !== username && !req.user.is_ra) {
    return res.status(403).json({ message: "forbidden" });
  }

  // Delete related data first if needed (e.g., tasks). Keeping it simple here.
  try {
    await pool.query(
      "DELETE FROM users.tasks WHERE student_id IN (SELECT id FROM users.students WHERE username = $1)",
      [username]
    );
    const result = await pool.query(
      "DELETE FROM users.students WHERE username = $1 RETURNING id",
      [username]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
