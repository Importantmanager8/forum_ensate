import { jwtVerification } from "../utils/jwtVerification.js";
import User from "../models/user.model.js";

export const authenticate = async (req, res, next) => {

  const token = req.cookies?.token;
  
  // console.log(`before !token : ${req.cookies}`);
  // console.log(`before !token : ${token}`);
  
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided" });
  }

  // console.log(`after !token : ${token}`);
  // console.log(`after !token : ${req.cookies}`);

  try {
    const decoded = jwtVerification(token);
    console.log(decoded);

    const user = await User.findById(decoded.id).select("-password"); // exclude password for security

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};
