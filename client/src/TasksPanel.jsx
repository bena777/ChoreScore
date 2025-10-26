import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

export default function TasksPanel() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [score, setScore] = useState(1);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sorted = useMemo(() => {
    return [...tasks].sort(
      (a, b) => b.score - a.score || a.title.localeCompare(b.title)
    );
  }, [tasks]);

  useEffect(() => {
    setLoading(true);
    api("/api/tasks")
      .then(({ tasks }) => setTasks(tasks))
      .catch((e) => setError(e.message || "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setTitle("");
    setScore(1);
    setEditing(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      if (editing) {
        const { task } = await api(`/api/tasks/${editing.id}`, {
          method: "PUT",
          body: { title, score: Number(score) },
        });
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      } else {
        const { task } = await api("/api/tasks", {
          method: "POST",
          body: { title, score: Number(score) },
        });
        setTasks((prev) => [...prev, task]);
      }
      resetForm();
    } catch (e) {
      setError(e.message || "Request failed");
    }
  };

  const remove = async (id) => {
    try {
      await api(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message || "Request failed");
    }
  };

  const startEdit = (t) => {
    setEditing(t);
    setTitle(t.title);
    setScore(t.score);
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Tasks</h3>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form
        onSubmit={submit}
        style={{ display: "grid", gap: 8, maxWidth: 420 }}
      >
        <input
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="number"
          min="1"
          max="10"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">{editing ? "Save" : "Add"}</button>
          {editing && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <ul
            style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}
          >
            {sorted.map((t) => (
              <li
                key={t.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{t.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>
                    Score: {t.score}
                  </div>
                </div>
                <button onClick={() => startEdit(t)}>Edit</button>
                <button onClick={() => remove(t.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
