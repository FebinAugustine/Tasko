// backend/utils/googleOAuth.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";
import crypto from "crypto"; // For generating random numbers/special characters

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        } else {
          // If user doesn't exist, create a new one
          // Generate a default password combining username and random characters
          const randomSuffix = crypto.randomBytes(4).toString("hex"); // 8 hex characters
          const specialChars = "!@#$%^&*()_+";
          const randomSpecialChar =
            specialChars[Math.floor(Math.random() * specialChars.length)];
          const defaultPassword = `${
            profile.username || profile.displayName.replace(/\s/g, "")
          }${randomSuffix}${randomSpecialChar}`;

          user = await User.create({
            googleId: profile.id,
            username: profile.username || profile.emails[0].value.split("@")[0], // Use email prefix if username not available
            fullName: profile.displayName,
            email: profile.emails[0].value,
            password: defaultPassword, // This will be hashed by the pre-save hook in User model
            role: "user", // Default role for new Google users
          });

          return done(null, user);
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
