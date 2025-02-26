import express from "express";
import {
  placeInvestment,
  placeInvestmentStripe,
  placeInvestmentRazorpay,
  allInvestments,
  userInvestments,
  updateInvestmentStatus,
} from "../controllers/investmentController.js"; // Ensure this matches the file name
import { authUser, authInvestor } from "../middleware/authRoles.js";
import adminAuth from "../middleware/adminAuth.js";

const investmentRouter = express.Router();

// Allow investors to place investments
investmentRouter.post("/place", authUser, authInvestor, placeInvestment);
investmentRouter.post(
  "/place-stripe",
  authUser,
  authInvestor,
  placeInvestmentStripe
);
investmentRouter.post(
  "/place-razorpay",
  authUser,
  authInvestor,
  placeInvestmentRazorpay
);

// Admin routes
investmentRouter.get("/all", adminAuth, allInvestments);
investmentRouter.post("/user", authUser, userInvestments);
investmentRouter.post("/update-status", adminAuth, updateInvestmentStatus);

export default investmentRouter;