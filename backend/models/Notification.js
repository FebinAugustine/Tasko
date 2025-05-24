import mongoose from "mongoose"; // Note: No .js needed for npm packages

const notificationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // References the User model
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String, // Optional URL or path for navigation when clicked
      default: null,
    },
    // You could add a 'type' field for different notification categories
    // type: {
    //   type: String,
    //   enum: ['task_assigned', 'comment_added', 'project_added', 'status_update'],
    //   default: 'general'
    // }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification; // Export the model using ES Modules syntax
