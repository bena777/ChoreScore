import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { generateAvatarUrl, isValidAvatarUrl, generateRandomColor, extractColorFromUrl, isGeneratedAvatar } from "../../utils/avatarUtils";
import "./ProfileMenu.css";

export default function ProfileMenu({ user, onUpdateProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarType, setAvatarType] = useState("default"); // "default" or "custom"
  const [customUrl, setCustomUrl] = useState("");
  const [avatarColor, setAvatarColor] = useState("");
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      
      // Determine if current avatar is custom or default
      if (user.avatar && isGeneratedAvatar(user.avatar)) {
        setAvatarType("default");
        const color = extractColorFromUrl(user.avatar);
        setAvatarColor(color || "");
        setCustomUrl("");
      } else if (user.avatar && isValidAvatarUrl(user.avatar)) {
        setAvatarType("custom");
        setCustomUrl(user.avatar);
        setAvatarColor("");
      } else {
        setAvatarType("default");
        setAvatarColor("");
        setCustomUrl("");
      }
    }
  }, [user]);

  // No implicit random generation; user uses the refresh button to pick a color

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    setIsOpen(false);
    navigate("/");
  };

  const handleSaveProfile = async () => {
    if (onUpdateProfile) {
      let finalAvatar;
      
      if (avatarType === "custom") {
        // Use custom URL if valid, otherwise fallback to default
        if (customUrl && isValidAvatarUrl(customUrl)) {
          finalAvatar = customUrl;
        } else {
          // Invalid custom URL, require user to choose a color or valid URL
          alert("Please enter a valid image URL, or switch to Default and pick a color.");
          return;
        }
      } else {
        // Default avatar with color
        if (!avatarColor) {
          alert("Pick a color using the refresh button or enter a hex value.");
          return;
        }
        finalAvatar = generateAvatarUrl(firstName, lastName, avatarColor);
      }
      
      await onUpdateProfile({ 
        first_name: firstName, 
        last_name: lastName, 
        avatar: finalAvatar 
      });
    }
    setShowEditModal(false);
    setIsOpen(false);
  };

  const getAvatarUrl = () => {
    // Use avatar from database (pfp_url)
    if (user?.avatar && isValidAvatarUrl(user.avatar)) {
      return user.avatar;
    }
    
    // Fallback: Generate from first/last name
    if (user?.first_name || user?.last_name) {
      return generateAvatarUrl(user.first_name || '', user.last_name || '');
    }
    
    // Last resort: Generate from username
    if (user?.username) {
      const parts = user.username.split(/[._-]/);
      return generateAvatarUrl(parts[0] || 'U', parts[1] || 'ser');
    }
    
    return null;
  };

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || "User";
  };

  if (!user) return null;

  const avatarToDisplay = getAvatarUrl();

  return (
    <div className="profile-menu" ref={menuRef}>
      <button 
        className="profile-avatar-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title="Profile Menu"
      >
        {avatarToDisplay ? (
          <img src={avatarToDisplay} alt="Profile" className="profile-avatar-img" />
        ) : (
          <div className="profile-avatar-placeholder">{getInitials()}</div>
        )}
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-dropdown-header">
            <div className="profile-dropdown-avatar">
              {avatarToDisplay ? (
                <img src={avatarToDisplay} alt="Profile" />
              ) : (
                <div className="profile-avatar-placeholder-large">{getInitials()}</div>
              )}
            </div>
            <div className="profile-dropdown-info">
              <div className="profile-dropdown-name">{getDisplayName()}</div>
              <div className="profile-dropdown-username">@{user.username}</div>
              {user.roomate_group && user.roomate_group !== -1 && (
                <div className="profile-dropdown-group">Group: {user.roomate_group}</div>
              )}
            </div>
          </div>
          
          <div className="profile-dropdown-divider"></div>
          
          <button 
            className="profile-dropdown-item"
            onClick={() => setShowEditModal(true)}
          >
            <span>✏️</span> Edit Profile
          </button>
          
          <div className="profile-dropdown-divider"></div>
          
          <button 
            className="profile-dropdown-item logout-item"
            onClick={handleLogout}
          >
            <span>🚪</span> Sign Out
          </button>

          <div className="profile-dropdown-divider"></div>

          <button 
            className="profile-dropdown-item logout-item"
            onClick={async () => {
              const proceed = window.confirm("Delete your account? This cannot be undone.");
              if (!proceed) return;
              try {
                const loggedInUsername = localStorage.getItem("loggedInUser");
                if (!loggedInUsername) throw new Error("No logged-in user");
                const res = await fetch(`/api/users/${encodeURIComponent(loggedInUsername)}`, { method: "DELETE" });
                if (!res.ok) throw new Error("Failed to delete account");
                localStorage.removeItem("loggedIn");
                localStorage.removeItem("loggedInUser");
                setIsOpen(false);
                navigate("/");
              } catch (e) {
                alert(e.message || "Unable to delete account");
              }
            }}
          >
            <span>🗑️</span> Delete Account
          </button>
        </div>
      )}

      {showEditModal && (
        <div className="profile-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h2>Edit Profile</h2>
              <button 
                className="profile-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="profile-modal-body">
              <div className="profile-form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              
              <div className="profile-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              
              <div className="profile-form-group">
                <label>Avatar Type</label>
                <div className="avatar-type-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${avatarType === "default" ? "active" : ""}`}
                    onClick={() => setAvatarType("default")}
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${avatarType === "custom" ? "active" : ""}`}
                    onClick={() => setAvatarType("custom")}
                  >
                    Custom
                  </button>
                </div>
              </div>
              
              {avatarType === "custom" ? (
                <div className="profile-form-group">
                  <label>Custom Avatar URL</label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    Enter a valid image URL for your custom avatar
                  </small>
                </div>
              ) : (
                <div className="profile-form-group">
                  <label>Avatar Color (Hex)</label>
                  <div className="avatar-color-row">
                    <button
                      type="button"
                      className="color-refresh-icon"
                      onClick={() => setAvatarColor(generateRandomColor())}
                      title="Generate random color"
                      aria-label="Generate random color"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                    </button>
                    <input
                      type="text"
                      value={avatarColor}
                      onChange={(e) => setAvatarColor(e.target.value.replace('#', ''))}
                      placeholder="e.g., ff5733"
                      maxLength="6"
                    />
                  </div>
                  <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    Click the icon to generate a random color, or enter your own.
                  </small>
                </div>
              )}
              
              <div className="profile-avatar-preview">
                {avatarType === "custom" && customUrl && isValidAvatarUrl(customUrl) ? (
                  <img 
                    src={customUrl} 
                    alt="Custom Avatar" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }} 
                  />
                ) : (
                  <img 
                    src={generateAvatarUrl(firstName, lastName, avatarColor || '888888')} 
                    alt="Default Avatar"
                  />
                )}
              </div>
            </div>
            
            <div className="profile-modal-footer">
              <button 
                className="profile-btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button 
                className="profile-btn-save"
                onClick={handleSaveProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
