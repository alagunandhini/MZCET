import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { CheckCircle } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if(!storedUser || storedUser==="undefined") return;
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

// state for toast notification
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // show toast notification
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    // remove after 3 sec
    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 2000);
  };

  // handling the logout
  const handleLogout = () => {
    showToast("Logging out...", "success");
    setTimeout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    }, 1800);
  };

  return (
    <>
      <nav className="bg-white text-gray-500 w-full shadow-md py-1 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto  py-1 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="mzlogo.png" alt="Logo" className="h-14  bg-sky-50 rounded-full" />
            <h1 className="font-bold text-lg jua-regular">Mz Mock AI</h1>
          </div>

          {/* navbar links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link to="/resume" className="hover:text-gray-300">
              Resume
            </Link>
            <Link to="/resources" className="hover:text-gray-300">
              Resources
            </Link>
            {user ? (
              <div className="relative group cursor-pointer">
                <div className="">
                  <div className="bg-sky-50 w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-400 ">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow">
                  <ChevronDown size={14} className="text-gray-500" />
                </div>

                {/* Dropdown */}
                <div className="absolute right-2  mt-2  w-64 bg-white border border-gray-200 rounded-md shadow-md invisible opacity-0  group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="flex  gap-2 p-4">
                    <div className="bg-sky-50 w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-400 ">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold text-gray-700">
                        {user.name}{" "}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>{" "}
                  </div>

                  <div className="border border-sky-50"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full  flex items-center gap-2 text-left px-4 py-2 text-sm hover:bg-sky-50 text-gray-700"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-5">
                <Link to="/signup">
                  <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-md ">
                    Sign Up
                  </button>
                </Link>
                <Link to="/login">
                  <button className="border border-gray-700 text-gray-500 px-4 py-2 rounded-md hover:bg-gray-100 hover:text-black">
                    Login
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden cursor-pointer hover:text-gray-300 transition duration-200 mx-5 sm:m-0"
            onClick={() => setMenuOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Slide-In Menu */}
        <div
          className={`md:hidden fixed top-0 right-0 h-full w-2/3 max-w-xs bg-white text-gray-500 shadow-lg transform transition-transform duration-300 z-50  ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close Menu"
              className="cursor-pointer hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="hover:text-gray-300 border-b border-sky-300 pb-2"
            >
              Home
            </Link>
            <Link
              to="/resume"
              onClick={() => setMenuOpen(false)}
              className="hover:text-gray-300 border-b border-sky-300 pb-2"
            >
              Resume
            </Link>
            <Link
              to="/resources"
              onClick={() => setMenuOpen(false)}
              className="hover:text-gray-300 border-b border-sky-300 pb-2"
            >
              Resources
            </Link>

            {user ? (
              <div>
                {/* Profile toggle for mobile */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-md hover:bg-sky-50"
                >
                  <div className="bg-sky-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-400">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-semibold">
                    {user.name}
                  </span>
                  <ChevronDown size={14} className="text-gray-500 ml-auto" />
                </button>

                {profileOpen && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-md">
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-700">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="border border-sky-50"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm hover:bg-sky-50 text-gray-700"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-5">
                <Link to="/signup">
                  <button className="bg-sky-600/50 text-white px-4 py-2 rounded-md hover:bg-sky-400">
                    Sign Up
                  </button>
                </Link>
                <Link to="/login">
                  <button className="border border-gray-700 text-gray-500 px-4 py-2 rounded-md hover:bg-gray-100 hover:text-black">
                    Login
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[100] animate-slideIn">
          <div
            className={`px-8 py-3 rounded-lg shadow-lg  text-sm ${
              toast.type === "success" ? "bg-sky-400 " : "bg-gray-900"
            } text-white flex gap-3`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="text-sky-500" />
            ) : (
              <span className="font-extrabold  ">!</span>
            )}

            {toast.message}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
