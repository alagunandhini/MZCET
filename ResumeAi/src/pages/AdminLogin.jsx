import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        navigate("/admin");
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white w-full flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-500 rounded-md mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 border border-gray-500 rounded-md mb-6"
          />
          <button className="w-full bg-gray-800 text-white px-6 py-3 rounded-full hover:bg-gray-900">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;