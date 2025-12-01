import { Router } from "express";
import pkg from "pg";
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;
const router = Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

function mapTask(row) {
  if (!row) return null;
  return {
    id: row.task_id,
    title: row.task_name,
    description: row.task_description,
    score: row.task_rating,
    dueDate: row.task_due_date,
    student_id: row.student_id,
    is_completed: row.is_completed,
    datetime_created: row.datetime_created,
    assignees: [] // Will be populated later if needed
  };
}

router.get("/", async (req, res) => { // gets all tasks in database
  try {
    const { rows } = await pool.query("SELECT * FROM users.tasks");
    res.json({ tasks: rows.map(mapTask) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.get("/:id", async (req, res) => { // gets all tasks in database with specific users.tasks.student_id
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query("SELECT * FROM users.tasks WHERE student_id = $1", [id]);
    res.json({ tasks: rows.map(mapTask) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.post("/", async (req, res) => { // inserts a new task into the database
  const { student_id, title, description, score = 1, dueDate = "" } = req.body || {};
  if (!title) return res.status(400).json({ message: "title required" });
  try{
    const result = await pool.query(`INSERT INTO users.tasks (student_id,datetime_created,task_name,task_description,task_rating,task_due_date)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [student_id,new Date(),title,description,score,dueDate]
    )
    const created = mapTask(result.rows[0]);
    if (req.body && req.body.assignees) created.assignees = req.body.assignees;
    res.status(201).json({ task: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.put("/:id", async (req, res) => { // updates a task with a specific users.tasks.task_id
  const id = Number(req.params.id);
  const { assigned_student_id, title, description, score, dueDate, is_completed } = req.body || {};
  try {
    const result = await pool.query(
      `UPDATE users.tasks
       SET student_id = COALESCE($1, student_id),
           task_name = COALESCE($2, task_name),
           task_description = COALESCE($3, task_description),
           task_rating = COALESCE($4, task_rating),
           task_due_date = COALESCE($5, task_due_date),
           is_completed = COALESCE($6, is_completed)
       WHERE task_id = $7
       RETURNING *`,
      [assigned_student_id, title, description, score, dueDate, is_completed, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "not found" });
    const updated = mapTask(result.rows[0]);
    if (req.body && req.body.assignees) updated.assignees = req.body.assignees;
    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.delete("/:id", async (req, res) => { // deletes a task with a specific users.tasks.task_id
  const id = Number(req.params.id);
  try{
    const result = await pool.query("DELETE FROM users.tasks WHERE task_id = $1 RETURNING task_id",[id]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "not found" });
    res.status(204).end();
  } catch (err){
    console.error(err);
    res.status(500).json({ message: "database error"});
  }
});

export default router;
