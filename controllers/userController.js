import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinaryConfig.js";

// createToken generates a JWT token using the user's id and a secret key from environment variables.
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const loginUser = async (req, res) => {
  try {
    // Extracting email and password from the request body.
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      // If the password does not match, return an invalid credentials message.
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    // Log any error and respond with an error message.
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    // Extracting name, email, and password from the request body.
    const { name, email, password } = req.body;

    // Check if a user with the provided email already exists.
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validate the email format using validator.
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Ensure the password is at least 8 characters long.
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // Generate a salt and hash the password.
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user instance with the provided data and the hashed password.
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    // Save the new user to the database.
    const user = await newUser.save();

    // Generate a JWT token for the new user.
    const token = createToken(user._id);

    // Return a successful response with the token.
    res.json({ success: true, token });
  } catch (error) {
    // Log any error and provide an error response.
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Apply as Seller
export const applySeller = async (req, res) => {
  try {
    console.log("User ID:", req.user._id); // Debugging log
    console.log("File:", req.file); // Debugging log

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Upload supporting document to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    user.role.push("seller"); // Add seller role
    user.sellerApplication = {
      businessName: req.body.businessName,
      companyType: req.body.companyType,
      province: req.body.province,
      city: req.body.city,
      farmLocation: req.body.farmLocation,
      contactNumber: req.body.contactNumber,
      email: req.body.email,
      supportingDocument: result.secure_url, // Store Cloudinary URL
    };
    await user.save();

    res.json({ success: true, message: "Applied as Seller!" });
  } catch (error) {
    console.log("Error:", error); // Debugging log
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Apply as Investor
export const applyInvestor = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Upload supporting document to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    user.role.push("investor"); // Add investor role
    user.investorApplication = {
      investmentType: req.body.investmentType,
      companyName: req.body.companyName,
      industry: req.body.industry,
      contactNumber: req.body.contactNumber,
      email: req.body.email,
      supportingDocument: result.secure_url, // Store Cloudinary URL
    };
    await user.save();

    res.json({ success: true, message: "Applied as Investor!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const checkSellerStatus = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const isSeller = user.role.includes("seller");
    res.json({ success: true, isSeller });
  } catch (error) {
    console.log("Error:", error); 
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const getSellers = async (req, res) => {
  try {
    console.log("Fetching sellers...");
    const sellers = await userModel.find({ role: 'seller' });
    console.log("Sellers fetched:", sellers);
    res.json({ success: true, sellers });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Export the controller functions so they can be used in route definitions.
export { loginUser, registerUser, adminLogin };