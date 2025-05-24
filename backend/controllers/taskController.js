import asyncHandler from "express-async-handler";
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import User from "../models/User.js"; // Needed for assignee check if not already populated
import { isValidObjectId } from "mongoose";
import * as notificationController from "./notificationController.js"; // Import notification functions

// @desc    Get all tasks for a project
// @route   GET /api/v1/projects/:projectId/tasks
// @access  Private
export const getProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, priority, sortBy, sortOrder, assigneeId, dueDate } =
    req.query;

  // Ensure project exists and user has access (already handled by projectController/auth if nested)
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Build filter object
  const filter = { project: projectId };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assigneeId) filter.assignee = assigneeId;
  if (dueDate) {
    // For exact date match, you might want to adjust this for range if needed
    const startOfDay = new Date(dueDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dueDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    filter.dueDate = { $gte: startOfDay, $lte: endOfDay };
  }

  // Build sort object
  const sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;
  } else {
    sort.createdAt = -1; // Default sort by newest
  }

  const tasks = await Task.find(filter)
    .populate("assignee", "firstName lastName")
    .populate("createdBy", "firstName lastName")
    .populate("dependencies", "title _id status") // Populate dependencies to show title and status
    .sort(sort);

  res.status(200).json({ success: true, count: tasks.length, data: tasks });
});

// @desc    Get single task
// @route   GET /api/v1/tasks/:id
// @access  Private
export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate("createdBy", "firstName lastName")
    .populate("assignee", "firstName lastName")
    .populate("project", "name")
    .populate("comments.user", "firstName lastName")
    .populate("dependencies", "title _id status"); // Populate dependencies

  if (!task) {
    res.status(404);
    throw new Error(`Task not found with id ${req.params.id}`);
  }

  // Check if the user is a member of the project the task belongs to
  const project = await Project.findById(task.project);
  if (
    !project.teamMembers.includes(req.user._id) &&
    project.leadManager.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to access this task");
  }

  res.status(200).json({ success: true, data: task });
});

// @desc    Create new task
// @route   POST /api/v1/projects/:projectId/tasks
// @access  Private/Manager, Admin
export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const {
    title,
    description,
    dueDate,
    priority,
    status,
    assigneeId,
    dependencies,
  } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Please add a title for the task");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Ensure current user is lead manager or admin
  if (
    project.leadManager.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to create tasks for this project");
  }

  // Validate and filter dependencies
  let validDependencies = [];
  if (dependencies && Array.isArray(dependencies) && dependencies.length > 0) {
    const existingTasks = await Task.find({
      _id: { $in: dependencies },
      project: projectId,
    });
    validDependencies = existingTasks.map((task) => task._id);

    if (validDependencies.length !== dependencies.length) {
      res.status(400);
      throw new Error(
        "One or more specified dependencies are invalid or not part of this project"
      );
    }
    // Basic check for circular dependencies: A task cannot depend on itself
    if (validDependencies.includes(projectId)) {
      // Should be taskId not projectId
      res.status(400);
      throw new Error("A task cannot depend on itself.");
    }
    // More complex circular dependency detection would involve graph traversal
  }

  const task = await Task.create({
    title,
    description,
    dueDate,
    priority,
    status,
    project: projectId,
    createdBy: req.user._id,
    assignee: assigneeId || null, // Assignee is optional
    dependencies: validDependencies,
  });

  const populatedTask = await Task.findById(task._id)
    .populate("assignee", "firstName lastName")
    .populate("createdBy", "firstName lastName")
    .populate("dependencies", "title _id status");

  // Real-time update for project tasks
  const io = req.app.get("io");
  io.to(`project-${projectId}`).emit("new_task", populatedTask);

  // Notification for assignee if assigned
  if (assigneeId && assigneeId.toString() !== req.user._id.toString()) {
    await notificationController.createNotification(
      assigneeId,
      `You have been assigned to the task: "${task.title}" in project "${project.name}"`,
      `/tasks/${task._id}`
    );
  }

  res.status(201).json({ success: true, data: populatedTask });
});

