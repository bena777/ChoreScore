import { Router } from "express";

const router = Router();

let tasks = [
  { id: 1, title: "Task 1", score: 1, dueDate: "2025-11-01", assignees: [], recurrence: "none", completed: false, },
  { id: 2, title: "Task 2", score: 2, dueDate: "2025-12-01", assignees:  [], recurrence: "none", completed: false, },
];

const getNextDueDate = (currDueDate, recurrence) => {
  if (!recurrence || recurrence === "none") return currDueDate;

  const base = currDueDate || new Date().toISOString().slice(0, 10);
  const date = new Date(base);

  if (Number.isNaN(date.getTime())) return currDueDate;
  switch (recurrence) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    default:
      return currDueDate;
  }

  return date.toISOString().slice(0, 10);
};

router.get("/", (req, res) => {
  res.json({ tasks });
});

router.post("/", (req, res) => {
  const { title, score = 1, dueDate = "", assignees = [], recurrence = "none", } = req.body || {};
  if (!title) return res.status(400).json({ message: "title required" });
  const id = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const task = { id, title, score, dueDate, assignees, recurrence, completed: false, };
  tasks.push(task);
  res.status(201).json({ task });
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ message: "not found" });
  const patch = req.body || {};
  tasks[idx] = { ...tasks[idx], ...patch, id };
  res.json({ task: tasks[idx] });
});

router.post("/:id/complete", (req, res) => {
  const id = Number(req.params.id);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return res.status(404).json({ message: "not found" });

  const task = tasks[idx];

  if (task.recurrence === "daily" || task.recurrence === "weekly" || task.recurrence === "monthly") {
    const nextDueDate = getNextDueDate(task.dueDate, task.recurrence);
    tasks[idx] = { ...task, dueDate: nextDueDate, completed: false };
  } else {
    tasks[idx] = { ...task, completed: true };
  }

  res.json({ task: tasks[idx] });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const next = tasks.filter((t) => t.id !== id);
  if (next.length === tasks.length)
    return res.status(404).json({ message: "not found" });
  tasks = next;
  res.status(204).end();
});

export default router;
