import jwt from "jsonwebtoken"; // No .js needed for npm packages

/**
 * Generates a JSON Web Token (JWT) for the given user ID.
 * @param {string} id - The user ID to encode in the token.
 * @returns {string} The generated JWT.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

export default generateToken; // Export the function using ES Modules syntax
