import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import InvoiceTemplate from "./InvoiceTemplate"; // Adjust path if needed


function PaymentSuccess() {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const [breakdown, setBreakdown] = useState(null);
  const [formData, setFormData] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [event, setEvent] = useState(null);
  const [admin, setAdmin] = useState(null);
  let totalAmount = 0;

  const eventID = localStorage.getItem("eventID");
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/events/${eventID}`);
        setEvent(response.data);
      } catch (error) {
        toast.error("Failed to fetch event details. Please try again.");
      }
    };

    if (eventID) {
      fetchEventDetails();
    } else {
      toast.error("No event selected.");
    }
  }, [eventID, BASE_URL]);

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!event?.companyName) return;

      try {
        const companyName = event.companyName;
        const adminRes = await axios.get(`${BASE_URL}/admin/get-admin/${companyName}`);
        setAdmin(adminRes.data);
        console.log("adminRes:", adminRes);
        console.log(adminRes.data);
      } catch (error) {
        console.error("Error fetching admin:", error);
      }
    };

    fetchAdmin();
  }, [event?.companyName, BASE_URL]);

  const generatePDF = () => {
    const element = document.getElementById("invoice");
    import("html2pdf.js").then((html2pdf) => {
      html2pdf.default().from(element).save("invoice.pdf");
    });
  };

  // Prepare the user object expected by InvoiceTemplate
  const user = formData
    ? {
      registrationData: formData,
      role: formData.role || formData.ROLE || "N/A",
      transactionId,
      paymentStatus: "Success", // or set dynamically if you have status
    }
    : null;


  let rolePrice = 0;
  let platformFee = 0;


  platformFee = totalAmount - rolePrice;
  useEffect(() => {
     if (!admin) return;
    const verifyAndRegister = async () => {
      const txnId = new URLSearchParams(window.location.search).get("transactionId");
      const storedFormData = JSON.parse(localStorage.getItem("formData"));
      totalAmount = Number(storedFormData.amount) || 0;
      const eventID = localStorage.getItem("eventID");

      if (!txnId || !storedFormData || !eventID) {
        toast.error("Missing payment or registration data.");
        navigate("/");
        return;
      }

      setTransactionId(txnId);
      localStorage.setItem("transactionID", txnId);
      setFormData(storedFormData);

      const amount = Number(storedFormData.amount) || 0;
      let platformFee = 0;
      let rolePrice = 0;

      const feeRate = admin?.category === 'Entertainment Events / concerts' ? 0.05 : 0.025;
      rolePrice = amount / (1 + feeRate);         
      platformFee = amount - rolePrice;           
      const userAmount = rolePrice;


      setBreakdown({
        amount: userAmount,
        platformFee,
        total: amount,
      });

      try {
        // Check for existing registration
        const checkEmailRes = await axios.post(`${BASE_URL}/users/check-email`, {
          email: storedFormData.email || storedFormData.EMAIL,
          eventId: eventID,
        });

        if (!checkEmailRes.data.exists) {
          toast.error("Please complete the payment before registration.");
          navigate("/");
          return;
        }

        // Proceed with registration
        await axios.post(`${BASE_URL}/users/register`, {
          formData: storedFormData,
          eventID,
          transactionId: txnId,
        });

        toast.success("Registration successful!");
        localStorage.removeItem("formData");
        localStorage.removeItem("eventID");
        navigate(`/success/${eventID}`);
      } catch (error) {
        toast.error("Error during registration.");
        console.error(error);
        navigate("/");
      }
    };

    verifyAndRegister();
  }, [admin]);

  return (
    <div className="p-6 max-w-xl mx-auto text-center text-lg font-sans bg-gray-50 min-h-screen">
      {breakdown && (
        <div className="text-left border border-gray-300 rounded-md p-6 shadow-sm mb-8 bg-white">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Payment Breakdown</h3>
          <div className="flex justify-between py-2 text-gray-700">
            <span>Amount</span>
            <span>₹{breakdown.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-gray-700">
            <span>
              Platform Fee (
              {admin?.category === "Entertainment Events / concerts" ? "5%" : "2.5%"}
              ):
            </span>
            <span>₹{breakdown.platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-gray-300 mt-4 pt-3 text-gray-900 text-lg">
            <span>Total Amount</span>
            <span>₹{breakdown.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {user && (
        <>
          <InvoiceTemplate user={user} category={admin?.category?.trim() || ""} />
          <button
            className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md"
            onClick={generatePDF}
          >
            Download Invoice as PDF
          </button>
        </>
      )}
    </div>
  );
}

export default PaymentSuccess;
