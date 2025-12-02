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
import { Leaderboard } from "../components/Leaderboard/Leaderboard.jsx";
import { TaskFormModal } from "../components/TaskFormModal/TaskFormModal.jsx";
import { api } from "../api";

export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allGroupTasks, setAllGroupTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 140, distance: 5 },
    })
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // First, fetch all users to get the logged-in user's ID
        const { users } = await api("/api/users");
        setAllUsers(users);
        
        // Get logged-in username and find their ID
        const loggedInUsername = localStorage.getItem("loggedInUser");
        if (!loggedInUsername) {
          setError("No logged-in user found");
          setLoading(false);
          return;
        }
        
        const user = users.find(u => (u.username || u.name || "").toLowerCase() === loggedInUsername.toLowerCase());
        if (!user) {
          setError("User not found");
          setLoading(false);
          return;
        }
        
        setCurrentUser(user);
        setUserName(user.first_name || user.name || user.username || "");
        
        // Fetch tasks only for the logged-in user
        const { tasks } = await api(`/api/tasks/${user.id}`);
        setTasks(tasks);
        
        // Fetch all tasks to calculate group leaderboard scores
        const { tasks: allTasks } = await api("/api/tasks");
        setAllGroupTasks(allTasks);
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
        setAllGroupTasks((prev) => prev.map((x) => (x.id === task.id ? task : x)));
      } else {
        const payload = {
          title: t.title,
          assignee: t.assignee || null,
          score: t.score ?? 1,
          dueDate: t.dueDate || "",
        };
        const { task } = await api("/api/tasks", {
          method: "POST",
          body: payload,
        });
        setTasks((prev) => [...prev, task]);
        setAllGroupTasks((prev) => [...prev, task]);
      }
    } catch (e) {
      setError(e.message || "Request failed");
    }
  };

  const handleTaskDelete = async (id) => {
    try {
      await api(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setAllGroupTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message || "Request failed");
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (task) {
        const { task: updated } = await api(`/api/tasks/${id}`, {
          method: "PUT",
          body: { ...task, is_completed: !task.is_completed },
        });
        setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
        setAllGroupTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (e) {
      setError(e.message || "Request failed");
    }
  };

  const board = useMemo(() => tasks, [tasks]);

  return (
    <div className="App">
      <h2>Welcome, {userName}</h2>
      {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: "flex", gap: 16 }}>
          {currentUser && (
            <Leaderboard 
              users={allUsers} 
              tasks={allGroupTasks}
              currentUser={currentUser}
            />
          )}
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
              onCompleteTask={handleCompleteTask}
              currentUser={currentUser}
            />
            <TaskFormModal
              showModal={showModal}
              onClose={() => setShowModal(false)}
              task={currentTask}
              allUsers={allUsers}
              onSubmit={handleTaskSubmit}
              currentUserGroupId={currentUser?.roomate_group}
            />
          </DndContext>
        </div>
      )}
    </div>
  );
}
