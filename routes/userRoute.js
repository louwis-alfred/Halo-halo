import express from 'express';
import { registerUser, loginUser, adminLogin, applySeller, applyInvestor, checkSellerStatus, getSellers } from '../controllers/userController.js';
import { authUser, authSeller, authInvestor } from '../middleware/authRoles.js';
import upload from '../config/multerConfig.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);

// Routes for applying as seller and investor
userRouter.post('/apply-seller', authUser, upload.single('supportingDocument'), applySeller);
userRouter.post('/apply-investor', authUser, upload.single('supportingDocument'), applyInvestor);

// Check seller status
userRouter.get('/seller-status', authUser, checkSellerStatus);

// Fetch all sellers
userRouter.get('/sellers', authUser, getSellers);

// Example protected routes
userRouter.get('/seller', authUser, authSeller, (req, res) => {
    res.status(200).json({ success: true, message: "Seller access granted." });
});

userRouter.get('/investor', authUser, authInvestor, (req, res) => {
    res.status(200).json({ success: true, message: "Investor access granted." });
});

export default userRouter;