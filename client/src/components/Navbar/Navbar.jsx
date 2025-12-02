import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ProfileMenu from "../ProfileMenu/ProfileMenu.jsx";
import { api } from "../../api";
import "./Navbar.css";

export default function Navbar({ darkMode, toggleDarkMode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = localStorage.getItem("loggedIn") === "true";
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        try {
          const loggedInUsername = localStorage.getItem("loggedInUser");
          const { users } = await api("/api/users");
          const user = users.find(u => (u.username || u.name || "").toLowerCase() === loggedInUsername.toLowerCase());
          
          if (user) {
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      } else {
        setCurrentUser(null);
      }
    };
    
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [location]);

  const handleUpdateProfile = async (updates) => {
    if (!currentUser) return;
    
    try {
      const { user } = await api(`/api/users/${currentUser.username}`, {
        method: "PUT",
        body: updates,
      });
      
      setCurrentUser(user);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ChoreScore
      </Link>
      <div className="navbar-buttons">
        <button 
          className="navbar-btn dark-mode-toggle" 
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        {isLoggedIn ? (
          <>
            <Link to="/dashboard">
              <button className="navbar-btn">Dashboard</button>
            </Link>
            <ProfileMenu user={currentUser} onUpdateProfile={handleUpdateProfile} />
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
