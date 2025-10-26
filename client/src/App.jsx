import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import "./App.css";
import Dashboard from "./pages/Dashboard.jsx";

function LoginPage() {
  const navigate = useNavigate();
  return (
    <Login
      onLoginSuccess={() => {
        localStorage.setItem("loggedIn", "true");
        navigate("/dashboard", { replace: true });
      }}
      onShowRegister={() => navigate("/register")}
    />
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  return (
    <Register
      onRegisterSuccess={() => navigate("/login")}
      onBackToLogin={() => navigate("/login")}
    />
  );
}

function RequireAuth({ children }) {
  const ok = localStorage.getItem("loggedIn") === "true";
  return ok ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
