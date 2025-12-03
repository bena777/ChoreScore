import { useState, useEffect } from "react";
import "./TaskFormModal.css";

export const TaskFormModal = ({
  showModal,
  onClose,
  task,
  allUsers,
  onSubmit,
  currentUserGroupId,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [selectedAssignee, setSelectedAssignee] = useState(task?.assignee || null);
  const [score, setScore] = useState(task?.score || 3);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    setTitle(task?.title || "");
    setScore(task?.score || 3);
    // Map task.assignee_id to a user in allUsers for editing
    if (task?.assignee_id && Array.isArray(allUsers)) {
      const u = allUsers.find(x => x.id === task.assignee_id);
      setSelectedAssignee(u || null);
    } else {
      setSelectedAssignee(task?.assignee || null);
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

  // Filter users by same group_id as current user; if current user is in admin group -69, allow all users
  const availableAssignees = Array.isArray(allUsers)
    ? allUsers.filter((u) => {
        if (currentUserGroupId === -69) return true;
        return u.roomate_group && u.roomate_group === currentUserGroupId;
      })
    : [];

  const selectAssignee = (user) => {
    setSelectedAssignee(selectedAssignee?.id === user.id ? null : user);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...task, title, assignee: selectedAssignee, score, dueDate });
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? "Edit Task" : "Add Task"}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Task Name:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label>Assignee:</label>
          <div className="assignee-selection">
            {availableAssignees.map((user) => (
              <img
                key={user.id}
                src={user.avatar}
                alt={user.name}
                title={user.name}
                className={
                  selectedAssignee?.id === user.id
                    ? "selected"
                    : ""
                }
                onClick={() => selectAssignee(user)}
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
          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit">{task ? "Save Changes" : "Add Task"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
