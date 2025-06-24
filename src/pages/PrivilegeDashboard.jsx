import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/stagyn_black.png'

// Utility to dynamically extract name + email from registrationData
function extractNameAndEmail(registrationData) {
  const nameField = Object.keys(registrationData).find((key) =>
    key.toLowerCase().includes("name")
  );
  const emailField = Object.keys(registrationData).find((key) =>
    key.toLowerCase().includes("mail")
  );

  const name = nameField ? registrationData[nameField] : "";
  const email = emailField ? registrationData[emailField] : "";

  return { name, email };
}

// Utility to dynamically extract contact from registrationData
function extractContact(registrationData) {
  const contactField = Object.keys(registrationData).find((key) => {
    const lowerKey = key.toLowerCase();
    return (
      lowerKey.includes("contact") ||
      lowerKey.includes("mobile") ||
      lowerKey.includes("phone") ||
      lowerKey.includes("number")
    );
  });

  const contact = contactField ? registrationData[contactField] : "";
  return contact;
}

function PrivilegeDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const privilegeName = localStorage.getItem("privilegeName");
  const token = localStorage.getItem("privilegeToken");
  const companyName = localStorage.getItem("companyName");
  const eventName = localStorage.getItem("eventName");
  const eventId = localStorage.getItem("eventId");

  useEffect(() => {
    if (!token || !privilegeName || !eventId) {
      toast.error("Unauthorized access. Please login.");
      navigate("/privilege-login");
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/privilege/users`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { eventId },
        });
        setUsers(res.data.users);
      } catch (err) {
        console.error("Fetch users error:", err);
        toast.error(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, privilegeName, eventId, navigate, BASE_URL]);

  const handleScanQR = () => {
    navigate("/admin/scanner");
  };

  const handleLogout = () => {
    localStorage.removeItem("privilegeName");
    localStorage.removeItem("privilegeToken");
    localStorage.removeItem("companyName");
    localStorage.removeItem("eventName");
    localStorage.removeItem("eventId");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="text-center md:text-left w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {companyName} — {eventName}
            </h1>
            <p className="text-lg text-gray-700 mt-1 font-medium">
              Privilege: <span className="text-black font-semibold">{privilegeName.toUpperCase()}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium shadow-md"
          >
            Logout
          </button>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={handleScanQR}
            className="bg-red-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-red-700 transition font-medium shadow-md"
          >
            Scan QR to Claim <span className="font-semibold">{privilegeName}</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-800">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Contact</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Claim Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((user) => {
                  const privilege = user.privileges.find(
                    (p) => p.name === privilegeName
                  );
                  const isClaimed = privilege?.claim === true;

                  const registration = user.registrationData;
                  const { name, email } = extractNameAndEmail(registration);
                  const contact = extractContact(registration);

                  return (
                    <tr key={user._id}>
                      <td className="px-4 py-3">{name}</td>
                      <td className="px-4 py-3">{email}</td>
                      <td className="px-4 py-3">{contact}</td>
                      <td className="px-4 py-3 capitalize">{user.role}</td>
                      <td className="px-4 py-3">
                        {isClaimed ? (
                          <span className="text-green-600 font-semibold">Claimed</span>
                        ) : (
                          <span className="text-red-600 font-semibold">Not Claimed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-[-70px]">
        <span className="text-gray-600 text-sm ">Powered by</span>
        <Link to="/">
          <img
            src={logo}
            alt="Powered by logo"
            className="h-7 object-contain"
          />
        </Link>
      </div>
    </>

  );
}

export default PrivilegeDashboard;