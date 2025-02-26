import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const addProduct = async (req, res) => {
  try {
    // Check if the user is a seller
    const user = await userModel.findById(req.user._id);
    if (!user || !user.role.includes("seller")) {
      return res.status(403).json({ success: false, message: "Only sellers can add products" });
    }

    const { name, description, price, unit, harvestDate, category, stock } = req.body;
    const images = [];

    // Upload images to Cloudinary
    if (req.files.image1) {
      const result = await cloudinary.uploader.upload(req.files.image1[0].path);
      images.push(result.secure_url);
    }
    if (req.files.image2) {
      const result = await cloudinary.uploader.upload(req.files.image2[0].path);
      images.push(result.secure_url);
    }
    if (req.files.image3) {
      const result = await cloudinary.uploader.upload(req.files.image3[0].path);
      images.push(result.secure_url);
    }
    if (req.files.image4) {
      const result = await cloudinary.uploader.upload(req.files.image4[0].path);
      images.push(result.secure_url);
    }
    const isActive = Number(stock) > 0;
    // Create a new product
    const newProduct = new productModel({
      name,
      description,
      price,
      unit,
      harvestDate,
      category,
      stock,
      images,
      sellerId: req.user._id,
      isActive,
    });

    await newProduct.save();
    res.status(201).json({ success: true, message: "Product Added", product: newProduct });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Function to list products
export const listProducts = async (req, res) => {
  try {
    const productsFound = await productModel
      .find({ isActive: true })
      .populate('sellerId', 'name'); // Populate seller's name

    // Map the sellerId field to a seller field
    const products = productsFound.map(product => {
      const sellerName = product.sellerId ? product.sellerId.name : 'Unknown Seller';
      return {
        ...product.toObject(),
        seller: sellerName // Set seller to the populated seller name or 'Unknown Seller'
      };
    });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Function to remove a product
export const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    console.error("Error removing product:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Function to get a single product
export const singleProduct = async (req, res) => {
  try {
    // Access product ID from req.params
    const { productId } = req.params;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, unit, harvestDate, category, stock } = req.body;

    // Set isActive false if stock is not greater than 0
    const isActive = Number(stock) > 0;

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { name, description, price, unit, harvestDate, category, stock, isActive },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product Updated', product: updatedProduct });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


export const getSellerProducts = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await productModel.find({ sellerId });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const soonToBeHarvestedProducts = async (req, res) => {
  try {
    const today = new Date();
    const soonToBeHarvested = await productModel.find({
      harvestDate: { $gte: today, $lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) } // Next 7 days
    });
    res.json({ success: true, products: soonToBeHarvested });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};