import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Header from "../components/Header";

export default function Payment({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking_id } = location.state || {};
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  const handlePayment = () => {
    setShowPopup(true);
  };

  const confirmPayment = async () => {
    try {
      // First, get the booking details to retrieve class and quota
      const bookingRes = await fetch(`http://localhost:3000/my-bookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const bookingData = await bookingRes.json();
      if (!bookingData.success) {
        setError("Failed to retrieve booking details");
        setShowPopup(false);
        return;
      }
      const booking = bookingData.bookings.find(b => b.id == booking_id);
      if (!booking) {
        setError("Booking not found");
        setShowPopup(false);
        return;
      }

      const res = await fetch("http://localhost:3000/confirm-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ booking_id, class: booking.class, quota: booking.quota }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Your ticket was booked successfully!");
        navigate("/");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
    setShowPopup(false);
  };

  if (!booking_id) return <div>No booking selected</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Header onLogout={onLogout} />
      <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Payment</h2>
        <p>Booking ID: {booking_id}</p>
        <p>Total Amount: ₹500 (Mock)</p>

        <button onClick={handlePayment} className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 mt-4">
          Pay Now
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Confirm Payment</h3>
              <p>Simulated payment successful!</p>
              <div className="mt-4 flex space-x-4">
                <button onClick={confirmPayment} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                  Confirm
                </button>
                <button onClick={() => setShowPopup(false)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <button onClick={() => navigate("/book-ticket")} className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600">
          Back
        </button>
      </div>
    </div>
  );
}
