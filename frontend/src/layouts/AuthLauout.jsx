import React from "react";
import ThemeToggle from "../components/ThemeToggle"; // Assuming you created this

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white dark:bg-gray-800 shadow-lg sm:rounded-3xl sm:p-20">
          <ThemeToggle className="absolute top-4 right-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-6">
            Tasko
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
