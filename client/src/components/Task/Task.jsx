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
  recurrence,
  onCompleteTask,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const maxVisibleAssignees = 2;
  const extraCount = assignees.length - maxVisibleAssignees;
  const visibleAssignees = assignees.slice(0, maxVisibleAssignees);
  const style = { transition, transform: CSS.Transform.toString(transform) };

  const formatDueDate = (v) => {
    if (!v) return "";
    const d = new Date(v);
    const now = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return d.getFullYear() === now.getFullYear()
      ? `${mm}/${dd}`
      : `${mm}/${dd}/${yy}`;
  };

  const formatRecurrence = (r) => {
    switch (r) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return "";
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="task"
    >
      <input 
        type="checkbox" 
        className="checkbox" 
        onChange={(e) => {
          e.stopPropagation();
          if (e.target.checked && onCompleteTask) {
            onCompleteTask();
            if (recurrence === "none") {
              return;
            }
            setTimeout(() => {
              e.target.checked = false;
            }, 400);
          }
        }}
      />
      <span className="task-title">{title}</span>
      <span className="task-due">
        {formatDueDate(dueDate)}
        {dueDate && <FaCalendar size={16} color="#555" />}
        {formatRecurrence(recurrence) && (
          <span className="task-recurrence">
            {" . "}{formatRecurrence(recurrence)}
          </span>
        )}
      </span>
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
