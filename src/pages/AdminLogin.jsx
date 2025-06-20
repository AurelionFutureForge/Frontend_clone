import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send login request to the backend
      const response = await axios.post(`${BASE_URL}/admin/login`, { email, password });

      // Store the admin token and company name in localStorage
      localStorage.setItem("admin_token", response.data.token);
      localStorage.setItem("adminCompanyName", response.data.admin.companyName);
      localStorage.setItem("adminEmail", response.data.admin.email);

      // Success message
      toast.success("Login Successful!");

      // Redirect to the dashboard after login
      navigate("/create-event");

    } catch (error) {
      // Handle invalid credentials
      toast.error("Invalid Credentials!");
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-black to-gray-600 p-6">
      <div className="bg-white p-8 shadow-xl rounded-lg w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">Admin Login</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full p-3 pr-10 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-gray-600"
            >
              {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            className={`w-full p-3 rounded-lg font-semibold transition transform hover:scale-105 
            ${loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p
          className="text-sm text-blue-600 mt-2 cursor-pointer hover:underline text-right"
          onClick={() => navigate('/reset-password')}
        >
          Forgot password?
        </p>

        <p className="text-gray-600 text-center mt-4 text-sm">
          Admin access only. Unauthorized users will be denied.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;