// @desc    Update task
// @route   PUT /api/v1/tasks/:id
// @access  Private/Manager, Admin, or Assignee
export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    dueDate,
    priority,
    status,
    assigneeId,
    dependencies,
  } = req.body;

  let task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error(`Task not found with id ${id}`);
  }

  // Check authorization: Lead Manager, Admin, or the assignee himself
  const project = await Project.findById(task.project);
  if (!project) {
    // Should not happen if task exists, but good check
    res.status(404);
    throw new Error("Associated project not found");
  }

  const isManagerOrAdmin =
    project.leadManager.toString() === req.user._id.toString() ||
    req.user.role === "admin";
  const isAssignee =
    task.assignee && task.assignee.toString() === req.user._id.toString();

  if (!isManagerOrAdmin && !isAssignee) {
    res.status(403);
    throw new Error("Not authorized to update this task");
  }

  // Store old assignee for notification logic
  const oldAssigneeId = task.assignee ? task.assignee.toString() : null;

  // Validate and filter dependencies
  let validDependencies = task.dependencies; // Default to existing if not provided
  if (dependencies !== undefined) {
    // Only update if 'dependencies' field is present in body
    if (
      !Array.isArray(dependencies) ||
      !dependencies.every((dep) => isValidObjectId(dep))
    ) {
      res.status(400);
      throw new Error("Invalid dependencies format or IDs");
    }
    const existingTasks = await Task.find({
      _id: { $in: dependencies },
      project: task.project,
    });
    validDependencies = existingTasks.map((t) => t._id);

    if (validDependencies.length !== dependencies.length) {
      res.status(400);
      throw new Error(
        "One or more specified dependencies are invalid or not part of this project"
      );
    }
    // Prevent a task from depending on itself
    if (validDependencies.includes(task._id.toString())) {
      res.status(400);
      throw new Error("A task cannot depend on itself.");
    }
    // Optional: Prevent changing status to 'completed' if dependencies are not met
    if (status === "completed" && validDependencies.length > 0) {
      const dependentTasks = await Task.find({
        _id: { $in: validDependencies },
      });
      const uncompletedDependencies = dependentTasks.filter(
        (depTask) => depTask.status !== "completed"
      );
      if (uncompletedDependencies.length > 0) {
        res.status(400);
        throw new Error(
          "Cannot complete task: Dependent tasks are not yet completed."
        );
      }
    }
  }

  const updatedFields = {
    title: title || task.title,
    description: description || task.description,
    dueDate: dueDate || task.dueDate,
    priority: priority || task.priority,
    status: status || task.status,
    assignee: assigneeId || null,
    dependencies: validDependencies,
  };

  task = await Task.findByIdAndUpdate(id, updatedFields, {
    new: true,
    runValidators: true,
  })
    .populate("assignee", "firstName lastName")
    .populate("createdBy", "firstName lastName")
    .populate("dependencies", "title _id status"); // Repopulate after update

  // Real-time update
  const io = req.app.get("io");
  io.to(`project-${task.project}`).emit("task_updated", task);
  io.to(`task-${id}`).emit("task_updated", task); // For specific task detail page

  // Notification for new assignee
  if (assigneeId && assigneeId.toString() !== oldAssigneeId) {
    const assignedUser = await User.findById(assigneeId);
    if (assignedUser) {
      await notificationController.createNotification(
        assigneeId,
        `You have been assigned to the task: "${task.title}" in project "${project.name}"`,
        `/tasks/${task._id}`
      );
    }
  }

  // Notification for status change to creator/assignee/project lead if significant
  if (status && status !== task.status) {
    // Check if status actually changed
    const recipientIds = new Set();
    recipientIds.add(task.createdBy.toString());
    if (task.assignee) recipientIds.add(task.assignee.toString());
    recipientIds.add(project.leadManager.toString());

    // Exclude the user who made the change
    recipientIds.delete(req.user._id.toString());

    const statusMessage = `Task "${task.title}" status changed to "${status}" in project "${project.name}"`;
    for (const recipientId of recipientIds) {
      await notificationController.createNotification(
        recipientId,
        statusMessage,
        `/tasks/${task._id}`
      );
    }
  }

  res.status(200).json({ success: true, data: task });
});

