import investmentModel from "../models/InvestmentModel.js";
import userModel from "../models/userModel.js";

// Placing investments using COD method
const placeInvestment = async (req, res) => {
  try {
    const { userId, videoId, amount } = req.body;
    const investmentData = {
      userId,
      videoId,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newInvestment = new investmentModel(investmentData);
    await newInvestment.save();

    res.json({ success: true, message: "Investment Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing investments using Stripe method
const placeInvestmentStripe = async (req, res) => {
  // Implement Stripe payment logic here
};

// Placing investments using Razorpay method
const placeInvestmentRazorpay = async (req, res) => {
  // Implement Razorpay payment logic here
};

// All investments data from admin panel
const allInvestments = async (req, res) => {
  try {
    const investments = await investmentModel.find({});
    res.json({ success: true, investments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User's investments
const userInvestments = async (req, res) => {
  try {
    const { userId } = req.body;
    const investments = await investmentModel.find({ userId });
    res.json({ success: true, investments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update investment status from admin
const updateInvestmentStatus = async (req, res) => {
  try {
    const { investmentId, status } = req.body;
    await investmentModel.findByIdAndUpdate(investmentId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  placeInvestment,
  placeInvestmentStripe,
  placeInvestmentRazorpay,
  allInvestments,
  userInvestments,
  updateInvestmentStatus,
};