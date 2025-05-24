import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get("/api/v1/users/tasks", config);
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch tasks");
        setLoading(false);
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token]);

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (tasks.length === 0) {
    return <div>No tasks assigned to you.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md">
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => (
          <li key={task._id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <Link
                to={`/tasks/${task._id}`}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {task.title}
              </Link>
              <div className="ml-2 flex-shrink-0 flex">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.priority === "High"
                      ? "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
                      : task.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100"
                      : "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                  }`}
                >
                  {task.priority}
                </span>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === "To Do"
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      : task.status === "In Progress"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300"
                      : task.status === "In Review"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300"
                      : task.status === "Completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300" // Blocked
                  }`}
                >
                  {task.status}
                </span>
              </div>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex-auto">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due Date:{" "}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
              <div className="mt-2 sm:mt-0 sm:ml-6">
                <div className="flex space-x-2">
                  {task.project && (
                    <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                      Project: {task.project.name}
                    </span>
                  )}
                  {task.reporter && (
                    <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">
                      Reported by: {task.reporter.firstName}{" "}
                      {task.reporter.lastName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
