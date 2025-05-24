import mongoose from "mongoose"; // No .js needed for npm packages

// Subdocument schema for comments
const commentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true, // Mongoose creates an _id for subdocuments by default, explicit for clarity
    timestamps: false, // Timestamps not needed for individual comments if createdAt is custom
  }
);

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "inProgress", "completed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      required: false, // Made optional for flexibility
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // References the Project model
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      default: null, // Task can be unassigned initially
    },
    comments: [commentSchema], // Array of comment subdocuments
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task", // References other Task documents (for dependencies)
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically for the task itself
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task; // Export the model using ES Modules syntax
