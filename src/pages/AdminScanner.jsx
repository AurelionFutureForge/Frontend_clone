import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode } from "lucide-react";

function AdminScanner() {
  const location = useLocation();
  const [scanResult, setScanResult] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [scanFailed, setScanFailed] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [lastScanned, setLastScanned] = useState({ text: "", timestamp: 0 });

  const html5QrCodeRef = useRef(null);
  const isProcessingRef = useRef(false);
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const startScanner = () => {
    const qrRegionId = "qr-reader";
    const config = { fps: 10, qrbox: { width: 300, height: 300 } };

    const qrCodeSuccessCallback = async (decodedText) => {
      const now = Date.now();
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      if (decodedText === lastScanned.text && now - lastScanned.timestamp < 3000) {
        isProcessingRef.current = false;
        return;
      }

      setLastScanned({ text: decodedText, timestamp: now });
      setScanResult(decodedText);

      await stopScanner();
      await verifyQRCode(decodedText);
      isProcessingRef.current = false;
    };

    html5QrCodeRef.current = new Html5Qrcode(qrRegionId);
    html5QrCodeRef.current
      .start({ facingMode: "environment" }, config, qrCodeSuccessCallback)
      .catch((err) => {
        console.error("Failed to start QR scanner:", err);
        toast.error("Failed to start QR scanner");
      });
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current?.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error("Failed to stop QR scanner:", err);
      }
    }
    setShowScanner(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const verifyQRCode = async (qrCode) => {
    try {
      const token = localStorage.getItem("privilegeToken");
      const privilegeName = localStorage.getItem("privilegeName");
      const eventName = localStorage.getItem("eventName");
      const eventId = localStorage.getItem("eventId");

      if (!token || !privilegeName) {
        toast.error("Missing privilege credentials. Please log in again.");
        setScanFailed(true);
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/scan/verify`,
        { qrCode, privilegeName, eventId, eventName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        setVerifiedUser(response.data.user);
        setScanFailed(false);
        toast.success(response.data.message);
      } else {
        setVerifiedUser(null);
        setScanFailed(true);
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(  err?.response?.data?.message || "Invalid QR Code or already claimed!");
      setVerifiedUser(null);
      setScanFailed(true);
    }
  };

  const handleScanNext = () => {
    setScanResult(null);
    setVerifiedUser(null);
    setScanFailed(false);
    setLastScanned({ text: "", timestamp: 0 });
    isProcessingRef.current = false;
    setShowScanner(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 rounded-xl">
      <div className="bg-white p-6 shadow-lg rounded-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">QR Code Scanner</h2>

        <div className="relative w-full min-h-[200px]">
          {showScanner && (
            <div
              id="qr-reader"
              className="w-full"
              ref={(el) => {
                if (el && !html5QrCodeRef.current?.isScanning) {
                  startScanner();
                }
              }}
            />
          )}

          {!verifiedUser && !scanFailed && !showScanner && (
            <button
              onClick={handleScanNext}
              className="absolute left-1/2 bottom-[62px] transform -translate-x-1/2 bg-white text-black border border-black cursor-pointer rounded-full p-4 shadow-lg hover:bg-blue-50 transition"
              title="Start Scanner"
            >
              <QrCode className="w-12 h-12" />
            </button>
          )}
        </div>

        {/* ✅ Success */}
        {verifiedUser && (
          <div className="bg-gray-200 p-4 rounded-lg shadow-md">
            <div className="bg-white p-3 rounded-md shadow">
              <h3 className="text-lg font-bold">
                {verifiedUser.name} ({verifiedUser.role})
              </h3>
              <div className="mt-4 text-green-700 font-semibold">
                Privilege Claimed Successfully!
              </div>
              <button
                onClick={handleScanNext}
                className="mt-4 w-full px-4 py-2 rounded bg-blue-500 cursor-pointer hover:bg-blue-600 text-white shadow"
              >
                Scan Next QR
              </button>
            </div>
          </div>
        )}

        
        {scanFailed && !verifiedUser && (
          <div className="bg-red-100 p-4 rounded-lg shadow-md">
            <p className="text-red-700 font-semibold">Invalid QR Code!</p>
            <button
              onClick={handleScanNext}
              className="mt-3 w-full px-4 py-2 rounded cursor-pointer bg-red-500 hover:bg-red-600 text-white shadow"
            >
              Scan Next QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminScanner;
