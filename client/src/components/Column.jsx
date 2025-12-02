import "./column.css";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { api } from "../api";
import { FaPlus } from "react-icons/fa";
import { Task } from "./Task/Task.jsx";
import "./Task/Task.css";

export const Column = ({
  tasks,
  openAddModal,
  openEditModal,
  onDeleteTask,
  currentUser,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [generatedGroupId, setGeneratedGroupId] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");

  const createGroup = async () => {
    try {
      const username = localStorage.getItem("loggedInUser");
      const { group_id } = await api("/api/groups", {
        method: "POST",
        body: { username, name: groupName },
      });
      setGeneratedGroupId(String(group_id));
    } catch (e) {}
  };

  const notInGroup = !currentUser || (currentUser.roomate_group ?? -1) === -1;

  if (notInGroup) {
    return (
      <div className="column" style={{ padding: 16 }}>
        <h1 className="column-title">ChoreScore</h1>
        <div style={{ marginTop: 12, fontSize: 16 }}>
          It seems like you're not a part of a group yet!
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            style={{ background: "#2e7d32", color: "white", padding: "8px 12px", borderRadius: 6 }}
            onClick={() => {
              setGroupName("");
              setGeneratedGroupId("");
              setShowCreateModal(true);
              createGroup();
            }}
          >
            Create Group
          </button>
          <button
            style={{ background: "#1565c0", color: "white", padding: "8px 12px", borderRadius: 6 }}
            onClick={() => setShowJoinModal(true)}
          >
            Join Group
          </button>
        </div>

        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                ×
              </button>
              <h2>Create Group</h2>
              <label>Group Name:</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter a group name"
              />
              <div style={{ marginTop: 12 }}>
                Your unique group ID:
                <div style={{ fontWeight: 600, marginTop: 6 }}>{generatedGroupId}</div>
              </div>
              <div style={{ marginTop: 16 }}>
                <button
                  style={{ background: "#2e7d32", color: "white", padding: "8px 12px", borderRadius: 6 }}
                  onClick={() => {
                    setShowCreateModal(false);
                    window.location.reload();
                  }}
                >
                  Save Group
                </button>
              </div>
            </div>
          </div>
        )}

        {showJoinModal && (
          <div className="modal-overlay">
            <div className="modal">
              <button className="modal-close" onClick={() => setShowJoinModal(false)}>
                ×
              </button>
              <h2>Join Group</h2>
              <label>Paste Group ID:</label>
              <input
                type="text"
                value={joinGroupId}
                onChange={(e) => setJoinGroupId(e.target.value)}
                placeholder="Enter the group ID"
              />
              <div style={{ marginTop: 16 }}>
                <button
                  style={{ background: "#1565c0", color: "white", padding: "8px 12px", borderRadius: 6 }}
                  onClick={async () => {
                    try {
                      const username = localStorage.getItem("loggedInUser");
                      await api("/api/groups/join", {
                        method: "POST",
                        body: { username, group_id: Number(joinGroupId) },
                      });
                    } catch (e) {}
                    setShowJoinModal(false);
                    window.location.reload();
                  }}
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="column">
      <h1 className="column-title">[Group_Name] Choreboard</h1>
      <div className="column-header">
        <div className="task-buttons">
          <button className="add-btn" title="Add Task" onClick={openAddModal}>
            <FaPlus size={18} color="white" />
          </button>
        </div>
      </div>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.map((task) => (
          <Task
            id={task.id}
            title={task.title}
            key={task.id}
            assignee={task.assignee || null}
            score={task.score}
            dueDate={task.dueDate}
            openEditModal={() => openEditModal(task)}
            onDeleteTask={() => onDeleteTask(task.id)}
          />
        ))}
      </SortableContext>
    </div>
  );
};
