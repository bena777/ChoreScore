import { Router } from "express";

const router = Router();

let tasks = [
  { id: 1, title: "Take out trash", score: 1, dueDate: "2025-12-01" },
  { id: 2, title: "Sweep kitchen", score: 2, dueDate: "2025-11-05" },
];

router.get("/", (req, res) => {
  res.json({ tasks });
});

router.post("/", (req, res) => {
  const { title, score = 1, dueDate = "" } = req.body || {};
  if (!title) return res.status(400).json({ message: "title required" });
  const id = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const task = { id, title, score, dueDate };
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

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const next = tasks.filter((t) => t.id !== id);
  if (next.length === tasks.length)
    return res.status(404).json({ message: "not found" });
  tasks = next;
  res.status(204).end();
});

export default router;
