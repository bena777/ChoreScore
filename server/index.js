import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcrypt";
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


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
