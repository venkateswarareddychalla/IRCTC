import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking_id } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Booking Confirmed!</h2>
        <p>Booking ID: {booking_id}</p>
        <p>Your ticket has been booked successfully.</p>

        <button onClick={() => navigate("/")} className="mt-4 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
          Back to Home
        </button>
      </div>
    </div>
  );
}
