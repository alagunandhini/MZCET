import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

export default function SsoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying token...");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("No token provided");
      return;
    }

    axios
      .post(`${API_URL}/api/auth/sso`, { token })
      .then((res) => {
        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          if (res.data.user) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
          const target = res.data.userType === "hod" ? "/admin" : "/resume";
          navigate(target, { replace: true });
        } else {
          setStatus(res.data.message || "Authentication failed");
        }
      })
      .catch(() => {
        setStatus("Server unreachable. Make sure the backend is running.");
      });
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center text-gray-600 text-sm">
      {status}
    </div>
  );
}
