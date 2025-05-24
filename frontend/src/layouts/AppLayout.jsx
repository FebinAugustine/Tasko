import React from "react";
import { Outlet, Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const AppLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-xl font-semibold text-indigo-600 dark:text-indigo-400"
              >
                Tasko
              </Link>
              {user && (
                <div className="hidden md:block ml-10">
                  <div className="flex items-baseline space-x-4">
                    <Link
                      to="/dashboard"
                      className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/tasks"
                      className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Tasks
                    </Link>
                    <Link
                      to="/projects"
                      className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Projects
                    </Link>
                    {user.role === "manager" && (
                      <Link
                        to="/teams"
                        className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Teams
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Admin
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <ThemeToggle />
              {user && (
                <button
                  onClick={handleLogout}
                  className="ml-4 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Theme Toggle can also be placed here if desired */}
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
