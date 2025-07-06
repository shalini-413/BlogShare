import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import QuoteDetail from "./pages/QuoteDetail";
import PublicProfile from "./pages/PublicProfile";
import { Toaster } from "react-hot-toast";

function App() {
  const token = localStorage.getItem("token");

  return (
    <>
      {/* Toast container */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* App routing */}
      <Routes>
        <Route
          path="/"
          element={<Navigate to={token ? "/dashboard" : "/login"} />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pubprofile/:authorId/:blogId" element={<PublicProfile />} />
        <Route path="/quote/:id" element={<QuoteDetail />} />
      </Routes>
    </>
  );
}

export default App;
