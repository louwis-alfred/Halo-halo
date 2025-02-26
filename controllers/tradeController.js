import Trade from "../models/tradeModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

// Initiate a trade
export const initiateTrade = async (req, res) => {
  try {
    const { sellerTo, productIdFrom, productIdTo, quantity } = req.body;
    const sellerFrom = req.user._id;

    console.log("Initiating trade with data:", {
      sellerFrom,
      sellerTo,
      productIdFrom,
      productIdTo,
      quantity,
    });

    // Validate required fields
    if (!sellerTo || !productIdFrom || !productIdTo || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if the product being traded (productIdFrom) exists and belongs to the seller (sellerFrom)
    const productFrom = await productModel.findOne({
      _id: productIdFrom,
      sellerId: sellerFrom,
    });
    console.log("Product From:", productFrom);
    if (!productFrom) {
      return res.status(404).json({
        success: false,
        message: "Your product not found or not owned by you",
      });
    }

    // Check if the product being requested (productIdTo) exists and belongs to the recipient seller (sellerTo)
    const productTo = await productModel.findOne({
      _id: productIdTo,
      sellerId: sellerTo,
    });
    console.log("Product To:", productTo);
    if (!productTo) {
      return res.status(404).json({
        success: false,
        message: "Recipient's product not found or not owned by them",
      });
    }

    // Check if the recipient seller (sellerTo) exists and is a seller
    const sellerToUser = await userModel.findById(sellerTo);
    if (!sellerToUser || !sellerToUser.role.includes("seller")) {
      return res.status(404).json({
        success: false,
        message: "Recipient seller not found or not a valid seller",
      });
    }

    // Validate quantity
    if (quantity <= 0 || quantity > productFrom.stock) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    // Create a new trade
    const newTrade = new Trade({
      sellerFrom,
      sellerTo,
      productFrom: productIdFrom,
      productTo: productIdTo,
      quantity,
      status: "pending",
    });

    await newTrade.save();

    console.log("Trade initiated successfully:", newTrade);

    res.status(201).json({
      success: true,
      message: "Trade initiated",
      trade: newTrade,
    });
  } catch (error) {
    console.error("Error initiating trade:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Accept a trade
export const acceptTrade = async (req, res) => {
  try {
    const { tradeId } = req.body;
    const sellerTo = req.user._id;

    const trade = await Trade.findOne({ _id: tradeId, sellerTo })
      .populate("productFrom")
      .populate("productTo");

    if (!trade) {
      return res.status(404).json({
        success: false,
        message: "Trade not found or not authorized",
      });
    }

    if (!trade.canBeAccepted()) {
      return res.status(400).json({
        success: false,
        message: "Trade cannot be accepted in its current state",
      });
    }

    // Check stock availability for both products
    if (trade.productFrom.stock < trade.quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock in offered product",
      });
    }

    // Update trade status
    trade.status = "accepted";
    trade.acceptedAt = new Date();
    await trade.save();

    // Start completion timer
    setTimeout(async () => {
      const updatedTrade = await Trade.findById(tradeId)
        .populate("productFrom")
        .populate("productTo");

      if (updatedTrade.status === "accepted") {
        // Update trade status
        updatedTrade.status = "completed";
        updatedTrade.completedAt = new Date();

        // Update stock for both products
        updatedTrade.productFrom.stock -= updatedTrade.quantity;
        await updatedTrade.productFrom.save();

        await updatedTrade.save();
      }
    }, 15000);

    res.json({
      success: true,
      message: "Trade accepted",
      trade,
    });
  } catch (error) {
    console.error("Error accepting trade:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Reject a trade
export const rejectTrade = async (req, res) => {
  try {
    const { tradeId } = req.body;
    const sellerTo = req.user._id;

    // Find the trade
    const trade = await Trade.findOne({ _id: tradeId, sellerTo });
    if (!trade) {
      return res
        .status(404)
        .json({ success: false, message: "Trade not found or not authorized" });
    }

    // Update the trade status
    trade.status = "Rejected";
    await trade.save();

    res.json({ success: true, message: "Trade rejected", trade });
  } catch (error) {
    console.error("Error rejecting trade:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Release product manually
export const releaseProduct = async (req, res) => {
  try {
    const { tradeId } = req.body;
    const sellerFrom = req.user._id;

    // Find the trade
    const trade = await Trade.findOne({ _id: tradeId, sellerFrom });
    if (!trade) {
      return res
        .status(404)
        .json({ success: false, message: "Trade not found or not authorized" });
    }

    // Update the trade status to completed and mark as released
    trade.status = "Completed";
    trade.released = true;
    await trade.save();

    res.json({ success: true, message: "Product released", trade });
  } catch (error) {
    console.error("Error releasing product:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getTrades = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const trades = await Trade.find({
      $or: [{ sellerFrom: sellerId }, { sellerTo: sellerId }],
    })
      .populate("productFrom", "name description price images category")
      .populate("productTo", "name description price images category")
      .populate("sellerFrom", "name email location supportingDocument")
      .populate("sellerTo", "name email location supportingDocument")
      .sort({ createdAt: -1 });

    console.log("Fetched trades:", trades); // Debugging log

    res.json({ success: true, trades });
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Cancel a trade
export const cancelTrade = async (req, res) => {
  try {
    const { tradeId } = req.body;
    const sellerFrom = req.user._id;

    // Find the trade
    const trade = await Trade.findOne({
      _id: tradeId,
      sellerFrom,
      status: "Pending",
    });
    if (!trade) {
      return res
        .status(404)
        .json({ success: false, message: "Trade not found or not authorized" });
    }

    // Update the trade status
    trade.status = "Cancelled";
    await trade.save();

    res.json({ success: true, message: "Trade cancelled", trade });
  } catch (error) {
    console.error("Error cancelling trade:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getProductsForTrade = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    console.log("Fetching products for trade");

    // Fetch all products that are available for trade
    const products = await productModel
      .find({
        availableForTrade: true,
        stock: { $gt: 0 },
        isActive: true,
      })
      .populate({
        path: "sellerId",
        select: "name email location",
        model: "user",
      });

    // Format products with seller info
    const formattedProducts = products.map((product) => ({
      ...product._doc,
      seller: {
        _id: product.sellerId._id,
        name: product.sellerId.name,
        email: product.sellerId.email,
        location: product.sellerId.location,
      },
    }));

    res.json({
      success: true,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error in getProductsForTrade:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching available trade products",
      error: error.message,
    });
  }
};

export const getCurrentUserTradeProducts = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    console.log("Fetching current user's trade products");

    const products = await productModel
      .find({
        sellerId: currentUserId,
        availableForTrade: true,
        stock: { $gt: 0 },
        isActive: true,
      })
      .populate({
        path: "sellerId",
        select: "name email location",
      });

    res.json({
      success: true,
      products: products,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user's trade products",
      error: error.message,
    });
  }
};

export const addProductForTrade = async (req, res) => {
  try {
    const { productId } = req.body;
    const sellerId = req.user._id;

    console.log("Adding product for trade:", { productId, sellerId });

    const product = await productModel.findOne({ _id: productId, sellerId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or not owned by seller",
      });
    }

    // Mark the product as available for trade
    product.availableForTrade = true;
    await product.save();

    console.log("Product marked as available for trade:", product);

    res.json({
      success: true,
      message: "Product added for trade successfully",
      product,
    });
  } catch (error) {
    console.error("Error adding product for trade:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getAvailableTradeProducts = async (req, res) => {
  try {
    const userId = req.params.userId;

    const products = await productModel.find({
      sellerId: userId,
      availableForTrade: true,
      stock: { $gt: 0 },
      isActive: true,
    });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching available trade products",
      error: error.message,
    });
  }
};

export const getAvailableTradesForSeller = async (req, res) => {
  try {
    const { userId } = req.params;

    const products = await productModel
      .find({
        sellerId: userId,
        availableForTrade: true,
        stock: { $gt: 0 },
        isActive: true,
      })
      .populate("seller");

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching available trades",
      error: error.message,
    });
  }
};
