import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function BookTicket({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { train } = location.state || {};
  const [passengers, setPassengers] = useState([]);
  const [masterPassengers, setMasterPassengers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedQuota, setSelectedQuota] = useState("");
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMasterPassengers = async () => {
      try {
        const res = await fetch("http://localhost:3000/my-passengers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setMasterPassengers(data.passengers);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMasterPassengers();
  }, []);
  const selectedClassData = useMemo(() => {
    if (!train || !selectedClass || !selectedQuota) return null;
    return train.classes.find(cls => cls.class === selectedClass && cls.quota === selectedQuota);
  }, [train, selectedClass, selectedQuota]);

  const totalFare = useMemo(() => {
    const totalPassengers = selectedPassengers.length + passengers.length;
    const baseFare = selectedClassData ? parseFloat(selectedClassData.fare) || 0 : 0;
    return totalPassengers * baseFare;
  }, [selectedPassengers, passengers, selectedClassData]);

  const addPassenger = () => {
    setPassengers([...passengers, { id: "", name: "", age: "", gender: "", isEditing: true }]);
  };

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const savePassenger = async (index) => {
    const passenger = passengers[index];
    if (!passenger.name || !passenger.age || !passenger.gender) {
      setError("Please fill all fields for the passenger.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/add-passenger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: passenger.name,
          age: parseInt(passenger.age),
          gender: passenger.gender,
          berth_preference: passenger.berth_preference || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Add to master passengers
        setMasterPassengers([...masterPassengers, { id: data.passenger_id, name: passenger.name, age: passenger.age, gender: passenger.gender, berth_preference: passenger.berth_preference }]);
        // Remove from local passengers
        const updated = passengers.filter((_, i) => i !== index);
        setPassengers(updated);
        setError("");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelPassenger = (index) => {
    const updated = passengers.filter((_, i) => i !== index);
    setPassengers(updated);
  };

  const handleBook = async () => {
    if (!selectedClass || !selectedQuota) {
      setError("Please select class and quota.");
      return;
    }
    // Combine selected master passengers and new passengers
    const allPassengerIds = [...selectedPassengers, ...passengers.map(p => p.id || "1")].join(","); // Mock for new ones
    try {
      const res = await fetch("http://localhost:3000/book-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          train_id: train.id,
          passenger_ids: allPassengerIds,
          class: selectedClass,
          quota: selectedQuota
        }),
      });
      const data = await res.json();
      if (data.success) {
        navigate("/payment", { state: { booking_id: data.booking_id } });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!train) return <div>No train selected</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Header onLogout={onLogout} />
      <div className="w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Book Ticket for {train.train_number}</h2>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Select Class and Quota</h3>
          <div className="grid grid-cols-2 gap-4">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Class</option>
              {train.classes.map((cls, idx) => (
                <option key={idx} value={cls.class}>{cls.class}</option>
              ))}
            </select>
            <select
              value={selectedQuota}
              onChange={(e) => setSelectedQuota(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Quota</option>
              {train.classes.filter(cls => cls.class === selectedClass).map((cls, idx) => (
                <option key={idx} value={cls.quota}>{cls.quota}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-lg mb-4">Total Fare: ₹{totalFare.toFixed(2)}</p>

        <div className="mb-4">
          <h3 className="text-lg font-semibold">Select from Master Passengers</h3>
          {masterPassengers.map((p) => (
            <div key={p.id} className="flex items-center mt-2 p-2 border rounded-md">
              <input
                type="checkbox"
                checked={selectedPassengers.includes(p.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedPassengers([...selectedPassengers, p.id]);
                  } else {
                    setSelectedPassengers(selectedPassengers.filter(id => id !== p.id));
                  }
                }}
                className="mr-2"
              />
              <span>{p.name} ({p.age}, {p.gender})</span>
            </div>
          ))}
          <h3 className="text-lg font-semibold mt-4">Or Add New Passengers</h3>
          {passengers.map((p, index) => (
            <div key={index} className="border p-4 rounded-md mt-2">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={p.name}
                  onChange={(e) => updatePassenger(index, "name", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={p.age}
                  onChange={(e) => updatePassenger(index, "age", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                />
                <select
                  value={p.gender}
                  onChange={(e) => updatePassenger(index, "gender", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => savePassenger(index)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                  Save
                </button>
                <button onClick={() => cancelPassenger(index)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                  Cancel
                </button>
              </div>
            </div>
          ))}
          <button onClick={addPassenger} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Add New Passenger
          </button>
          <button onClick={() => navigate("/passengers")} className="mt-2 ml-2 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600">
            Manage Master Passengers
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button onClick={handleBook} className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600">
          Proceed to Payment
        </button>

        <button onClick={() => navigate("/search-trains")} className="mt-4 w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600">
          Back
        </button>
      </div>
    </div>
  );
}
