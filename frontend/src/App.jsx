import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import SearchTrains from "./pages/SearchTrains";
import BookTicket from "./pages/BookTicket";
import Payment from "./pages/Payment";
import Confirmation from "./pages/Confirmation";
import Passengers from "./pages/Passengers";
import Header from "./components/Header";



// Protected Route wrapper
function PrivateRoute({ children, token }) {
  return token ? children : <Navigate to="/login" />;
}

// Public Route wrapper
function PublicRoute({ children }) {
  return children;
}

export default function App() {
  const [token, setToken] = React.useState(localStorage.getItem("token") || null);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Login Page */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        {/* Home Page */}
        <Route
          path="/"
          element={
            <PrivateRoute token={token}>
              <Home onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* Profile Page */}
        <Route
          path="/profile"
          element={
            <PrivateRoute token={token}>
              <Profile onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* Search Trains Page */}
        <Route
          path="/search-trains"
          element={
            <PrivateRoute token={token}>
              <SearchTrains onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* Book Ticket Page */}
        <Route
          path="/book-ticket"
          element={
            <PrivateRoute token={token}>
              <BookTicket onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* Payment Page */}
        <Route
          path="/payment"
          element={
            <PrivateRoute token={token}>
              <Payment onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* Confirmation Page */}
        <Route
          path="/confirmation"
          element={
            <PrivateRoute token={token}>
              <Confirmation onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* Passengers Page */}
        <Route
          path="/passengers"
          element={
            <PrivateRoute token={token}>
              <Passengers onLogout={handleLogout} />
            </PrivateRoute>
          }
        />

        {/* Fallback route */}
        <Route
          path="*"
          element={<Navigate to={token ? "/" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
