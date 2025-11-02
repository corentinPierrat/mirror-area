import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "../styles/ProfileInfo.module.css";

const API_URL = import.meta.env.VITE_API_URL;

function ProfileInfoCard({ user, onEditPassword, onEditImage, onDeleteAccount }) {
  if (!user) return <p>Loading information...</p>;

  return (
    <div className={styles.profileCard}>
      <h2 className={styles.title}>My Profile</h2>

      <div className={styles.infoGroup}>
        <p><strong>Username:</strong> {user.username || "—"}</p>
        <p><strong>Email:</strong> {user.email || "—"}</p>
        <p><strong>ID:</strong> {user.id}</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.editBtn} onClick={onEditPassword}>
          Change Password
        </button>
        <button className={styles.editBtn} onClick={onEditImage}>
          Change Picture
        </button>
        <button className={styles.deleteBtn} onClick={onDeleteAccount}>
          Delete Account
        </button>
      </div>
    </div>
  );
}

function ChangePasswordBubble({ onClose, token }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await axios.patch(
        `${API_URL}/auth/change-password`,
        { old_password: oldPassword, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.profileCard} ${styles.formBubble}`}>
      <h2 className={styles.title}>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="old_pass">Old Password</label>
          <input
            id="old_pass"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="new_pass">New Password</label>
          <input
            id="new_pass"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        {error && <p className={styles.messageError}>{error}</p>}
        {success && <p className={styles.messageSuccess}>{success}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.deleteBtn} onClick={onClose}>
            Close
          </button>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProfileImageBubble({ onClose, onImageUploadSuccess, token }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (files) => {
    if (files && files[0]) {
      setFile(files[0]);
      setError("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${API_URL}/auth/me/profile-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      onImageUploadSuccess(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Could not upload image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.profileCard} ${styles.formBubble}`}>
      <h2 className={styles.title}>Change Profile Picture</h2>
      
      <div 
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        {file ? (
          <p>File selected: {file.name}</p>
        ) : (
          <p>Drag & drop an image here, or click to select</p>
        )}
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleFileChange(e.target.files)}
        />
      </div>

      {error && <p className={styles.messageError}>{error}</p>}
      
      <div className={styles.actions}>
        <button type="button" className={styles.deleteBtn} onClick={onClose}>
          Close
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleUpload} disabled={loading || !file}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}


export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPasswordBubble, setShowPasswordBubble] = useState(false);
  const [showImageBubble, setShowImageBubble] = useState(false);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    if (!token) {
      setError("Not authenticated.");
      setLoading(false);
      return;
    }
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Unable to load profile.");
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const handleDeleteAccount = () => {
    console.warn("Delete account logic not implemented.");
    alert("Delete account functionality is not yet set up.");
  };

  if (loading) return <p className={styles.loading}>Loading Profile...</p>;
  if (error) return <p className={styles.messageError}>{error}</p>;

  return (
    <div className={styles.settingsPageContainer}>
      <ProfileInfoCard
        user={user}
        onEditPassword={() => {
          setShowPasswordBubble(true);
          setShowImageBubble(false);
        }}
        onEditImage={() => {
          setShowImageBubble(true);
          setShowPasswordBubble(false);
        }}
        onDeleteAccount={handleDeleteAccount}
      />

      {showPasswordBubble && (
        <ChangePasswordBubble
          onClose={() => setShowPasswordBubble(false)}
          token={token}
        />
      )}

      {showImageBubble && (
        <ProfileImageBubble
          onClose={() => setShowImageBubble(false)}
          onImageUploadSuccess={(updatedUser) => setUser(updatedUser)}
          token={token}
        />
      )}
    </div>
  );
}
