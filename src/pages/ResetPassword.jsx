import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/admin/reset-password/${token}`, { password });
      setMessage('Password reset successful!');
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (error) {
      console.error(error);
      setMessage('Invalid or expired reset link.');
    }
  };

  return (
    <div className="flex items-center min-h-screen bg-gradient-to-r from-black to-gray-600 ">
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Set New Password</h2>

      <input
        type="password"
        placeholder="New password"
        className="w-full px-4 py-2 mb-3 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm password"
        className="w-full px-4 py-2 mb-4 border rounded"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        onClick={handleReset}
        className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
      >
        Reset Password
      </button>

      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
    </div>
  );
};

export default ResetPassword;
