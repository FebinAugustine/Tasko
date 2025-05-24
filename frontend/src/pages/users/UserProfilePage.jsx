import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { logout } from "../../store/authSlice";

const ProfilePage = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get("/api/v1/users/profile", config);
        setProfile(response.data);
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        setPreviewImage(response.data.profileImage);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch profile");
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setFirstName(profile?.firstName || "");
    setLastName(profile?.lastName || "");
    setProfileImage(null);
    setPreviewImage(profile?.profileImage || null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSaveClick = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
      };
      const response = await axios.put(
        "/api/v1/users/profile",
        formData,
        config
      );
      setProfile(response.data.user);
      dispatch({
        type: "auth/login/fulfilled",
        payload: { ...response.data, token },
      }); // Update Redux store
      setEditMode(false);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!profile) {
    return <div>Profile information not found.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Your Profile
      </h2>

      <div className="mb-4 flex items-center">
        <div className="relative w-24 h-24 rounded-full overflow-hidden">
          {previewImage ? (
            <img
              src={previewImage}
              alt="Profile Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
          {editMode && (
            <label
              htmlFor="profileImage"
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <input
                type="file"
                id="profileImage"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          )}
        </div>
        {!editMode && profile?.profileImage && (
          <a
            href={profile.profileImage}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Profile Image
          </a>
        )}
      </div>

      <div>
        <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5 dark:border-gray-700">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2"
          >
            First Name
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            {editMode ? (
              <input
                type="text"
                name="firstName"
                id="firstName"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-gray-200"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.firstName}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5 dark:border-gray-700">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2"
          >
            Last Name
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            {editMode ? (
              <input
                type="text"
                name="lastName"
                id="lastName"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-gray-200"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {profile.lastName}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5 dark:border-gray-700">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 sm:mt-px sm:pt-2"
          >
            Email address
          </label>
          <div className="mt-1 sm:mt-0 sm:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.email}
            </p>
          </div>
        </div>

        {/* Add more profile information here if needed */}

        <div className="mt-6 flex justify-end">
          {!editMode ? (
            <button
              type="button"
              onClick={handleEditClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancelClick}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveClick}
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                }`}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </>
          )}
          <button
            onClick={handleLogout}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
