import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
const tokenFromUrl = params.get("token");

if (tokenFromUrl) {
  localStorage.setItem("userToken", tokenFromUrl);
  console.log("Token saved:", localStorage.getItem("userToken"));
  window.location.href = "/dashboard";
}

  }, [navigate]);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#0d0d0d",
      color: "white",
      fontSize: "1.2rem"
    }}>
      🔄 Connexion via Google en cours...
    </div>
  );
}
