import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateCampaign from "./pages/CreateCampaign";
import CampaignDetail from "./pages/CampaignDetail";
import Landing from "./pages/Landing"; // your landing page, if any
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes wrapped in AuthenticatedLayout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create-campaign" element={<CreateCampaign />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
