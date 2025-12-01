import "./Task.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaPencilAlt, FaTrash, FaCalendar } from "react-icons/fa";

export const Task = ({
  id,
  title,
  assignees,
  openEditModal,
  onDeleteTask,
  dueDate,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const maxVisibleAssignees = 2;
  const extraCount = assignees.length - maxVisibleAssignees;
  const visibleAssignees = assignees.slice(0, maxVisibleAssignees);
  const style = { transition, transform: CSS.Transform.toString(transform) };

  const formatDueDate = (v) => {
    if (!v) return "";
    // Handle both YYYY-MM-DD and full ISO date strings
    const dateStr = typeof v === 'string' ? v.split('T')[0] : v;
    const d = new Date(dateStr + "T00:00:00");
    // Check if date is valid
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return d.getFullYear() === now.getFullYear()
      ? `${mm}/${dd}`
      : `${mm}/${dd}/${yy}`;
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="task"
    >
      <input type="checkbox" className="checkbox" />
      <span className="task-title">{title}</span>
      <div className="assignees-stack">
        {visibleAssignees.map((a, i) => (
          <img
            key={i}
            className="assignee-avatar"
            src={a.avatar}
            alt={a.name}
            title={a.name}
          />
        ))}
        {extraCount > 0 && <div className="assignees-extra">+{extraCount}</div>}
      </div>
      <span className="task-due">
        {formatDueDate(dueDate)}
        {dueDate && <FaCalendar size={16} color="#555" />}
      </span>
      <div className="task-buttons">
        <button
          className="edit-btn"
          onClick={(e) => {
            e.stopPropagation();
            openEditModal();
          }}
        >
          <FaPencilAlt size={18} color="white" />
        </button>
        <button
          className="del-btn"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask();
          }}
        >
          <FaTrash size={18} color="white" />
        </button>
      </div>
    </div>
  );
};
