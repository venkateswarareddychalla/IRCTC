import React, { useState, useEffect } from "react";
import Header from "../components/Header";

export default function Passengers({ onLogout }) {
  const [passengers, setPassengers] = useState([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [berthPreference, setBerthPreference] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const res = await fetch("http://localhost:3000/my-passengers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setPassengers(data.passengers);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchPassengers();
  }, []);

  const handleAddPassenger = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/add-passenger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, age: parseInt(age), gender, berth_preference: berthPreference }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Passenger added successfully");
        setName("");
        setAge("");
        setGender("");
        setBerthPreference("");
        const fetchPassengers = async () => {
          try {
            const res = await fetch("http://localhost:3000/my-passengers", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const data = await res.json();
            if (data.success) {
              setPassengers(data.passengers);
            } else {
              setError(data.message);
            }
          } catch (err) {
            setError(err.message);
          }
        };
        fetchPassengers(); // Refresh list
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Header onLogout={onLogout} />
      <div className="w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center">My Passenger Master List</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Add New Passenger</h2>
            <form onSubmit={handleAddPassenger} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Berth Preference (optional)"
                value={berthPreference}
                onChange={(e) => setBerthPreference(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200">
                Add Passenger
              </button>
            </form>
            {message && <p className="text-green-500 mt-4">{message}</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Passenger List</h2>
            {passengers.length === 0 ? (
              <p className="text-gray-500">No passengers added yet.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {passengers.map((passenger) => (
                  <div key={passenger.id} className="border p-4 rounded-md shadow-sm bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg">{passenger.name}</p>
                        <p className="text-gray-600">Age: {passenger.age}</p>
                        <p className="text-gray-600">Gender: {passenger.gender}</p>
                        <p className="text-gray-600">Berth Preference: {passenger.berth_preference || "None"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
