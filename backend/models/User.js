import mongoose from "mongoose"; // No .js needed for npm packages

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please add a last name"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },
    profilePicture: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/your-cloud-name/image/upload/v1/default_avatar.png", // Replace with your default image URL from Cloudinary or a local path if serving static
      },
      public_id: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

const User = mongoose.model("User", userSchema);

export default User; // Export the model using ES Modules syntax
