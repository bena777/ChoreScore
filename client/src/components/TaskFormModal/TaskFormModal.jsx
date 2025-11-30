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
  const [selectedAssignees, setSelectedAssignees] = useState(task?.assignees || []);
  const [score, setScore] = useState(task?.score || 3);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    setTitle(task?.title || "");
    setScore(task?.score || 3);
    // Map task.student_id to a user in allUsers for editing
    if (task?.student_id && Array.isArray(allUsers)) {
      const u = allUsers.find(x => x.id === task.student_id);
      setSelectedAssignees(u ? [u] : []);
    } else {
      setSelectedAssignees(task?.assignees || []);
    }
    // Convert timestamp to YYYY-MM-DD for date input
    if (task?.dueDate) {
      const d = new Date(task.dueDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      setDueDate(`${yyyy}-${mm}-${dd}`);
    } else {
      setDueDate("");
    }
  }, [task, allUsers]);

  const toggleAssignee = (user) => {
    if (selectedAssignees.find((a) => a.id === user.id)) {
      setSelectedAssignees(selectedAssignees.filter((a) => a.id !== user.id));
    } else {
      setSelectedAssignees([...selectedAssignees, user]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...task, title, assignees: selectedAssignees, score, dueDate });
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
          <button type="submit">{task ? "Save" : "Add Task"}</button>
        </form>
      </div>
    </div>
  );
};
