// file: elios_FE/src/auth/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../api/apiConfig";


const ProtectedRoute = () => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true; 

    const verifySession = async () => {
      try {
        await new Promise((res) => setTimeout(res, 350)); 

        const response = await axios.get("http://www.elios.com/api/users/me/profile", {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (isMounted) {
          setStatus("authorized");
        }
      } catch (err) {
        if (isMounted) {
          console.warn("❌ Not authenticated:", err);
          setStatus("unauthorized");
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false; // cleanup on unmount
    };
  }, []);

  if (status === "checking") {
    // ⏳ While verifying, show loader or splash
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  if (status === "unauthorized") {
    // 🕒 Delay redirect slightly to ensure alert shows and cleanup is done
    setTimeout(() => {
      alert("Your session has expired or you are not logged in. Redirecting...");
      window.location.href = API_ENDPOINTS.LOGIN_PATH;
    }, 700);
    return null;
  }

  // ✅ Authorized, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
