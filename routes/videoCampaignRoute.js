// filepath: backend/routes/videoCampaignRoute.js
import express from "express";
import {
  createCampaign,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
} from "../controllers/VideoController.js";
import adminAuth from "../middleware/adminAuth.js";
import uploadVideo from "../middleware/multerVideo.js"; // Import the video-specific multer instance


const router = express.Router();

// Admin routes
router.post("/", adminAuth, uploadVideo.single("video"), createCampaign); // Use uploadVideo
router.put("/:id", adminAuth, updateCampaign);
router.delete("/:id", adminAuth, deleteCampaign);

// Public route to view all campaigns
router.get("/", getAllCampaigns);

export default router;