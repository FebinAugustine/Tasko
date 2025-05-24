import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api/v1"; // Fallback to relative URL for development

const authService = {
  login: async (email, password) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/login/admin`,
        { email, password },
        config
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
  // Add register function if self-registration is enabled
};

export default authService;
