// backend/controllers/projectController.js
import asyncHandler from "express-async-handler";
import Project from "../models/Project.js"; // Note the .js extension
import User from "../models/User.js"; // Note the .js extension
import Task from "../models/Task.js"; // Note the .js extension for task counts
import * as notificationController from "./notificationController.js"; // Import notification functions

// @desc    Get all projects (visible to user based on role/membership)
// @route   GET /api/v1/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res) => {
  let query = {};

  // Admin sees all projects
  if (req.user.role === "admin") {
    query = {};
  }
  // Manager sees projects they lead or are a team member of
  else if (req.user.role === "manager") {
    query = {
      $or: [{ leadManager: req.user._id }, { teamMembers: req.user._id }],
    };
  }
  // Regular user sees projects they are a team member of
  else {
    // user role
    query = { teamMembers: req.user._id };
  }

  const projects = await Project.find(query)
    .populate("leadManager", "firstName lastName email")
    .populate("teamMembers", "firstName lastName email profilePicture.url"); // Include profile picture URL

  // For each project, calculate and append task progress
  const projectsWithProgress = await Promise.all(
    projects.map(async (project) => {
      const totalTasks = await Task.countDocuments({ project: project._id });
      const completedTasks = await Task.countDocuments({
        project: project._id,
        status: "completed",
      });
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        ...project.toObject(), // Convert Mongoose document to plain JS object
        totalTasks,
        completedTasks,
        progress: parseFloat(progress.toFixed(2)), // Round to 2 decimal places
      };
    })
  );

  res
    .status(200)
    .json({
      success: true,
      count: projectsWithProgress.length,
      data: projectsWithProgress,
    });
});

// @desc    Get single project
// @route   GET /api/v1/projects/:id
// @access  Private
export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("leadManager", "firstName lastName email")
    .populate("teamMembers", "firstName lastName email profilePicture.url"); // Include profile picture URL

  if (!project) {
    res.status(404);
    throw new Error(`Project not found with id ${req.params.id}`);
  }

  // Authorization check: Admin can view any project. Managers/Users can only view projects they are part of.
  if (
    req.user.role === "admin" ||
    project.leadManager.toString() === req.user._id.toString() ||
    project.teamMembers.includes(req.user._id)
  ) {
    // Calculate task progress for single project view
    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({
      project: project._id,
      status: "completed",
    });
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        totalTasks,
        completedTasks,
        progress: parseFloat(progress.toFixed(2)),
      },
    });
  } else {
    res.status(403);
    throw new Error("Not authorized to access this project");
  }
});

// @desc    Create new project
// @route   POST /api/v1/managers/projects
// @access  Private/Manager, Admin
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, teamMembers } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Please add a project name");
  }

  // Ensure only managers or admins can set leadManager
  let leadManagerId = req.user._id; // Default to current user
  if (req.user.role === "admin" && req.body.leadManagerId) {
    const specifiedManager = await User.findById(req.body.leadManagerId);
    if (
      !specifiedManager ||
      (specifiedManager.role !== "manager" && specifiedManager.role !== "admin")
    ) {
      res.status(400);
      throw new Error(
        "Specified lead manager is not a valid manager or admin user."
      );
    }
    leadManagerId = req.body.leadManagerId;
  } else if (req.user.role === "user") {
    res.status(403);
    throw new Error("Users are not authorized to create projects");
  }

  // Validate teamMembers array (optional, but good practice)
  let validTeamMembers = [];
  if (teamMembers && Array.isArray(teamMembers) && teamMembers.length > 0) {
    const existingUsers = await User.find({ _id: { $in: teamMembers } });
    validTeamMembers = existingUsers.map((user) => user._id);
    if (validTeamMembers.length !== teamMembers.length) {
      res.status(400);
      throw new Error("One or more specified team members are invalid");
    }
  }

  // Ensure the lead manager is also a team member
  if (!validTeamMembers.includes(leadManagerId.toString())) {
    validTeamMembers.push(leadManagerId);
  }

  const project = await Project.create({
    name,
    description,
    leadManager: leadManagerId,
    teamMembers: validTeamMembers,
    createdBy: req.user._id,
  });

  const populatedProject = await Project.findById(project._id)
    .populate("leadManager", "firstName lastName email")
    .populate("teamMembers", "firstName lastName email profilePicture.url");

  // Notify new team members (excluding the creator)
  for (const memberId of validTeamMembers) {
    if (memberId.toString() !== req.user._id.toString()) {
      await notificationController.createNotification(
        memberId,
        `You have been added to the project: "${project.name}"`,
        `/projects/${project._id}`
      );
    }
  }

  res.status(201).json({ success: true, data: populatedProject });
});

