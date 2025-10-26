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

  const allUsers = [
    {
      id: 1,
      name: "Kevin",
      avatar:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pngmart.com%2Ffiles%2F12%2FKevin-Minion-PNG-Photos.png&f=1&nofb=1&ipt=b350922f483c3be3ba346649d35c30220349cea7b003867d54c27b30e06af460",
    },
    {
      id: 2,
      name: "Bob",
      avatar:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.clipartkey.com%2Fmpngs%2Fm%2F162-1626081_bob-minion-transparent-free-png-minion-bob-transparent.png&f=1&nofb=1&ipt=f5e2551cec55582f0c012e4f1b86a3104bfd7353e3b6c74599a3e88d9edcda76",
    },
    {
      id: 3,
      name: "Stuart",
      avatar:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftoppng.com%2Fuploads%2Fpreview%2Fminions-stuart-11563195642qdxspmscfv.png&f=1&nofb=1&ipt=19780114a1355edde59e21910d4da4ef7fc0fc59bb131058d5944b3dbca579aa",
    },
    {
      id: 4,
      name: "Gru",
      avatar:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F09%2Fca%2F8e%2F09ca8e05aec1fd90f64980613fcf49c5.jpg&f=1&nofb=1&ipt=bc9b7e76c64fec4d06796cbe338b600ac670d530a45eb10f25da09902e350cb0",
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 140, distance: 5 },
    })
  );

  useEffect(() => {
    setLoading(true);
    api("/api/tasks")
      .then(({ tasks }) => setTasks(tasks))
      .catch((e) => setError(e.message || "Failed to load tasks"))
      .finally(() => setLoading(false));
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
        const payload = {
          title: t.title,
          assignees: t.assignees || [],
          score: t.score ?? 1,
          dueDate: t.dueDate || "",
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
