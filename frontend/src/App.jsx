import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";



// Protected Route wrapper
function PrivateRoute({ children, token }) {
  return token ? children : <Navigate to="/login" />;
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

        {/* Fallback route */}
        <Route
          path="*"
          element={<Navigate to={token ? "/" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