// @desc    Update project
// @route   PUT /api/v1/managers/projects/:id
// @access  Private/Manager, Admin
export const updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, teamMembers, leadManagerId } = req.body;

  let project = await Project.findById(id);

  if (!project) {
    res.status(404);
    throw new Error(`Project not found with id ${id}`);
  }

  // Authorization check: Only project's lead manager or an admin can update
  if (
    project.leadManager.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to update this project");
  }

  let updatedLeadManager = project.leadManager;
  if (leadManagerId && req.user.role === "admin") {
    // Only admin can change lead manager
    const newManager = await User.findById(leadManagerId);
    if (
      !newManager ||
      (newManager.role !== "manager" && newManager.role !== "admin")
    ) {
      res.status(400);
      throw new Error("New lead manager is not a valid manager or admin user.");
    }
    updatedLeadManager = leadManagerId;
  } else if (leadManagerId && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Only administrators can change the project lead manager.");
  }

  // Process team members updates
  let newTeamMembers = project.teamMembers.map((member) => member.toString()); // Convert to string array for easier comparison
  const oldTeamMembers = new Set(newTeamMembers);

  if (teamMembers && Array.isArray(teamMembers)) {
    const existingUsers = await User.find({ _id: { $in: teamMembers } });
    newTeamMembers = existingUsers.map((user) => user._id.toString());

    if (newTeamMembers.length !== teamMembers.length) {
      res.status(400);
      throw new Error("One or more specified team members are invalid");
    }
  }

  // Ensure the lead manager is always part of the team
  if (!newTeamMembers.includes(updatedLeadManager.toString())) {
    newTeamMembers.push(updatedLeadManager.toString());
  }

  // Identify added and removed members for notifications
  const addedMembers = newTeamMembers.filter(
    (memberId) => !oldTeamMembers.has(memberId)
  );
  const removedMembers = Array.from(oldTeamMembers).filter(
    (memberId) => !newTeamMembers.includes(memberId)
  );

  project.name = name || project.name;
  project.description = description || project.description;
  project.leadManager = updatedLeadManager;
  project.teamMembers = newTeamMembers; // Assign the updated array

  const updatedProject = await project.save();

  const populatedProject = await Project.findById(updatedProject._id)
    .populate("leadManager", "firstName lastName email")
    .populate("teamMembers", "firstName lastName email profilePicture.url");

  // Notifications for added members
  for (const memberId of addedMembers) {
    await notificationController.createNotification(
      memberId,
      `You have been added to the project: "${populatedProject.name}"`,
      `/projects/${populatedProject._id}`
    );
  }

  // Notifications for removed members
  for (const memberId of removedMembers) {
    await notificationController.createNotification(
      memberId,
      `You have been removed from the project: "${populatedProject.name}"`,
      `/projects` // No specific project link, as they are removed
    );
  }

  // Real-time update for project list or specific project detail pages
  const io = req.app.get("io");
  io.emit("project_updated", populatedProject); // General update for all connected clients

  res
    .status(200)
    .json({
      success: true,
      message: "Project updated successfully",
      data: populatedProject,
    });
});

// @desc    Delete project
// @route   DELETE /api/v1/managers/projects/:id
// @access  Private/Manager, Admin
export const deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const project = await Project.findById(id);

  if (!project) {
    res.status(404);
    throw new Error(`Project not found with id ${id}`);
  }

  // Authorization check: Only project's lead manager or an admin can delete
  if (
    project.leadManager.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this project");
  }

  // Before deleting project, optionally delete associated tasks to prevent orphans
  await Task.deleteMany({ project: id });

  await project.remove(); // Mongoose 6+ has .remove() which is an alias for deleteOne()
  // For Mongoose 7+, consider await Project.deleteOne({ _id: req.params.id });

  // Real-time update
  const io = req.app.get("io");
  io.emit("project_deleted", id); // Inform clients that a project was deleted

  res.status(200).json({ success: true, message: "Project removed" });
});
