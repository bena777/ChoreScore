import { useNavigate } from "react-router-dom";
import TasksPanel from "../TasksPanel";

export default function Dashboard() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/login", { replace: true });
  };
  return (
    <div className="container">
      <h1>ChoreScore</h1>
      <TasksPanel />
      <button onClick={logout} style={{ marginTop: 24 }}>
        Logout
      </button>
    </div>
  );
}
