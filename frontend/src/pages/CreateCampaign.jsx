import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";

const CreateCampaign = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    goal_amount: "",
    interest_rate: "",
    repayment_period: "",
    image: null,
    cac_d_img: null,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const campaignData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        campaignData.append(key, formData[key]);
      }
    });
    try {
      await api.post("/campaigns/create/", campaignData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Campaign created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create campaign"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Campaign
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Campaign Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="Campaign Title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Goal Amount
              </label>
              <input
                type="number"
                name="goal_amount"
                placeholder="(naira)"
                value={formData.goal_amount}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Interest Rate (%)
              </label>
              <input
                type="number"
                name="interest_rate"
                placeholder="(percentage)"
                value={formData.interest_rate}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Repayment Period
              </label>
              <input
                type="number"
                name="repayment_period"
                placeholder="(months)"
                value={formData.repayment_period}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Campaign Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-gray-700 file:py-2 file:px-4 file:border file:rounded-md file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 hover:file:bg-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              CAC Document Image
            </label>
            <input
              type="file"
              name="cac_d_img"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full text-gray-700 file:py-2 file:px-4 file:border file:rounded-md file:border-gray-300 file:text-sm file:font-medium file:bg-gray-50 hover:file:bg-gray-100"
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
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaign;
