import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header({ onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-bold">IRCTC</h1>
        <nav className="flex space-x-4">
          <button onClick={() => navigate("/profile")} className="hover:bg-blue-700 px-3 py-2 rounded-md transition duration-200">
            User Profile
          </button>
          <button onClick={() => navigate("/search-trains")} className="hover:bg-blue-700 px-3 py-2 rounded-md transition duration-200">
            Search Trains
          </button>
          <button onClick={() => navigate("/passengers")} className="hover:bg-blue-700 px-3 py-2 rounded-md transition duration-200">
            My Passengers
          </button>
          <button onClick={() => navigate("/admin")} className="hover:bg-blue-700 px-3 py-2 rounded-md transition duration-200">
            Admin
          </button>
          {onLogout && (
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md transition duration-200">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
