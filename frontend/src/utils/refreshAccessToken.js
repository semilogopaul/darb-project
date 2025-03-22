import axios from "axios";

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/users/refresh/`,
      { refresh: refreshToken }
    );

    localStorage.setItem("access_token", response.data.access);
    return response.data.access;
  } catch (error) {
    console.error("Token refresh failed, redirecting to login.");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    return null;
  }
};

export default refreshAccessToken;
