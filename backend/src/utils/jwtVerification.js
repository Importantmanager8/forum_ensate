import jwt from "jsonwebtoken";
// require("dotenv").config()

export const jwtVerification = (token) => {
  try {
    let decoded = jwt.verify(token, process.env.SECRET);
    return decoded;
  } catch (err) {
    return err;
  }
};
