import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Home({ onLogout }) {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("http://localhost:3000/my-bookings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setBookings(data.bookings);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Header onLogout={onLogout} />
      <div className="w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to IRCTC!</h1>

        <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                <p className="mb-2"><strong>Booking ID:</strong> {booking.id}</p>
                <p className="mb-2"><strong>Train:</strong> {booking.train_number}</p>
                <p className="mb-2"><strong>Route:</strong> {booking.origin} to {booking.destination}</p>
                <p className="mb-2"><strong>Date:</strong> {booking.date}</p>
                 <p className="mb-2"><strong>Class:</strong> {booking.class}</p>
                <p className="mb-2"><strong>Quota:</strong> {booking.quota}</p>
                <p className="mb-2"><strong>Status:</strong> <span className={`font-semibold ${booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>{booking.status}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
