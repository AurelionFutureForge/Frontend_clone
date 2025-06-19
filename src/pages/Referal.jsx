import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";



const Referal = () => {

    const [referal, setReferal] = useState("");
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const email = localStorage.getItem("adminEmail");
            if (referal.trim() !== "") {
                const isValid = /^[a-zA-Z0-9]+$/.test(referal);
                if (!isValid) {
                    toast.error("Referral code must contain only letters and numbers");
                    return;
                }
                await axios.post(`${BASE_URL}/admin/referal`, { email, referal });
            }

            navigate("/create-event");
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-black to-gray-800 p-6">
            <div className="bg-white p-8 shadow-xl rounded-lg w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label className="block text-gray-700 font-medium">Referal Code (Optional)</label>
                        <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
                            value={referal}
                            onChange={(e) => setReferal(e.target.value)}
                            placeholder="Enter your  referal code"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-3 rounded-lg font-semibold transition transform hover:scale-105 bg-red-500 text-white hover:bg-red-400">
                        Continue
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Referal