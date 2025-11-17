import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Profile({ onLogout }) {
  const [user, setUser] = useState(null);
  const [berthPreference, setBerthPreference] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:3000/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setBerthPreference(data.user.berth_preference || "");
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProfile();

    const fetchPaymentMethods = async () => {
      try {
        const res = await fetch("http://localhost:3000/get-payment-methods", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setPaymentMethods(data.paymentMethods);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPaymentMethods();
  }, [token]);

  const handleSavePassenger = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/save-passenger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ berth_preference: berthPreference }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Passenger details saved");
        // Update the user state to reflect the change immediately
        setUser({ ...user, berth_preference: berthPreference });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/add-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: paymentType, details: paymentDetails }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Payment method added");
        setPaymentType("");
        setPaymentDetails("");
        // Refresh payment methods to show the new one immediately
        const refreshRes = await fetch("http://localhost:3000/get-payment-methods", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setPaymentMethods(refreshData.paymentMethods);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Header onLogout={onLogout} />
      <div className="w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate("/")} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 font-semibold shadow-md">
            Back to Home
          </button>
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">User Profile</h2>
            <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <span className="font-medium text-gray-600">Name:</span>
              <span className="text-gray-800">{user.name}</span>
              <span className="font-medium text-gray-600">Email:</span>
              <span className="text-gray-800">{user.email}</span>
              <span className="font-medium text-gray-600">Age:</span>
              <span className="text-gray-800">{user.age}</span>
              <span className="font-medium text-gray-600">Gender:</span>
              <span className="text-gray-800">{user.gender}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Current Preferences
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Berth Preference:</span>
                <span className="text-gray-800">{user.berth_preference || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Payment Methods:</span>
                <span className="text-gray-800">{paymentMethods.length > 0 ? paymentMethods.map(pm => `${pm.type}: ${pm.details}`).join(', ') : 'None added'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSavePassenger} className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Update Passenger Details
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Berth Preference</label>
              <select
                value={berthPreference}
                onChange={(e) => setBerthPreference(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              >
                <option value="">Select Berth Preference</option>
                <option value="Lower">Lower</option>
                <option value="Middle">Middle</option>
                <option value="Upper">Upper</option>
                <option value="Side Lower">Side Lower</option>
                <option value="Side Upper">Side Upper</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-semibold shadow-md">
              Save Passenger Details
            </button>
          </form>

          <form onSubmit={handleAddPayment} className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Add Payment Method
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              >
                <option value="">Select Type</option>
                <option value="debit">Debit Card</option>
                <option value="credit">Credit Card</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Details</label>
              <input
                type="text"
                placeholder="e.g., card number or UPI ID"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
              />
            </div>
            <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200 font-semibold shadow-md">
              Add Payment Method
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}


      </div>
    </div>
  );
}
