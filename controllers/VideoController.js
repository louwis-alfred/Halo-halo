import VideoCampaign from "../models/videoCampaignModel.js";

// Create a new video campaign (admin only)
export const createCampaign = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const videoUrl = req.file.path; // Extract the file path
    const campaign = new VideoCampaign({
      title,
      description,
      videoUrl,
      category,
      createdBy: "admin",
    });
    await campaign.save();
    res.status(201).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all video campaigns
export const getAllCampaigns = async (req, res) => {
    try {
      const campaigns = await VideoCampaign.find({}).lean();
      res.status(200).json({ success: true, campaigns });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

// Update a video campaign
export const updateCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const updatedData = req.body;
    const campaign = await VideoCampaign.findByIdAndUpdate(campaignId, updatedData, { new: true });
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    res.status(200).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a video campaign
export const deleteCampaign = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await VideoCampaign.findByIdAndDelete(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }
    res.status(200).json({ success: true, message: "Campaign deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};