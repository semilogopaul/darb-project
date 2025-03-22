import axios from "axios";

const API_BASE_URL = "https://localhost:8000/api"; 

export const fetchCampaigns = async (search = "") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/campaigns/campaign/search/?search=${search}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
};

export const createCampaign = async (campaignData) => {
  try {
    const token = localStorage.getItem("accessToken");
    const response = await axios.post(`${API_BASE_URL}/campaign/create/`, campaignData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
};