// @desc    Delete task
// @route   DELETE /api/v1/tasks/:id
// @access  Private/Manager, Admin
export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error(`Task not found with id ${id}`);
  }

  const project = await Project.findById(task.project);
  if (!project) {
    res.status(404);
    throw new Error("Associated project not found");
  }

  // Only project lead manager or admin can delete tasks
  if (
    project.leadManager.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this task");
  }

  await task.remove(); // Mongoose 6+ has .remove() which is an alias for deleteOne()
  // For Mongoose 7+, consider await Task.deleteOne({ _id: req.params.id });

  // Real-time update
  const io = req.app.get("io");
  io.to(`project-${task.project}`).emit("task_deleted", id);

  res.status(200).json({ success: true, message: "Task removed" });
});

// @desc    Add a comment to a task
// @route   POST /api/v1/tasks/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error("Comment text is required");
  }

  const task = await Task.findById(id);

  if (!task) {
    res.status(404);
    throw new Error(`Task not found with id ${id}`);
  }

  // Ensure user is part of the project to comment
  const project = await Project.findById(task.project);
  if (
    !project.teamMembers.includes(req.user._id) &&
    project.leadManager.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to comment on this task");
  }

  const comment = {
    user: req.user._id,
    text,
  };

  task.comments.push(comment);
  await task.save();

  // Populate the added comment's user for immediate response
  const populatedTask = await Task.findById(id)
    .populate("comments.user", "firstName lastName")
    .populate("assignee", "firstName lastName")
    .populate("createdBy", "firstName lastName")
    .populate("dependencies", "title _id status");

  // Real-time update
  const io = req.app.get("io");
  io.to(`task-${id}`).emit(
    "new_comment",
    populatedTask.comments[populatedTask.comments.length - 1]
  );
  io.to(`project-${task.project}`).emit("task_updated_comments", {
    taskId: id,
    comments: populatedTask.comments,
  });

  // Notify task creator and assignee (if different from commenter)
  const recipientIds = new Set();
  recipientIds.add(task.createdBy.toString());
  if (task.assignee) recipientIds.add(task.assignee.toString());

  // Exclude the user who made the comment
  recipientIds.delete(req.user._id.toString());

  const commentMessage = `New comment on task "${task.title}" in project "${project.name}" by ${req.user.firstName} ${req.user.lastName}`;
  for (const recipientId of recipientIds) {
    await notificationController.createNotification(
      recipientId,
      commentMessage,
      `/tasks/${task._id}`
    );
  }

  res
    .status(201)
    .json({
      success: true,
      data: populatedTask.comments[populatedTask.comments.length - 1],
    });
});

// @desc    Delete a comment from a task
// @route   DELETE /api/v1/tasks/:taskId/comments/:commentId
// @access  Private
export const deleteComment = asyncHandler(async (req, res) => {
  const { taskId, commentId } = req.params;

  const task = await Task.findById(taskId);

  if (!task) {
    res.status(404);
    throw new Error(`Task not found with id ${taskId}`);
  }

  const comment = task.comments.id(commentId);

  if (!comment) {
    res.status(404);
    throw new Error(`Comment not found with id ${commentId}`);
  }

  // Only the comment creator, project lead manager, or admin can delete comments
  const project = await Project.findById(task.project);
  const isManagerOrAdmin =
    project.leadManager.toString() === req.user._id.toString() ||
    req.user.role === "admin";

  if (
    comment.user.toString() !== req.user._id.toString() &&
    !isManagerOrAdmin
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  comment.remove(); // Removes the subdocument
  await task.save();

  // Real-time update
  const io = req.app.get("io");
  io.to(`task-${taskId}`).emit("comment_deleted", commentId);
  io.to(`project-${task.project}`).emit("task_updated_comments", {
    taskId: taskId,
    comments: task.comments,
  });

  res.status(200).json({ success: true, message: "Comment removed" });
});
