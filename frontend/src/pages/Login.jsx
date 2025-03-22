import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import AuthNavbar from "../components/AuthNavbar";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const response = await api.post("/users/login/", formData);
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error.response?.data);
      setErrors(error.response?.data || {});
      toast.error(
        error.response?.data?.message ||
          "Not Approved / Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <AuthNavbar />
    <div className="min-h-screen flex items-center justify-center -mt-11">
      <form
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back!
        </h2>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            loading
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 transition-colors"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {/* Additional Link */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-green-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </div>
    </>
  );
};

export default Login;
