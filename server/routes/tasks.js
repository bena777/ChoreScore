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
    assignee_id: row.student_id,
    is_completed: row.is_completed,
    datetime_created: row.datetime_created,
    assignee: null // Will be populated if needed
  };
}

router.get("/", async (req, res) => { // gets all tasks in database
  try {
    const { rows } = await pool.query(`
      SELECT 
        t.*,
        s.first_name as assignee_first_name,
        s.last_name as assignee_last_name,
        s.username as assignee_username,
        s.pfp_url as assignee_avatar
      FROM users.tasks t
      LEFT JOIN users.students s ON t.student_id = s.id
    `);
    
    const tasks = rows.map(row => {
      const task = mapTask(row);
      if (row.student_id) {
        task.assignee = {
          id: row.student_id,
          name: row.assignee_username,
          username: row.assignee_username,
          first_name: row.assignee_first_name,
          last_name: row.assignee_last_name,
          avatar: row.assignee_avatar
        };
      }
      return task;
    });
    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.get("/:id", async (req, res) => { // gets all tasks assigned to a specific user
  const id = Number(req.params.id);
  try {
    const { rows } = await pool.query(`
      SELECT 
        t.*,
        s.first_name as assignee_first_name,
        s.last_name as assignee_last_name,
        s.username as assignee_username,
        s.pfp_url as assignee_avatar
      FROM users.tasks t
      LEFT JOIN users.students s ON t.student_id = s.id
      WHERE t.student_id = $1
    `, [id]);
    
    const tasks = rows.map(row => {
      const task = mapTask(row);
      if (row.student_id) {
        task.assignee = {
          id: row.student_id,
          name: row.assignee_username,
          username: row.assignee_username,
          first_name: row.assignee_first_name,
          last_name: row.assignee_last_name,
          avatar: row.assignee_avatar
        };
      }
      return task;
    });
    
    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.post("/", async (req, res) => { // inserts a new task into the database
  const { title, description, score = 1, dueDate = "", assignee } = req.body || {};
  if (!title) return res.status(400).json({ message: "title required" });
  try{
    const assignee_id = assignee?.id || null;
    const result = await pool.query(`INSERT INTO users.tasks (student_id,datetime_created,task_name,task_description,task_rating,task_due_date)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [assignee_id, new Date(),title,description,score,dueDate]
    )
    const created = mapTask(result.rows[0]);
    if (assignee) created.assignee = assignee;
    res.status(201).json({ task: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.put("/:id", async (req, res) => { // updates a task with a specific users.tasks.task_id
  const id = Number(req.params.id);
  const { title, description, score, dueDate, is_completed, assignee } = req.body || {};
  try {
    const assignee_id = assignee?.id || null;
    const result = await pool.query(
      `UPDATE users.tasks
       SET task_name = COALESCE($1, task_name),
           task_description = COALESCE($2, task_description),
           task_rating = COALESCE($3, task_rating),
           task_due_date = COALESCE($4, task_due_date),
           is_completed = COALESCE($5, is_completed),
           student_id = COALESCE($6, student_id)
       WHERE task_id = $7
       RETURNING *`,
      [title, description, score, dueDate, is_completed, assignee_id, id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: "not found" });
    const updated = mapTask(result.rows[0]);
    if (assignee) updated.assignee = assignee;
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
