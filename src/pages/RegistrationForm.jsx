import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AlertTriangle, MapPin, Calendar, Clock, Timer } from 'lucide-react'
import { useParams, useNavigate } from "react-router-dom";
import logo from '../assets/stagyn_black.png'
import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom';


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

function RegistrationForm() {
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({});
  const [roleRegistrations, setRoleRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [countdown, setCountdown] = useState("");

  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const { eventID } = useParams();

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${eventID}`);
        setEvent(response.data);

        // Check if toggleField or togglefield exists in event data
        if (
          !response.data.hasOwnProperty("toggleForm") &&
          !response.data.hasOwnProperty("toggleform")
        ) {
          setFormVisible(false);
        } else {
          setFormVisible(!response.data.toggleForm);
        }

        const regRes = await axios.get(
          `${BASE_URL}/users/${eventID}/role-registrations`
        );
        setRoleRegistrations(regRes.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to fetch event details. Please try again.");
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

  useEffect(() => {
    if (!event?.startDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(event.startDate);
      const diff = start - now;

      if (diff <= 0) {
        setCountdown("Event Started");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown(`${days}D : ${hours}H : ${minutes}M : ${seconds}S`);
    }, 1000);

    return () => clearInterval(interval);
  }, [event?.startDate]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name] || []), value]
          : (prev[name] || []).filter((v) => v !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (loading)
    return (
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

  if (!event)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75L14.25 14.25M9.75 14.25L14.25 9.75M12 21.75C6.615 21.75 2.25 17.385 2.25 12S6.615 2.25 12 2.25 21.75 6.615 21.75 12 17.385 21.75 12 21.75z"
          />
        </svg>
        <p className="text-xl text-gray-300">No event found.</p>
      </div>
    );
  const today = new Date();
  const isFormExpired = event.startDate && today > new Date(event.startDate);
  if (!formVisible || isFormExpired)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-4">
        <div className="bg-white rounded-2xl p-10 shadow-2xl max-w-lg w-full text-center space-y-5">
          <div className="flex justify-center">
            <div className="bg-red-100 text-red-600 p-4 rounded-full shadow-md">
              <AlertTriangle className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Oops! Form is Closed</h2>
          <p className="text-gray-600 text-base">
            We're sorry, but registration for this event is currently closed. Please check back later or contact the organizer for more info.
          </p>
          <button
            className="mt-4 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-full transition duration-200"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );

  const otherFields = event.registrationFields.filter(
    (field) => field.fieldName !== "ROLE"
  );
  const roleField = event.registrationFields.find(
    (field) => field.fieldName === "ROLE"
  );
  const selectedRole = event.eventRoles?.find(
    (role) => role.roleName === formData[roleField?.fieldName]
  );
  const rolePrice = selectedRole?.rolePrice || 0;

  const handlePayment = async () => {
    if (!formData[roleField?.fieldName]) {
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
      const checkRes = await axios.post(`${BASE_URL}/users/check-email`, {
        email: formData.EMAIL || formData.email,
        eventId: eventID,
      });

      if (checkRes.data.exists) {
        toast.error("You have already registered for this event with this email.");
        return;
      }

      const feePercent = admin?.category === "Entertainment Events / concerts" ? 5 : 2.5;
      const rawPlatformFee = (rolePrice * feePercent) / 100;
      const platformFee = Math.round(rawPlatformFee * 100) / 100;
      const calculatedAmount = parseFloat((rolePrice + platformFee).toFixed(2));

      const updatedFormData = {
        ...formData,
        amount: calculatedAmount,
      };
      localStorage.setItem("formData", JSON.stringify(updatedFormData));
      localStorage.setItem("eventID", eventID);

      const res = await axios.post(`${BASE_URL}/api/phonepe/initiate-payment`, {
        amount: calculatedAmount,
        email: formData.EMAIL,
        eventId: eventID,
      });

      const { redirectUrl } = res.data;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        toast.error("Failed to get PhonePe payment URL.");
      }
    } catch (err) {
      toast.error("Fill all the required fields or Payment initiation failed");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
      setIsLoading(false);
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
    <div className="bg-gray-100 overflow-x-hidden">
      <div className="bg-gray-100 p-6 flex flex-col lg:flex-row relative">

        {/* 🖼️ Poster Card on Left */}
        {event.companyPoster && (
          <div className="w-full lg:mr-[432px] bg-gray-100 shadow-lg rounded-xl p-4 mt-2 h-fit">
            <img
              src={event.companyPoster}
              alt="Company Poster"
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        )}

        {/* 📝 Registration Content */}
        <div
          className="w-full max-w-md mx-auto lg:w-[400px] bg-white p-4 shadow-lg overflow-y-auto flex flex-col 
      lg:mt-0 mt-6 border border-gray-400 rounded-xl
      lg:fixed lg:right-4 lg:top-4 lg:h-[90vh]"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black mb-4 text-center lg:text-left">
            {event.eventName}
          </h2>

          <div className="flex flex-col gap-4 text-sm sm:text-base text-gray-600 mb-6 mt-4">
            {event.startDate && (
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="font-semibold">Date:</span>{" "}
                {event.endDate &&
                  new Date(event.startDate).toDateString() !==
                  new Date(event.endDate).toDateString()
                  ? `${new Date(event.startDate).toLocaleDateString()} - ${new Date(
                    event.endDate
                  ).toLocaleDateString()}`
                  : new Date(event.startDate).toLocaleDateString()}
              </p>
            )}

            {event.time && (
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-semibold">Time:</span> {event.time}
              </p>
            )}

            {event.place && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span className="font-semibold">Location:</span>
                <span>{event.place}</span>
              </div>
            )}

            {countdown && (
              <div className="flex flex-col items-start gap-1 text-gray-600 font-semibold">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  <span>Event Starts In:</span>
                </div>
                <div className="ml-6 mt-2 text-xl text-black font-semibold">
                  {countdown}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-300 space-y-2">
            <p className="text-gray-600 font-semibold">Hosted By</p>
            <p className="text-black text-lg">{event.companyName}</p>
          </div>
        </div>
      </div>



      <div className="bg-white p-4 sm:p-6 shadow-[0_4px_24px_rgba(107,114,128,0.2)] rounded-2xl w-full 
  max-w-full lg:w-[550px] xl:w-[960px] lg:ml-6 mx-auto">
        <form className="w-full">
          {/* Custom Fields */}
          {otherFields.map((field, idx) => (
            <div key={idx} className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                {field.fieldName.charAt(0).toUpperCase() +
                  field.fieldName.slice(1)}{" "}
                {field.required && <span className="text-red-600">*</span>}
              </label>

              {["text", "email", "number"].includes(field.fieldType) && (
                <input
                  type={field.fieldType}
                  name={field.fieldName}
                  value={formData[field.fieldName] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="border rounded px-3 py-1.5 w-full text-sm"
                />
              )}

              {field.fieldType === "select" && (
                <select
                  name={field.fieldName}
                  value={formData[field.fieldName] || ""}
                  onChange={handleChange}
                  required={field.required}
                  className="border rounded px-3 py-1.5 w-full text-sm"
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
                <div className="flex flex-col gap-2">
                  {field.options.map((option, idx) => (
                    <label
                      key={idx}
                      className="inline-flex items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        name={field.fieldName}
                        value={option}
                        checked={
                          formData[field.fieldName]?.includes(option) || false
                        }
                        onChange={handleChange}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Role Selection */}
          {roleField && (
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                {roleField.fieldName.charAt(0).toUpperCase() +
                  roleField.fieldName.slice(1)}{" "}
                {roleField.required && (
                  <span className="text-red-600">*</span>
                )}
              </label>
              <div className="flex flex-col gap-3">
                {roleField.options.map((option, idx) => {
                  const matchingRole = event.eventRoles?.find(
                    (role) => role.roleName === option
                  );
                  const price = matchingRole?.rolePrice || 0;
                  const remaining = Math.max(
                    matchingRole?.maxRegistrations -
                    (roleRegistrations[matchingRole?.roleName] || 0),
                    0
                  );

                  return (
                    <label
                      key={idx}
                      className={`flex flex-col border rounded p-3 transition cursor-pointer ${remaining <= 0
                        ? "opacity-50 cursor-not-allowed bg-gray-100"
                        : "hover:shadow-lg"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={roleField.fieldName}
                          value={option}
                          checked={formData[roleField.fieldName] === option}
                          onChange={handleChange}
                          required={roleField.required}
                          disabled={remaining <= 0}
                        />
                        <span className="font-medium">{option}</span>
                        <span className="text-sm text-blue-600 font-semibold ml-auto">
                          {price === 0
                            ? "FREE"
                            : `₹${price.toLocaleString("en-IN")}`}
                        </span>
                      </div>

                      {matchingRole?.roleDescription && (
                        <ul className="text-gray-600 text-sm mt-1 ml-6 list-disc pl-5">
                          {matchingRole.roleDescription
                            .split(",")
                            .map((desc, index) => (
                              <li key={index}>{desc.trim()}</li>
                            ))}
                        </ul>
                      )}

                      {remaining <= 0 && (
                        <span className="text-red-600 text-xs font-bold mt-1">
                          (Sold Out)
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Section */}
          {!paymentSuccess && formData[roleField?.fieldName] && selectedRole && (
            (() => {
              const rolePrice = parseFloat(selectedRole.rolePrice);
              const feeRate =
                admin?.category === "Entertainment Events / concerts"
                  ? 0.05
                  : 0.025;
              const platformFee = Math.round(rolePrice * feeRate * 100) / 100;
              const totalAmount = rolePrice + platformFee;

              return (
                <div className="mb-4 text-black font-medium space-y-1 text-md">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>
                      {rolePrice === 0
                        ? "Free"
                        : `₹${rolePrice.toFixed(2)}`}
                    </span>
                  </div>
                  {rolePrice !== 0 && (
                    <>
                      <div className="flex justify-between text-[13px]">
                        <span>
                          Platform Fee ({feeRate * 100}%):
                        </span>
                        <span>₹{platformFee.toFixed(2)}</span>
                      </div>
                      <hr className="my-1 border-blue-300" />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total:</span>
                        <span>₹{totalAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  {rolePrice === 0 ? (
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 rounded-lg w-full bg-red-600 text-white hover:bg-red-700"
                      onClick={handleFreeRegistration}
                      disabled={isLoading}
                    >
                      {isLoading ? "Registering..." : "Register"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 rounded-lg w-full bg-red-600 text-white hover:bg-red-700"
                      onClick={handlePayment}
                      disabled={isLoading}
                    >
                      {isLoading
                        ? "Processing..."
                        : `Pay ₹${totalAmount.toFixed(2)}`}
                    </button>
                  )}

                  <div className="flex items-center justify-center space-x-2 mt-5">
                    <ShieldCheck className="w-6 h-6 text-green-600" />
                    <p className="text-[15px]">Safe & Secure Payment</p>
                  </div>
                </div>
              );
            })()
          )}

          {/* Branding */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="text-gray-600 text-sm mb-2">Powered by</span>
            <Link to="/">
              <img
                src={logo}
                alt="Powered by logo"
                className="h-7 object-contain"
              />
            </Link>
          </div>
        </form>
      </div>
      <br />

    </div>
  );
}

export default RegistrationForm;
