//temp file for login without database
//interstellar
import { Router } from "express";
import crypto from "node:crypto";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: "missing credentials" });
  const user = { id: 1, username };
  const token = crypto.randomBytes(16).toString("hex");
  res.json({ user, token });
});

router.post("/register", (req, res) => {
  const { username, password, first_name, last_name } = req.body || {};
  if (!username || !password || !first_name || !last_name)
    return res.status(400).json({ message: "missing fields" });
  const user = { id: 1, username, first_name, last_name };
  res.status(201).json({ user });
});

export default router;
