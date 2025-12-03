import { Router } from "express";
import pkg from "pg";
import dotenv from "dotenv";
import { requireAuth } from "../authMiddleware.js";

dotenv.config();
const { Pool } = pkg;
const router = Router();

router.use(requireAuth);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
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
    assignee_id: row.student_id || null,
    assignee: null, // Will be populated if needed
    assignees: [],
  };
}

router.get("/", async (req, res) => {
  // gets all tasks in database
  const isRa = req.user && req.user.is_ra;
  if (!isRa) {
    return res.status(403).json({ message: "forbidden" });
  }

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

    const tasks = rows.map((row) => {
      const task = mapTask(row);
      if (row.student_id) {
        const assignee = {
          id: row.student_id,
          name: row.assignee_username,
          username: row.assignee_username,
          first_name: row.assignee_first_name,
          last_name: row.assignee_last_name,
          avatar: row.assignee_avatar,
        };
        task.assignee = assignee;
        task.assignees = [assignee];
        task.assignee_id = row.student_id;
      }
      return task;
    });

    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.get("/:id", async (req, res) => {
  // gets all tasks for users in the same group as the specified user
  const requestedId = Number(req.params.id);
  const userId = req.user && req.user.id;
  const isRa = req.user && req.user.is_ra;

  if (!Number.isInteger(requestedId)) {
    return res.status(400).json({ message: "invalid id" });
  }

  if (!isRa && userId !== requestedId) {
    return res.status(403).json({ message: "forbidden" });
  }

  try {
    const userResult = await pool.query(
      "SELECT roomate_group FROM users.students WHERE id = $1",
      [requestedId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userGroup = userResult.rows[0].roomate_group;
    let rows;
    // If user is not in a group, return only their tasks
    if (!userGroup || userGroup === -1) {
      const result = await pool.query(
        `
        SELECT 
          t.*,
          s.first_name as assignee_first_name,
          s.last_name as assignee_last_name,
          s.username as assignee_username,
          s.pfp_url as assignee_avatar
        FROM users.tasks t
        LEFT JOIN users.students s ON t.student_id = s.id
        WHERE t.student_id = $1
      `,
        [requestedId]
      );
      rows = result.rows;
    } else {
      const result = await pool.query(
        // Get all tasks for users in the same group
        `
        SELECT 
          t.*,
          s.first_name as assignee_first_name,
          s.last_name as assignee_last_name,
          s.username as assignee_username,
          s.pfp_url as assignee_avatar
        FROM users.tasks t
        LEFT JOIN users.students s ON t.student_id = s.id
        WHERE s.roomate_group = $1
      `,
        [userGroup]
      );
      rows = result.rows;
    }

    const tasks = rows.map((row) => {
      const task = mapTask(row);
      if (row.student_id) {
        const assignee = {
          id: row.student_id,
          name: row.assignee_username,
          username: row.assignee_username,
          first_name: row.assignee_first_name,
          last_name: row.assignee_last_name,
          avatar: row.assignee_avatar,
        };
        task.assignee = assignee;
        task.assignees = [assignee];
        task.assignee_id = row.student_id;
      }
      return task;
    });

    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.post("/", async (req, res) => {
  // inserts a new task into the database
  const {
    title,
    description,
    score = 1,
    dueDate = "",
    assignee,
    assignees,
    student_id,
  } = req.body || {};
  const user = req.user || {};
  const userId = user.id;

  if (!userId) {
    return res.status(401).json({ message: "not authenticated" });
  }
  if (!title) {
    return res.status(400).json({ message: "title required" });
  }

  let assigneeUser = assignee || null;
  if (!assigneeUser && Array.isArray(assignees) && assignees.length > 0) {
    assigneeUser = assignees[0];
  }

  let assigneeId =
    (assigneeUser && assigneeUser.id && Number(assigneeUser.id)) || null;

  if (!assigneeId && student_id) {
    assigneeId = Number(student_id);
  }

  let normalizedDueDate = dueDate;
  if (normalizedDueDate === "" || normalizedDueDate === undefined) {
    normalizedDueDate = null;
  }

  try {
    const result = await pool.query(
      `INSERT INTO users.tasks (student_id, datetime_created, task_name, task_description, task_rating, task_due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [assigneeId, new Date(), title, description, score, normalizedDueDate]
    );
    const row = result.rows[0];
    const created = mapTask(row);

    if (assigneeUser) {
      created.assignee = assigneeUser;
      created.assignee_id = assigneeId;
      if (Array.isArray(assignees) && assignees.length > 0) {
        created.assignees = assignees;
      } else {
        created.assignees = [assigneeUser];
      }
    } else {
      created.assignee = null;
      created.assignee_id = assigneeId;
      created.assignees = [];
    }

    res.status(201).json({ task: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.put("/:id", async (req, res) => {
  // updates a task with a specific users.tasks.task_id
  const id = Number(req.params.id);
  const {
    title,
    description,
    score,
    dueDate,
    is_completed,
    assignee,
    assignees,
  } = req.body || {};
  const user = req.user || {};
  const userId = user.id;
  const isRa = !!user.is_ra;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "invalid id" });
  }

  try {
    const existing = await pool.query(
      "SELECT student_id FROM users.tasks WHERE task_id = $1",
      [id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "not found" });
    }

    const taskOwnerId = existing.rows[0].student_id;
    if (!isRa && taskOwnerId && taskOwnerId !== userId) {
      return res.status(403).json({ message: "forbidden" });
    }

    let assigneeUser = assignee || null;
    if (!assigneeUser && Array.isArray(assignees) && assignees.length > 0) {
      assigneeUser = assignees[0];
    }

    const assigneeId =
      (assigneeUser && assigneeUser.id && Number(assigneeUser.id)) || null;

    let normalizedDueDate = dueDate;
    if (normalizedDueDate === "" || normalizedDueDate === undefined) {
      normalizedDueDate = null;
    }

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
      [
        title,
        description,
        score,
        normalizedDueDate,
        is_completed,
        assigneeId,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "not found" });
    }

    const row = result.rows[0];
    const updated = mapTask(row);

    if (assigneeUser) {
      updated.assignee = assigneeUser;
      updated.assignee_id = assigneeId;
      if (Array.isArray(assignees) && assignees.length > 0) {
        updated.assignees = assignees;
      } else {
        updated.assignees = [assigneeUser];
      }
    } else {
      updated.assignee = null;
      updated.assignee_id = row.student_id || null;
      updated.assignees = [];
    }

    res.json({ task: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

router.delete("/:id", async (req, res) => {
  // deletes a task with a specific users.tasks.task_id
  const id = Number(req.params.id);
  const user = req.user || {};
  const userId = user.id;
  const isRa = !!user.is_ra;

  if (!Number.isInteger(id)) {
    return res.status(400).json({ message: "invalid id" });
  }

  try {
    const existing = await pool.query(
      "SELECT student_id FROM users.tasks WHERE task_id = $1",
      [id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ message: "not found" });
    }

    const taskOwnerId = existing.rows[0].student_id;
    if (!isRa && taskOwnerId !== userId) {
      return res.status(403).json({ message: "forbidden" });
    }

    await pool.query("DELETE FROM users.tasks WHERE task_id = $1", [id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "database error" });
  }
});

export default router;
