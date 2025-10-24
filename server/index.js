import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.json({ message: "Backend functionality/sanity test" });
});

app.post("/api/login", async (req, res) => {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  const { username, password } = req.body;
  try{
      const result = await pool.query("SELECT * FROM users.students WHERE username = $1 AND password = $2",[username, password]);
    if (result.rows.length > 0) {
      return res.json({ success: true, message: "Login successful!" });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
