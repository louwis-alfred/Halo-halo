// filepath: /c:/Users/ACER/Documents/JavaScript/agriculture/backend/middleware/authRoles.js
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log("Authorization header missing or does not start with 'Bearer '");
    return res.status(401).json({ success: false, message: 'Not Authorized. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(token_decode.id); // Fetch the user from the database
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    req.user = user; // Set the user object on the request
    next();
  } catch (error) {
    console.log("Error verifying token:", error.message);
    res.status(401).json({ success: false, message: 'Invalid Token. Please log in again.' });
  }
};



// Middleware to check if the user is a seller
const authSeller = (req, res, next) => {
  if (!req.user.role.includes('seller')) {
    return res.status(403).json({ success: false, message: 'Access denied. Not a seller.' });
  }
  next();
};
// Middleware to check if the user is an investor
const authInvestor = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id); // Use req.user._id

        if (!user || !user.role.includes("investor")) {
            return res.status(403).json({ success: false, message: "Access Denied. Investor role required." });
        }

        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { authUser, authSeller, authInvestor };