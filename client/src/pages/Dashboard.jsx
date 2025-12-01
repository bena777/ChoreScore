import "./Dashboard.css";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCorners,
  useSensors,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Column } from "../components/Column.jsx";
import { TaskFormModal } from "../components/TaskFormModal/TaskFormModal.jsx";
import { api } from "../api";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [userName, setUserName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 140, distance: 5 },
    })
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const loggedInUsername = localStorage.getItem("loggedInUser");
        if (!loggedInUsername) {
          setError("No logged-in user found");
          setLoading(false);
          return;
        }

        // Fetch only users in the same roommate group as the logged-in user
        const { users } = await api(`/api/users?username=${encodeURIComponent(loggedInUsername)}`);
        setAllUsers(users || []);

        // Try to find the current user in the returned group
        const currentUser = (users || []).find(
          (u) => (u.username || u.name || "").toLowerCase() === loggedInUsername.toLowerCase()
        );
        if (!currentUser) {
          // If current user isn't returned (not in a group), show no tasks
          setUserName(loggedInUsername);
          setTasks([]);
          setLoading(false);
          return;
        }

        setUserName(currentUser.first_name || currentUser.name || currentUser.username || "");

        // Fetch tasks only for the logged-in user
        const { tasks } = await api(`/api/tasks/${currentUser.id}`);
        setTasks(tasks || []);
      } catch (e) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTaskPos = (id) => tasks.findIndex((t) => t.id === id);

  const handleDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setTasks((prev) => {
      const from = getTaskPos(active.id);
      const to = getTaskPos(over.id);
      return arrayMove(prev, from, to);
    });
  };

  const openAddModal = () => {
    setCurrentTask(null);
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setCurrentTask(t);
    setShowModal(true);
  };

  const handleTaskSubmit = async (t) => {
    try {
      if (t.id) {
        const { task } = await api(`/api/tasks/${t.id}`, {
          method: "PUT",
          body: t,
        });
        setTasks((prev) => prev.map((x) => (x.id === task.id ? task : x)));
      } else {
        // Get logged-in username from localStorage
        const loggedInUsername = localStorage.getItem("loggedInUser");
        if (!loggedInUsername) throw new Error("No logged-in user");
        // Find the user in allUsers by username field (case-insensitive)
        const user = allUsers.find(u => (u.username || u.name || "").toLowerCase() === loggedInUsername.toLowerCase());
        if (!user) throw new Error("User not found for task assignment");
        const payload = {
          title: t.title,
          assignees: t.assignees || [],
          score: t.score ?? 1,
          dueDate: t.dueDate || "",
          // set student_id to the assigned user's id (first assignee) so DB assignment is correct
          student_id: (t.assignees && t.assignees[0] && t.assignees[0].id) || null,
        };
        const { task } = await api("/api/tasks", {
          method: "POST",
          body: payload,
        });
        setTasks((prev) => [...prev, task]);
      }
    } catch (e) {
      setError(e.message || "Request failed");
    }
  };

  const handleTaskDelete = async (id) => {
    try {
      await api(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message || "Request failed");
    }
  };

  const board = useMemo(() => tasks, [tasks]);

  return (
    <div className="App">
      <header className="dashboard-header">ChoreScore</header>
      <h2>Welcome, {userName}</h2>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <DndContext
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
          sensors={sensors}
        >
          <Column
            tasks={board}
            openAddModal={openAddModal}
            openEditModal={openEditModal}
            onDeleteTask={handleTaskDelete}
            currentUser={allUsers.find(u => (u.username || u.name || "").toLowerCase() === (localStorage.getItem("loggedInUser") || "").toLowerCase())}
          />
          <TaskFormModal
            showModal={showModal}
            onClose={() => setShowModal(false)}
            task={currentTask}
            allUsers={allUsers}
            onSubmit={handleTaskSubmit}
          />
        </DndContext>
      )}
    </div>
  );
}
