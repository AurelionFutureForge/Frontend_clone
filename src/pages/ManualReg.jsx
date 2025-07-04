import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import logo from '../assets/stagyn_black.png'
import { ShieldCheck, MapPin, Calendar, Clock } from 'lucide-react'
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function extractContact(registrationData = {}) {
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

function ManualReg() {
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [roleRegistrations, setRoleRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false); // Track payment
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const eventID = localStorage.getItem("selectedEvent");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${eventID}`);
        setEvent(response.data);

        const regRes = await axios.get(`${BASE_URL}/users/${eventID}/role-registrations`);
        setRoleRegistrations(regRes.data);

        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch event details.");
        setLoading(false);
      }
    };

    if (eventID) {
      fetchEventDetails();
    } else {
      toast.error("No event selected.");
      setLoading(false);
    }
  }, [eventID, BASE_URL]);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!event?.companyName) return;

      try {
        let companyName = event.companyName;
        companyName = companyName
          .replace(/\+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        console.log("..", companyName);
        const adminRes = await axios.get(`${BASE_URL}/admin/get-admin`, {
          params: { companyName: companyName.trim() }
        });
        setAdmin(adminRes.data);
        console.log("adminRes:", adminRes);
        console.log(adminRes.data);
      } catch (error) {
        console.error("Error fetching admin:", error);
      }
    };

    fetchAdmin();
  }, [event?.companyName, BASE_URL]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked
          ? [...(formData[name] || []), value]
          : (formData[name] || []).filter((v) => v !== value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePayment = async () => {
    if (!formData.role) {
      toast.error("Please select a role before proceeding.");
      return;
    }

    const requiredFields = event?.registrationFields?.filter(field => field.required);
    for (const field of requiredFields) {
      const value = formData[field.fieldName];


      if (!value || (typeof value === 'string' && value.trim() === '')) {
        toast.error(`Please fill in the required field: ${field.fieldName}`);
        return;
      }
    }

    const contactNumber = extractContact(formData).toString().replace(/\D/g, "");

    if (contactNumber && !/^\d{10}$/.test(contactNumber)) {
      toast.error("Please enter a valid 10-digit contact number.");
      return;
    }
    setIsLoading(true);
    try {
      const selectedRoleData = event.eventRoles.find(role => role.roleName === formData.role);
      const amount = selectedRoleData.rolePrice;

      const checkRes = await axios.post(`${BASE_URL}/users/check-email`, {
        email: formData.EMAIL || formData.email,
        eventId: eventID,
      });

      if (checkRes.data.exists) {
        toast.error("You have already registered for this event with this email.");
        return;
      }


      const feePercent = admin?.category === "Entertainment Events / concerts" ? 5 : 2.5;
      const rawPlatformFee = (amount * feePercent) / 100;
      const platformFee = Math.round(rawPlatformFee * 100) / 100;
      const calculatedAmount = parseFloat((amount + platformFee).toFixed(2));


      const updatedFormData = {
        ...formData,
        amount: calculatedAmount,
      };

      localStorage.setItem("formData", JSON.stringify(updatedFormData));
      localStorage.setItem("eventID", eventID);

      const res = await axios.post(`${BASE_URL}/api/phonepe/initiate-payment`, {
        amount: calculatedAmount, email: formData.EMAIL, eventId: eventID
      });

      const { redirectUrl } = res.data;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        toast.error("Failed to get PhonePe payment URL.");
      }
    } catch (err) {
      setIsLoading(false);
      toast.error("Fill all the required fields or Payment initiation failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
      <div className="flex flex-col items-center">
        <svg
          className="animate-spin h-10 w-10 text-white mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <p className="text-lg">REG FROM...</p>
      </div>
    </div>
  );
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800 text-white">
      <div className="flex flex-col items-center">
        <svg
          className="animate-spin h-10 w-10 text-white mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <p className="text-lg">REG FROM...</p>
      </div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M12 21.75C6.615 21.75 2.25 17.385 2.25 12S6.615 2.25 12 2.25 21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
      </svg>
      <p className="text-xl text-gray-300">No event found.</p>
    </div>
  );



  const selectedRole = event?.eventRoles?.find(
    (role) => role.roleName === formData.role
  );

  const handleFreeRegistration = async () => {
    const requiredFields = event?.registrationFields?.filter(field => field.required);
    for (const field of requiredFields) {
      const value = formData[field.fieldName];


      if (!value || (typeof value === 'string' && value.trim() === '')) {
        toast.error(`Please fill in the required field: ${field.fieldName}`);
        return;
      }
    }
    setIsLoading(true);
    try {
      console.log(formData);
      console.log(eventID);
      const response = await axios.post(
        `${BASE_URL}/users/freeRegister`,
        {
          formData,
          eventID,
        }
      );
      const email = formData.EMAIL;
      if (response.status === 201 || response.status === 200) {
        toast.success(response.data.message || "Registered successfully!");
        setPaymentSuccess(true);
        navigate(`/free-success/${eventID}/${encodeURIComponent(email)}`);
      } else {
        toast.error(response.data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Free registration error:", error);
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong during registration.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-gray-800 p-6  flex flex-col items-center justify-between">
      <div className="bg-white p-6 shadow-xl rounded-2xl max-w-2xl mx-auto">
        {event.companyPoster && (
          <div className="flex justify-center mb-4">
            <img
              src={event.companyPoster}
              alt="Company Poster"
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}
        <h2 className="text-4xl font-extrabold text-black mb-4 text-center">
          Register for {event.eventName}
        </h2>

        <div className="text-center text-gray-600 mb-6 space-y-2">
          {event.startDate && (
            <p className="flex justify-center items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="font-semibold">Date:</span>{" "}
              {event.endDate &&
                !isNaN(new Date(event.endDate)) &&
                new Date(event.startDate).toLocaleDateString() !== new Date(event.endDate).toLocaleDateString()
                ? `${new Date(event.startDate).toLocaleDateString()} - ${new Date(event.endDate).toLocaleDateString()}`
                : new Date(event.startDate).toLocaleDateString()}
            </p>
          )}
          {event.place && (
            <div className="flex justify-center items-center gap-2 text-sm sm:text-base">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-semibold">Location:</span>
              <span>{event.place}</span>
            </div>
          )}
          {event.time && (
            <p className="flex justify-center items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <span className="font-semibold">Time:</span> {event.time}
            </p>
          )}
        </div>

        <form className="space-y-6">
          {event.registrationFields
            .filter((field) => field.fieldName !== "ROLE")
            .map((field, idx) => (
              <div key={idx} className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {field.fieldName.charAt(0).toUpperCase() + field.fieldName.slice(1)}{" "}
                  {field.required && <span className="text-red-600">*</span>}
                </label>

                {field.fieldType === "text" && (
                  <input
                    type="text"
                    name={field.fieldName}
                    value={formData[field.fieldName] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {field.fieldType === "email" && (
                  <input
                    type="email"
                    name={field.fieldName}
                    value={formData[field.fieldName] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {field.fieldType === "number" && (
                  <input
                    type="number"
                    name={field.fieldName}
                    value={formData[field.fieldName] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {field.fieldType === "select" && (
                  <select
                    name={field.fieldName}
                    value={formData[field.fieldName] || ""}
                    onChange={handleChange}
                    required={field.required}
                    className="border rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select an option</option>
                    {field.options.map((option, optionIdx) => (
                      <option key={optionIdx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {field.fieldType === "checkbox" && (
                  <div className="flex flex-wrap items-center gap-2">
                    {field.options.map((option, optionIdx) => (
                      <label key={optionIdx} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          name={field.fieldName}
                          value={option}
                          checked={formData[field.fieldName]?.includes(option) || false}
                          onChange={handleChange}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Select Role <span className="text-red-600">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {event.eventRoles.map((role, idx) => {
                const remaining = Math.max(role.maxRegistrations - (roleRegistrations[role.roleName] || 0), 0);

                return (
                  <label
                    key={idx}
                    className="flex flex-col border rounded-xl p-3 hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="role"
                        value={role.roleName}
                        checked={formData.role === role.roleName}
                        onChange={handleChange}
                        required
                        disabled={remaining <= 0}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{role.roleName}</div>
                        <div className="text-sm font-bold text-green-600">{role.rolePrice === 0 ? "FREE" : `₹${role.rolePrice.toLocaleString("en-IN")}`}</div>
                      </div>
                    </div>

                    {role.roleDescription && (
                      <ul className="text-gray-600 text-sm mt-1 ml-6 list-disc pl-5">
                        {role.roleDescription.split(",").map((desc, index) => (
                          <li key={index}>{desc.trim()}</li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm mt-2 ml-6 text-gray-700">
                      <span><strong>Max Slots:</strong> {role.maxRegistrations}</span>
                      <span className={remaining <= 0 ? "text-red-600 font-bold" : ""}>
                        <strong>Remaining:</strong> {remaining}
                      </span>
                    </div>

                    {remaining <= 0 && <span className="text-red-600 text-xs ml-2">(Sold Out)</span>}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Payment Button */}
          {formData.role && !paymentSuccess && selectedRole && (() => {
            const rolePrice = parseFloat(selectedRole.rolePrice) || 0;

            if (rolePrice === 0) {
              return (
                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded-xl w-full bg-red-600 text-white hover:bg-red-700"
                  onClick={handleFreeRegistration}
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              );
            }
            const feeRate = admin?.category === 'Entertainment Events / concerts' ? 0.05 : 0.025;
            const rawPlatformFee = rolePrice * feeRate;
            const platformFee = Math.round(rawPlatformFee * 100) / 100;


            const totalAmount = rolePrice + platformFee;

            return (
              <>
                <div className="mb-4 text-black font-medium space-y-1 text-md">
                  <p className="flex justify-between">
                    <span>Amount:</span>
                    <span>₹{rolePrice.toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between text-[12px]">
                    <span>
                      Platform Fee (
                      {admin?.category === "Entertainment Events / concerts" ? "5%" : "2.5%"}
                      ):
                    </span>
                    <span>₹{platformFee.toFixed(2)}</span>
                  </p>
                  <hr className="my-1 border-blue-300" />
                  <p className="flex justify-between font-semibold text-xl">
                    <span>Total:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </p>
                </div>

                <button
                  type="button"
                  className="mt-4 px-4 py-2 rounded-xl w-full bg-red-600 text-white hover:bg-red-700"
                  onClick={handlePayment}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
                </button>
                <div className="flex items-center justify-center space-x-2 mt-5">
                  <ShieldCheck className="w-7 h-7 text-green-600" />
                  <p className="font-normal">Safe & Secure Payment</p>
                </div>
              </>
            );
          })()}


          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="text-gray-600 text-sm mb-2">Powered by</span>
            <Link to="/">
              <img src={logo} alt="Powered by logo" className="h-7 object-contain" />
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ManualReg;
