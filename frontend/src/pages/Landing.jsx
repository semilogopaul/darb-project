import React, { useState } from "react";
import { Link } from "react-router-dom";

const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow sticky top-0 z-50 rounded-lg my-4 mx-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img src="darb.svg" alt="Darb Logo" className="h-10 w-auto" />
            </Link>
          </div>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-green-600 hover:bg-green-50 border rounded-xl border-green-600 transition-all"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-white hover:bg-green-700 bg-green-600 transition-all rounded-xl"
            >
              Register
            </Link>
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
        <div className="md:hidden absolute right-4 top-20 w-40 bg-white rounded-md shadow-lg">
          <div className="py-1">
            <Link
              to="/login"
              className="block w-full text-left px-4 py-2 rounded hover:bg-green-50 transition-colors focus:outline-none"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block w-full text-left px-4 py-2 rounded hover:bg-green-50 transition-colors focus:outline-none"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <main className="flex flex-1 flex-col md:flex-row font-sans items-center justify-center px-6 py-12 bg-green-50 md:pl-13">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Empower Your Startup with Darb
          </h1>
          <p className="text-lg md:text-2xl text-gray-600 mb-8">
            A loan-based crowdfunding platform for Nigerian startups.
            Connect with passionate lenders and bring your ideas to life.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-4 md:space-y-0 md:space-x-6">
            <Link
              to="/register"
              className="px-8 py-4 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
        <div className="flex-1 mt-8 md:mt-0 flex justify-center">
          <img
            src="undraw_work-chat_hc3y.svg"
            alt="Darb Product"
            className="w-3/4 md:w-full max-w-md"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 p-4 shadow-inner">
        <p className="text-gray-500 text-center text-sm">
          &copy; {new Date().getFullYear()} Darb. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
