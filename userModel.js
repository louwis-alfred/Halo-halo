import mongoose from "mongoose";

const sellerApplicationSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  companyType: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  farmLocation: { type: String, required: true },
  contactNumber: { type: String, required: true },
  supportingDocument: { type: String, required: true },
});

const investorApplicationSchema = new mongoose.Schema({
  investmentType: { type: String, required: true },
  companyName: { type: String },
  industry: { type: String },
  contactNumber: { type: String, required: true },
  supportingDocument: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    role: {
      type: [String],
      enum: ["user", "seller", "investor"],
      default: ["user"],
    },
    sellerApplication: { type: sellerApplicationSchema, default: null },
    investorApplication: { type: investorApplicationSchema, default: null }, 
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
