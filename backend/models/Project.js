import mongoose from "mongoose"; // Note: No .js needed for npm packages

const projectSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a project name"],
      trim: true,
      maxlength: [100, "Project name cannot be more than 100 characters"],
      unique: true, // Project names should ideally be unique for a user/organization
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    leadManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // References the User model
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
    },
    // You could add a status for the project itself, e.g., 'active', 'completed', 'onHold'
    // status: {
    //   type: String,
    //   enum: ['active', 'completed', 'onHold', 'archived'],
    //   default: 'active'
    // }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Project = mongoose.model("Project", projectSchema);

export default Project; // Export the model using ES Modules syntax
