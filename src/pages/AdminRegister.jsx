import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"

function AdminRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register admin and get token and company details
      const response = await axios.post(`${BASE_URL}/admin/register`, { email, password, companyName, location, category });

      // Store token and company details in localStorage (log the user in)
      localStorage.setItem("admin_token", response.data.token);
      localStorage.setItem("adminCompanyName", response.data.companyName);
      localStorage.setItem("adminEmail", response.data.adminEmail);


      toast.success("Admin registered successfully!");

      // After successful registration, redirect to create-event page
      navigate("/refer");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-black to-gray-800 p-6">
      <div className="bg-white p-8 shadow-xl rounded-lg w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-black mb-6 text-center">Admin Registration</h2>

        <form onSubmit={handleRegister} className="space-y-5">
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
            <label className="block text-gray-700 font-medium">Create Password</label>
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

          <div>
            <label className="block text-gray-700 font-medium">Company Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              placeholder="Enter your company name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">Using stagyn for</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            >
              <option value="">Select a category</option>
              <option value="Startup expo/  conference / networking events">Startup expo/  conference / networking events</option>
              <option value="Corporate events / Training Programs">Corporate events / Training Programs</option>
              <option value=" Entertainment Events / concerts"> Entertainment Events / concerts</option>

            </select>
          </div>


          <div>
            <label className="block text-gray-700 font-medium">City</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Enter your location"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`w-full p-3 rounded-lg font-semibold transition transform hover:scale-105 
            ${loading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700 text-white"}`}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* Link to navigate to the login page if already registered */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already registered?{" "}
            <Link to="/admin/login" className="text-red-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
