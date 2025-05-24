import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const TaskDetails = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [commentError, setCommentError] = useState(null);
  const { token, user } = useSelector((state) => state.auth);
  const allowedStatuses = [
    "To Do",
    "In Progress",
    "In Review",
    "Completed",
    "Blocked",
  ];

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`/api/v1/tasks/${taskId}`, config);
        setTask(response.data);
        setLoading(false);
        setNewStatus(response.data.status);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch task details");
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(
          `/api/v1/tasks/${taskId}/comments`,
          config
        );
        setComments(response.data);
      } catch (err) {
        setCommentError(
          err.response?.data?.message || "Failed to fetch comments"
        );
      }
    };

    if (token && taskId) {
      fetchTaskDetails();
      fetchComments();
    }
  }, [token, taskId]);

  const handleStatusChange = (event) => {
    setNewStatus(event.target.value);
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.patch(
        `/api/v1/tasks/${taskId}/status`,
        { status: newStatus },
        config
      );
      setTask({ ...task, status: newStatus });
      setUpdatingStatus(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
      setUpdatingStatus(false);
    }
  };

  const handleCommentChange = (e) => {
    setNewCommentText(e.target.value);
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }
    setCommentError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `/api/v1/tasks/${taskId}/comments`,
        { text: newCommentText },
        config
      );
      setComments([...comments, response.data.comment]);
      setNewCommentText("");
    } catch (err) {
      setCommentError(err.response?.data?.message || "Failed to add comment");
    }
  };

  if (loading) {
    return <div>Loading task details...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!task) {
    return <div>Task not found.</div>;
  }

  const canUpdateStatus =
    task.assignees?.some((assignee) => assignee._id === user?.id) ||
    user?.role === "manager";

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        {task.title}
      </h2>
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400">
          Status:{" "}
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
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
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Priority:{" "}
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
        </p>
        {task.dueDate && (
          <p className="text-gray-600 dark:text-gray-400">
            Due Date: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
        {task.project && (
          <p className="text-gray-600 dark:text-gray-400">
            Project:{" "}
            <Link
              to={`/projects/${task.project._id}`}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {task.project.name}
            </Link>
          </p>
        )}
        {task.reporter && (
          <p className="text-gray-600 dark:text-gray-400">
            Reported by: {task.reporter.firstName} {task.reporter.lastName}
          </p>
        )}
        {task.assignees && task.assignees.length > 0 && (
          <p className="text-gray-600 dark:text-gray-400">
            Assigned to:{" "}
            {task.assignees
              .map((assignee) => `${assignee.firstName} ${assignee.lastName}`)
              .join(", ")}
          </p>
        )}
      </div>

      {canUpdateStatus && (
        <div className="mb-4">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Update Status
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <select
              id="status"
              className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-gray-200"
              value={newStatus}
              onChange={handleStatusChange}
            >
              {allowedStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {/* Add an icon here if desired */}
            </div>
          </div>
          <button
            onClick={handleUpdateStatus}
            disabled={updatingStatus}
            className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              updatingStatus
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            }`}
          >
            {updatingStatus ? "Updating..." : "Update Status"}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}

      {task.description && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Description
          </h3>
          <ReactQuill value={task.description} readOnly theme={null} />
        </div>
      )}

      {task.attachments && task.attachments.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Attachments
          </h3>
          <ul>
            {task.attachments.map((attachment) => (
              <li key={attachment.public_id} className="mb-2">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {attachment.filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Comments
        </h3>
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md"
            >
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {comment.user.firstName} {comment.user.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {comment.text}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No comments yet.</p>
          )}
        </div>

        <div className="mt-4">
          <textarea
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-gray-200"
            rows="3"
            placeholder="Add a comment..."
            value={newCommentText}
            onChange={handleCommentChange}
          />
          <button
            onClick={handleAddComment}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            Add Comment
          </button>
          {commentError && (
            <p className="text-red-500 text-sm mt-2">{commentError}</p>
          )}
        </div>
      </div>

      <Link
        to="/tasks"
        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-6"
      >
        Back to Task List
      </Link>
    </div>
  );
};

export default TaskDetails;
