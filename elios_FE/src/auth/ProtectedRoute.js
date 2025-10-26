// file: elios_FE/src/auth/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../api/apiConfig";


const ProtectedRoute = () => {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let isMounted = true; // prevent state update on unmounted component

    const verifySession = async () => {
      try {
        // Delay a little to make sure cookies are attached properly
        await new Promise((res) => setTimeout(res, 300)); // 👈 small delay helps stabilize flow

        const response = await axios.get("http://www.elios.com/api/users", {
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
    }, 1000);
    return null;
  }

  // ✅ Authorized, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
