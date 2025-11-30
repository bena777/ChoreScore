import express from "express";
import tasksRouter from "./routes/tasks.js";
import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcrypt";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});
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


app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users.students WHERE username = $1",[username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    return res.json({ success: true, message: "Login successful!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/register",async (req,res) =>{
  const { username, password, first_name, last_name } = req.body;
  if(!username || !password || !first_name || !last_name){
    return res.status(400).json({ message: "Missing a field" });
  }
  try{
    const result = await pool.query("SELECT * FROM users.students WHERE username = $1 ",[username])
    if(result.rows.length > 0){
      return res.status(400).json({ message: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    await pool.query(
      "INSERT INTO users.students (first_name,last_name,username,password) VALUES ($1,$2,$3,$4)", [first_name,last_name,username,hashedPassword]
    )
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, first_name, last_name, username, roomate_group, is_ra FROM users.students");
    const users = result.rows.map(user => ({
      id: user.id,
      username: user.username,
      name: user.username, // For compatibility with frontend
      first_name: user.first_name,
      last_name: user.last_name,
      roomate_group: user.roomate_group,
      is_ra: user.is_ra,
      avatar: null // No avatar in database, will be null
    }));
    res.json({ users });
    // Create a roommate group: generate a unique integer ID and assign to user
    app.post("/api/groups", async (req, res) => {
      const { username, name } = req.body || {};
      if (!username) return res.status(400).json({ message: "username required" });
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
        if (!groupId) return res.status(500).json({ message: "failed to generate group id" });
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
    app.post("/api/groups/join", async (req, res) => {
      const { username, group_id } = req.body || {};
      if (!username || !group_id) return res.status(400).json({ message: "username and group_id required" });
      try {
        const exists = await pool.query(
          "SELECT 1 FROM users.students WHERE roomate_group = $1 LIMIT 1",
          [Number(group_id)]
        );
        if (exists.rowCount === 0) return res.status(404).json({ message: "group not found" });
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
