import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { Generate_JWT } from "../utils/jwt.js";
import { sendEmailVerification } from "../utils/sendEmailVerification.js";
import { jwtVerification } from "../utils/jwtVerification.js";

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      filiere,
      ecole,
      internshipStatus,
    } = req.body;
    let role = "student";
    let verified = false;

    let existing = await User.findOne({ email });
    console.log(existing);
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // let hashedPassword = await bcrypt.hash(password, 10);

    let data = {
      firstName,
      lastName,
      email,
      // password: hashedPassword,
      password,
      filiere,
      ecole,
      internshipStatus,
      verified,
      role,
    };

    let newUser = await User.create(data);
    let jwt = Generate_JWT(
      { id: newUser._id, email: newUser.email, verified: newUser.verified },
      "3min"
    );

    const emailSent = await sendEmailVerification(newUser.email, jwt);


    return res.status(201).json({
      success: true,
      message: "User registered successfully, Check your email",
      data: {
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
          filiere: newUser.filiere,
          ecole: newUser.ecole,
          internshipStatus: newUser.internshipStatus,
        },
      },
    });

  } catch (error) {
    // Optionally handle errors like database issues or email sending errors
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const verify_email = async (req, res) => {
  if (!req.query.token) {
    return res.status(400).json({ message: "Token is missing" });
  }

  let token = req.query.token;
  console.log("########################");
  console.log("Token received:", req.query.token);

  try {
    console.log("Token received:", req.query.token);

    let decodedToken = jwtVerification(token);
    let userId = decodedToken.id;

    let user = (await User.findById(userId))

    if (!user.verified) {
      let updatedUser = await User.findByIdAndUpdate(userId, {
        verified: true,
      });

      if (updatedUser) {
        return res
          .status(200)
          .json({ message: "Email verified! You can now log in" });
      }
    } else {
      return res.status(200).json({ message: "Email was already verified" });
    }

    return res.status(400).json({ message: "Invalid or expired token" });
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};

export const resendVerificationEmail = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  } 
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  let user = await User.findOne({ email: email });
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.verified)
    return res.status(404).json({ message: "user already verified" });

  let token = Generate_JWT(
    { id: user._id, email: user.email, verified: user.verified },
    "3min"
  );

  try {
    await sendEmailVerification(email, token);
    return res
      .status(200)
      .json({ message: "Verification email resent successfully" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Failed to send verification email" });
  }
};

export const login = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Request body is missing" });
  }

  let data = req.body;

  if (!data.email || !data.password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  let user = await User.findOne({ email: data.email });
  // console.log(data.password);
  // console.log(user.password);

  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    return res.status(400).json({ message: "Invalid email or password" });
  }
  if (!user.verified) {
    return res
      .status(400)
      .json({ message: "check your email for verification" });
  }
  let token = Generate_JWT(
    {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      type_stage: user.type_stage,
      university: user.university,
      filiere: user.filiere,
      role: user.role
    },
    "6h"
  );

  // Store token in cookies
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "development", // only HTTPS in prod
    sameSite: "strict",
    maxAge: 6 * 60 * 60 * 1000, // 6h
  });

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        filiere: user.filiere,
        ecole: user.ecole,
        internshipStatus: user.internshipStatus,
      },
      token: token,
    },
  });
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
