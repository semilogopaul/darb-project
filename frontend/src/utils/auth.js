export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";

// Get access token
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN);

// Get refresh token
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN);

// Check if user is authenticated
export const isAuthenticated = () => !!getAccessToken();

// Logout function
export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  window.location.href = "/login"; // Redirect to login
};
