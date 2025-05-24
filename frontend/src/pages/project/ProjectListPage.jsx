import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const ProjectListPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get("/api/v1/managers/projects", config);
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch projects");
        setLoading(false);
      }
    };

    if (token && user?.role === "manager") {
      fetchProjects();
    } else if (token && user?.role === "user") {
      // Optionally fetch projects assigned to the user
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [token, user]);

  if (loading) {
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Projects
      </h2>
      {user?.role === "manager" && (
        <Link
          to="/projects/create"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4"
        >
          Create New Project
        </Link>
      )}
      {projects.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          No projects available.
        </p>
      ) : (
        <ul className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md divide-y divide-gray-200 dark:divide-gray-700">
          {projects.map((project) => (
            <li key={project._id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <Link
                  to={`/projects/${project._id}`}
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {project.name}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Lead Manager: {project.leadManager?.firstName}{" "}
                  {project.leadManager?.lastName}
                </p>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {project.description?.substring(0, 100)}...
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProjectListPage;
