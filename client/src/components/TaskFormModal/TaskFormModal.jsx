import { useState, useEffect } from "react";
import "./TaskFormModal.css";

export const TaskFormModal = ({
  showModal,
  onClose,
  task,
  allUsers,
  onSubmit,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [selectedAssignees, setSelectedAssignees] = useState(
    task?.assignees || []
  );
  const [score, setScore] = useState(task?.score || 3);
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [recurrence, setRecurrence] = useState(task?.recurrence || "none");

  useEffect(() => {
    setTitle(task?.title || "");
    setSelectedAssignees(task?.assignees || []);
    setScore(task?.score || 3);
    setDueDate(task?.dueDate || "");
    setRecurrence(task?.recurrence || "none");
  }, [task]);

  const toggleAssignee = (user) => {
    if (selectedAssignees.find((a) => a.id === user.id)) {
      setSelectedAssignees(selectedAssignees.filter((a) => a.id !== user.id));
    } else {
      setSelectedAssignees([...selectedAssignees, user]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...task, title, assignees: selectedAssignees, score, dueDate, recurrence, });
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>{task ? "Edit Task" : "Add Task"}</h2>
        <form onSubmit={handleSubmit}>
          <label>Task Name:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label>Assignees:</label>
          <div className="assignee-selection">
            {allUsers.map((user) => (
              <img
                key={user.id}
                src={user.avatar}
                alt={user.name}
                title={user.name}
                className={
                  selectedAssignees.find((a) => a.id === user.id)
                    ? "selected"
                    : ""
                }
                onClick={() => toggleAssignee(user)}
              />
            ))}
          </div>
          <label>Score:</label>
          <input
            type="range"
            min="1"
            max="5"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
          />
          <span>{score}</span>
          <label>Due Date:</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <label>Recurrence:</label>
          <div className="recurrence-options">
            <label className="recurrence-option">
              <input
                type="radio"
                value="none"
                checked={recurrence === "none"}
                onChange={(e) => setRecurrence(e.target.value)}
              />
              None
            </label>

            <label className="recurrence-option">
              <input
                type="radio"
                value="daily"
                checked={recurrence === "daily"}
                onChange={(e) => setRecurrence(e.target.value)}
              />
              Daily
            </label>
            <label className="recurrence-option">
              <input
                type="radio"
                value="weekly"
                checked={recurrence === "weekly"}
                onChange={(e) => setRecurrence(e.target.value)}
              />
              Weekly
            </label>
            <label className="recurrence-option">
              <input
                type="radio"
                value="monthly"
                checked={recurrence === "monthly"}
                onChange={(e) => setRecurrence(e.target.value)}
              />
              Monthly
            </label>
          </div>
          <button type="submit">{task ? "Save" : "Add Task"}</button>
        </form>
      </div>
    </div>
  );
};
