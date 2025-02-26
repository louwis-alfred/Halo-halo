import express from "express";
import { initiateTrade, acceptTrade, rejectTrade, getTrades, getCurrentUserTradeProducts,getAvailableTradesForSeller,cancelTrade, addProductForTrade, getProductsForTrade } from "../controllers/tradeController.js";
import { authUser, authSeller } from "../middleware/authRoles.js";

const router = express.Router();
router.get('/products-for-trade', authUser, getProductsForTrade);
router.get('/current-user-products', authUser, getCurrentUserTradeProducts);
router.post("/initiate", authUser, authSeller, initiateTrade);
router.post("/accept", authUser, authSeller, acceptTrade);
router.post("/reject", authUser, authSeller, rejectTrade);
router.get("/", authUser, authSeller, getTrades);
router.post("/cancel", authUser, authSeller, cancelTrade);
router.post("/add-for-trade", authUser, authSeller, addProductForTrade);
router.get('/products-for-trade', authUser, getProductsForTrade);
router.get('/seller/:sellerId/available-trades', authUser, authSeller, getAvailableTradesForSeller);
export default router;