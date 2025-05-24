// backend/controllers/reportController.js
import asyncHandler from "express-async-handler";
import Project from "../models/Project.js"; // Note the .js extension
import Task from "../models/Task.js"; // Note the .js extension
// import User from "../models/User.js"; // Note the .js extension
// import mongoose from "mongoose";

// Helper function to validate and parse dates
const parseDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  // Check if date is valid
  return isNaN(date.getTime()) ? null : date;
};

// ---
// @desc    Get tasks completed per project report
// @route   GET /api/v1/reports/tasks-completed-per-project
// @access  Private/Admin, Manager
export const getTasksCompletedPerProject = asyncHandler(async (req, res) => {
  // Only allow admin or manager to access reports
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    res.status(403);
    throw new Error("Not authorized to access reports");
  }

  const { startDate, endDate } = req.query;

  const queryConditions = {};
  if (startDate) {
    const start = parseDate(startDate);
    if (start) queryConditions.createdAt = { $gte: start };
  }
  if (endDate) {
    const end = parseDate(endDate);
    if (end) {
      // If createdAt already exists, add $lte. Otherwise, create it.
      queryConditions.createdAt = {
        ...(queryConditions.createdAt || {}),
        $lte: end,
      };
    }
  }

  // Aggregate tasks to count completed tasks per project
  const reportData = await Task.aggregate([
    {
      $match: {
        status: "completed",
        ...queryConditions, // Apply date filters
      },
    },
    {
      $group: {
        _id: "$project",
        completedTasks: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "projects", // The collection name for Project model
        localField: "_id",
        foreignField: "_id",
        as: "projectDetails",
      },
    },
    {
      $unwind: "$projectDetails", // Deconstruct the projectDetails array
    },
    {
      $project: {
        _id: 0,
        projectId: "$_id",
        projectName: "$projectDetails.name",
        completedTasks: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: reportData });
});

// @desc    Get team workload distribution report
// @route   GET /api/v1/reports/team-workload-distribution
// @access  Private/Admin, Manager
export const getTeamWorkloadDistribution = asyncHandler(async (req, res) => {
  // Only allow admin or manager to access reports
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    res.status(403);
    throw new Error("Not authorized to access reports");
  }

  // Aggregate tasks to count open/inProgress tasks per assignee
  const reportData = await Task.aggregate([
    {
      $match: {
        assignee: { $ne: null }, // Only consider tasks with an assignee
        status: { $in: ["open", "inProgress"] }, // Count open and in-progress tasks
      },
    },
    {
      $group: {
        _id: "$assignee",
        openTasks: {
          $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] },
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ["$status", "inProgress"] }, 1, 0] },
        },
        totalAssignedTasks: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users", // The collection name for User model
        localField: "_id",
        foreignField: "_id",
        as: "assigneeDetails",
      },
    },
    {
      $unwind: "$assigneeDetails", // Deconstruct the assigneeDetails array
    },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        firstName: "$assigneeDetails.firstName",
        lastName: "$assigneeDetails.lastName",
        openTasks: 1,
        inProgressTasks: 1,
        totalAssignedTasks: 1,
      },
    },
    {
      $sort: { totalAssignedTasks: -1 }, // Sort by most tasks assigned
    },
  ]);

  res.status(200).json({ success: true, data: reportData });
});

// @desc    Get project completion rate report
// @route   GET /api/v1/reports/project-completion-rate
// @access  Private/Admin, Manager
export const getProjectCompletionRate = asyncHandler(async (req, res) => {
  // Only allow admin or manager to access reports
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    res.status(403);
    throw new Error("Not authorized to access reports");
  }

  const totalProjects = await Project.countDocuments({});
  const completedProjects = await Project.countDocuments({
    status: "completed",
  }); // Assuming Project model has a 'status' field

  let completionRate = 0;
  if (totalProjects > 0) {
    completionRate = (completedProjects / totalProjects) * 100;
  }

  // Return data in a format suitable for pie chart or similar visualization
  const reportData = [
    { name: "Completed Projects", value: completedProjects },
    { name: "Incomplete Projects", value: totalProjects - completedProjects },
  ];

  res.status(200).json({
    success: true,
    data: {
      totalProjects,
      completedProjects,
      completionRate: parseFloat(completionRate.toFixed(2)), // Format to 2 decimal places
      chartData: reportData,
    },
  });
});
