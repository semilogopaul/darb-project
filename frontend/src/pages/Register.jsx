import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import AuthNavbar from "../components/AuthNavbar";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    bank_name: "",
    account_number: "",
    user_type: "founder",
    bvn: "",
    identity_document: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      for (let key in formData) {
        if (formData[key]) {
          formDataToSend.append(
            key,
            key === "identity_document" ? formData[key] : formData[key].toString()
          );
        }
      }
      await api.post("/users/register/", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Registration successful! Please wait for approval.");
      navigate("/login");
    } catch (error) {
      console.error("Error:", error.response?.data);
      setErrors(error.response?.data || {});
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <AuthNavbar />
    <div className="min-h-screen flex items-center justify-center">
      <form
        className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create an Account
        </h2>
        {/* Username */}
        <div className="mb-4">
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
        {/* First & Last Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
          </div>
        </div>
        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            required
          />
        </div>
        {/* Password */}
        <div className="mb-4">
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
        {/* Bank Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bank Name
            </label>
            <input
              type="text"
              name="bank_name"
              value={formData.bank_name}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Number
            </label>
            <input
              type="text"
              name="account_number"
              value={formData.account_number}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
          </div>
        </div>
        {/* BVN */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">BVN</label>
          <input
            type="text"
            name="bvn"
            value={formData.bvn}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            required
          />
        </div>
        {/* Identity Document */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Identity Document
          </label>
          <input
            type="file"
            name="identity_document"
            onChange={handleChange}
            className="mt-1 block w-full text-gray-700 file:py-2 file:px-4 file:border file:rounded-md file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 hover:file:bg-gray-100"
            required
          />
        </div>
        {/* User Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">
            User Type
          </label>
          <select
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            required
          >
            <option value="founder">Founder</option>
            <option value="lender">Lender</option>
          </select>
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
          {loading ? "Registering..." : "Register"}
        </button>
        {/* Already have an account? */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
    </>
  );
};

export default Register;
