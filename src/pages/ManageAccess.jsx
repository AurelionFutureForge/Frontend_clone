import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

function ManageAccess() {
  const [privilegesList, setPrivilegesList] = useState([]);
  const [assignedPrivileges, setAssignedPrivileges] = useState([]);
  const [loading, setLoading] = useState(false); // To handle loading state
  const [prevLoading, setPrivLoading] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [getPrivileges, setGetPrivileges] = useState([]);
  const [privilegesLoading, setPrivilegesLoading] = useState(true);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const companyName = localStorage.getItem("adminCompanyName");
  const eventId = localStorage.getItem("selectedEvent");
  const eventName = localStorage.getItem("eventName");

  // Fetch available privileges from EventDB on load
  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const response = await axios.get(`${BASE_URL}/admin/event-privileges`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { eventId } // We only need eventId in query params
        });

        const privilegesFromDB = response.data.privileges; // array of privilege names

        // Remove duplicates by using Set
        const uniquePrivileges = [...new Set(privilegesFromDB)];

        // Initialize assignedPrivileges with empty email/password for unique privileges
        const initialAssigned = uniquePrivileges.map(p => ({
          privilegeName: p,
          email: "",
          password: "",
          endDate: ""
        }));

        setPrivilegesList(uniquePrivileges); // Set unique privileges to state
        setAssignedPrivileges(initialAssigned);
      } catch (error) {
        toast.error("Failed to fetch privileges");
      }
    };

    fetchPrivileges();
  }, [BASE_URL, eventId]);

  const getPrivilege = async () => {
    try {
      setPrivilegesLoading(true);
      const response = await axios.get(`${BASE_URL}/privilege/get-privileges/${eventId}`);
      setGetPrivileges(response.data);
    } catch (error) {
      setGetPrivileges([]);
    } finally {
      setPrivilegesLoading(false);
    }
  };
  useEffect(() => {
    getPrivilege();
  }, [BASE_URL, eventId]);


  const handleInputChange = (index, field, value) => {
    const updated = [...assignedPrivileges];
    updated[index][field] = value;
    setAssignedPrivileges(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");

    // Validation: Check if all fields are filled
    const isValid = assignedPrivileges.every((priv) => priv.email && priv.password);
    if (!isValid) {
      toast.error("Please fill all the fields.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${BASE_URL}/admin/assign-privileges`, {
        eventId, // Pass eventId here
        privileges: assignedPrivileges
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Privileges assigned successfully!");
      navigate("/admin/dashboard/:eventId/:eventName");
    } catch (error) {
      toast.error("Failed to assign privileges");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrivilege = async (priv) => {
    try {
      const response = await axios.delete(`${BASE_URL}/privilege/delete-privilege`, {
        data: {
          eventId,
          priv
        }
      });
      toast.success(response.data.message);
      setGetPrivileges(prev =>
        prev.filter(p => !(p.email === priv.email && p.privilegeName === priv.privilegeName))
      );
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete privilege");
    }
  };


  const handleDelete = async () => {
    try {
      setPrivLoading(true);
      const rawEventId = localStorage.getItem("selectedEvent");
      const eventId = rawEventId?.startsWith(":") ? rawEventId.slice(1) : rawEventId;
      await axios.delete(`${BASE_URL}/admin/delete-privileges/${eventId}`);
      toast.success("Privileges Deleted Successfully");
      await getPrivilege();
    } catch (error) {
      toast.error("Failed to delete the Privileges");
    } finally {
      setPrivLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-800 flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Manage Access</h2>

        {assignedPrivileges.map((priv, index) => (
          <div key={index} className="border rounded p-4 mb-3 bg-gray-50">
            <p className="font-semibold text-gray-700 mb-2">Privilege: {priv.privilegeName}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Enter Email"
                value={priv.email}
                onChange={(e) => handleInputChange(index, "email", e.target.value)}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-gray-400"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={priv.password}
                  onChange={(e) => handleInputChange(index, "password", e.target.value)}
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-gray-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex flex-col">
                <label className="font-medium text-gray-700 mb-2">Plan the expiry date for this access</label>
                <input
                  type="date"
                  value={priv.endDate}
                  onChange={(e) => handleInputChange(index, "endDate", e.target.value)}
                  className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-gray-400"
                />
              </div>

            </div>
          </div>
        ))}

        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleSubmit}
            className={`bg-gray-900 border cursor-pointer border-gray-300 text-white px-6 py-2 rounded-4xl hover:bg-gray-800 transition w-full md:w-auto ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading}
          >
            {loading ? "Assigning..." : "Assign Privileges"}
          </button>
        </div>
      </div>
      {getPrivileges.length > 0 ? (
        <div className="bg-white mt-8 p-6 rounded-xl shadow-md w-full max-w-3xl">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Assigned Privileges</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm border border-black">
              <thead className="bg-gray-100 text-gray-700">
                <tr className="border border-black">
                  <th className="px-6 py-3 text-center font-semibold border border-black">Email</th>
                  <th className="px-6 py-3 text-center font-semibold border border-black">Privileges</th>
                  <th className="px-6 py-3 text-center font-semibold border border-black">Expiry Date</th>
                  <th className="px-6 py-3 text-center font-semibold border border-black">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getPrivileges.map((priv, idx) => (
                  <tr key={idx} className="border border-black">
                    <td className="px-6 py-3 border border-black">{priv.email}</td>
                    <td className="px-6 py-3 border border-black">{priv.privilegeName}</td>
                    <td className="px-6 py-3 border border-black">
                      {priv.endDate ? new Date(priv.endDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-3 border border-black text-center">
                      <button
                        onClick={() => handleDeletePrivilege(priv)}
                        className="bg-red-600 text-white px-3 py-1 cursor-pointer rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={handleDelete}
              className={`bg-red-600 mt-2 cursor-pointer text-white px-6 py-2 rounded-4xl hover:bg-red-700 transition  w-full md:w-auto ${prevLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={prevLoading}
            >
              {prevLoading ? "Deleting" : "Delete All Assigned Privileges"}
            </button>
          </div>
        </div>
      ) : " "}
    </div>

  );
}

export default ManageAccess;
