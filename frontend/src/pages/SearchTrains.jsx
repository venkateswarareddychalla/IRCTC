import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function SearchTrains({ onLogout }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [trains, setTrains] = useState([]);
  const [allTrains, setAllTrains] = useState([]);
  const [error, setError] = useState("");
  const [showNoTrainsMessage, setShowNoTrainsMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllTrains = async () => {
      try {
        const res = await fetch("http://localhost:3000/get-trains");
        const data = await res.json();
        if (data.success) {
          setAllTrains(data.trains);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllTrains();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setShowNoTrainsMessage(false);
    try {
      const res = await fetch(`http://localhost:3000/search-trains?origin=${origin}&destination=${destination}&date=${date}`);
      const data = await res.json();
      if (data.success) {
        setTrains(data.trains);
        if (data.trains.length === 0) {
          setShowNoTrainsMessage(true);
          setTimeout(() => setShowNoTrainsMessage(false), 5000);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBook = (train) => {
    navigate("/book-ticket", { state: { train } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <Header onLogout={onLogout} />
      <div className="w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate("/")} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 font-semibold shadow-md">
            Back to Home
          </button>
          <div className="text-center flex-1">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Search Trains</h2>
            <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full"></div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            Search for Trains
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origin</label>
              <input
                type="text"
                placeholder="e.g., Mumbai"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <input
                type="text"
                placeholder="e.g., Delhi"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
          </div>
          <button type="submit" className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-semibold shadow-md">
            Search Trains
          </button>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {showNoTrainsMessage && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            No trains found matching your search criteria.
          </div>
        )}

        {trains.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Available Trains
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {trains.map((train) => (
                <div key={train.id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Train {train.train_number}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="font-medium text-gray-600">Origin:</span>
                      <span className="text-gray-800">{train.origin}</span>
                      <span className="font-medium text-gray-600">Destination:</span>
                      <span className="text-gray-800">{train.destination}</span>
                      <span className="font-medium text-gray-600">Date:</span>
                      <span className="text-gray-800">{train.date}</span>
                      <span className="font-medium text-gray-600">Class:</span>
                      <span className="text-gray-800">{train.class}</span>
                      <span className="font-medium text-gray-600">Quota:</span>
                      <span className="text-gray-800">{train.quota}</span>
                      <span className="font-medium text-gray-600">Seats Available:</span>
                      <span className="text-gray-800">{train.seats_available}</span>
                      <span className="font-medium text-gray-600">Price:</span>
                      <span className="text-gray-800">₹{train.fare}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook(train)}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200 font-semibold shadow-md"
                  >
                    Book This Train
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            All Available Trains
          </h3>
          {allTrains.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allTrains.map((train) => (
                <div key={train.id} className="bg-white border border-gray-200 p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Train {train.train_number}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="font-medium text-gray-600">Origin:</span>
                      <span className="text-gray-800">{train.origin}</span>
                      <span className="font-medium text-gray-600">Destination:</span>
                      <span className="text-gray-800">{train.destination}</span>
                      <span className="font-medium text-gray-600">Date:</span>
                      <span className="text-gray-800">{train.date}</span>
                      <span className="font-medium text-gray-600">Class:</span>
                      <span className="text-gray-800">{train.class}</span>
                      <span className="font-medium text-gray-600">Quota:</span>
                      <span className="text-gray-800">{train.quota}</span>
                      <span className="font-medium text-gray-600">Seats Available:</span>
                      <span className="text-gray-800">{train.seats_available}</span>
                      <span className="font-medium text-gray-600">Price:</span>
                      <span className="text-gray-800">₹{train.fare}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBook(train)}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200 font-semibold shadow-md"
                  >
                    Book This Train
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No trains available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
