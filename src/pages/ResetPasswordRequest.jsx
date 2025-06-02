import { useState } from "react";
import axios from "axios";

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleRequestReset = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/admin/reset-password-request`, { email });
      setMessage('Reset link sent to your email');
    } catch (error) {
      console.error(error);
      setMessage('Could not send reset link. Try again.');
    }
  };

  return (
    <div className="flex items-center min-h-screen bg-gradient-to-r from-black to-gray-600 ">
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Reset Your Password</h2>
      
      <input
        type="email"
        placeholder="Enter your registered email"
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      
      <button
        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        onClick={handleRequestReset}
      >
        Send Reset Link
      </button>

      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
    </div>
  );
};

export default ResetPasswordRequest;
