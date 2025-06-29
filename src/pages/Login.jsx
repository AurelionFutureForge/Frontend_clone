import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("admin");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send login request to the backend
      if (role == "admin") {
        const response = await axios.post(`${BASE_URL}/admin/login`, { email, password });

        // Store the admin token and company name in localStorage
        localStorage.setItem("admin_token", response.data.token);
        localStorage.setItem("adminCompanyName", response.data.admin.companyName);
        localStorage.setItem("adminEmail", response.data.admin.email);

        // Success message
        toast.success("Login Successful!");

        // Redirect to the dashboard after login
        navigate("/event-list");
      } else if (role == "privilege") {
        const res = await axios.post(`${BASE_URL}/privilege/login`, {
          email,
          password,
        });

        // Save auth data returned from backend
        localStorage.setItem("privilegeToken", res.data.token);
        localStorage.setItem("privilegeName", res.data.privilegeName);
        localStorage.setItem("eventId", res.data.eventId);
        localStorage.setItem("companyName", res.data.companyName);
        localStorage.setItem("eventName", res.data.eventName);

        toast.success("Login successful!");
        navigate("/privilege/dashboard");
      } 
    } catch (error) {
      // Handle invalid credentials
      toast.error("Invalid Credentials!");
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-black to-gray-800 p-6">
      <div className="bg-white p-8 shadow-xl rounded-lg w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">LOGIN</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 font-medium">Login As</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              disabled={loading}
            >
              <option value="admin">Admin</option>
              <option value="privilege">Access</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            />
          </div>

          {/* Password */}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg font-semibold transition transform hover:scale-105 
            ${loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {role === 'admin' && (
          <p
            className="text-sm text-blue-600 mt-2 cursor-pointer hover:underline text-right"
            onClick={() => navigate('/reset-password')}
          >
            Forgot password?
          </p>
        )}

        <p className="text-gray-600 text-center mt-4 text-sm">
          Choose your role to proceed. Unauthorized access will be denied.
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
