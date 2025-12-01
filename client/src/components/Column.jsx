import "./column.css";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FaPlus } from "react-icons/fa";
import { Task } from "./Task/Task.jsx";
import "./Task/Task.css";

export const Column = ({
  tasks,
  openAddModal,
  openEditModal,
  onDeleteTask,
  onCompleteTask,
}) => {
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
            assignees={task.assignees || []}
            score={task.score}
            dueDate={task.dueDate}
            recurrence={task.recurrence}
            openEditModal={() => openEditModal(task)}
            onDeleteTask={() => onDeleteTask(task.id)}
            onCompleteTask={() => onCompleteTask(task)}
          />
        ))}
      </SortableContext>
    </div>
  );
};
