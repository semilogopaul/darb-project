import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine whether to show the navbar based on the current route.
  const noNavbarPaths = ["/", "/login", "/register"];
  const showNavbar = !noNavbarPaths.includes(location.pathname);

  // Always call the endpoint when the component mounts.
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me/");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to fetch user details.");
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return (
    <>
      {showNavbar && (
        <nav className="bg-white shadow sticky top-0 z-50 rounded-lg my-4 mx-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link to="/dashboard">
                  <img src="/darb.svg" alt="Darb Logo" className="h-10 w-auto" />
                </Link>
              </div>
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-4">
                {user && (
                  <button
                    disabled
                    className="px-4 py-2 text-black rounded cursor-not-allowed opacity-75"
                  >
                    {user.username}🤑
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors focus:outline-none"
                >
                  Logout
                </button>
              </div>
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                >
                  <span className="sr-only">Open menu</span>
                  {mobileMenuOpen ? (
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute right-4 top-20 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {user && (
                  <button
                    disabled
                    className="block w-full text-left px-4 py-2 rounded text-black font-bold cursor-not-allowed opacity-75"
                  >
                    {user.username}🤑
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 rounded hover:bg-green-50 transition-colors focus:outline-none"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </nav>
      )}
    </>
  );
};

export default Navbar;
