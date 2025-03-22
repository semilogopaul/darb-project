import React from "react";
import { Link } from "react-router-dom";

const AuthNavbar = () => {
  return (
    <nav className="bg-white shadow sticky top-0 z-50 rounded-lg my-4 mx-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo only */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img src="/darb.svg" alt="Darb Logo" className="h-10 w-auto" />
            </Link>
          </div>
          {/* No additional links */}
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
