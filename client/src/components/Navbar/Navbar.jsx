import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(localStorage.getItem("loggedIn") === "true");
    };
    checkAuth();
    // Listen for storage changes (e.g., when user logs in/out)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location]); // Re-check on location change

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ChoreScore
      </Link>
      <div className="navbar-buttons">
        {isLoggedIn ? (
          <>
            <Link to="/dashboard">
              <button className="navbar-btn">Dashboard</button>
            </Link>
            <button className="navbar-btn logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="navbar-btn">Sign In</button>
            </Link>
            <Link to="/register">
              <button className="navbar-btn primary">Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
