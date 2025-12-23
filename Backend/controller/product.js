
import { populate } from "dotenv";
import Category from "../models/category.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import mongoose from "mongoose";
// ---------------------- Add Product ----------------------
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category,subCategory,stock,discount } = req.body;
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user || user.role == "User") {
      return res.status(401).json({ message: "unauthorized" });
    }
    const images = [];

    // Single image upload
    if (req.file) {
      images.push({
        public_id: req.file.filename,
        url: req.file.path,
      });
    }

    // Multiple images upload
    if (req.files && req.files.length > 0) {
      req.files.forEach((f) =>
        images.push({
          public_id: f.filename,
          url: f.path,
        })
      );
    }
    const finalPrice= price - (price*discount)/100
    const product = await Product.create({
      name,
      price,
      description,
      category,
      subCategory,
      images,
      stock,
      finalPrice,
      discount
    });
     if(!subCategory){
      await Category.findByIdAndUpdate(category,{
        $push:{
          products:product._id
        }
      })
    }else{
    await Category.findOneAndUpdate({_id:category,"subcategories._id":subCategory},{
    $push:{
     "subcategories.$.products":product._id  }
    } )}
   
    res.status(201).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- Get All Products ----------------------
export const index = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- Show Product ----------------------
export const showProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId).populate('category');

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- Delete Product ----------------------
export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id
    const user = await User.findById(userId)
    if (!user || user.role == "User") {
      return res.status(401).json({ message: "unauthorized" });
    }
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    await Product.findByIdAndDelete(productId);
    if(!product.subCategory){
      await Category.findByIdAndUpdate(product.category,{
        $pull:{
          products:product._id
        }
      })
    }else{
    await Category.findOneAndUpdate({_id:product.category,"subcategories._id":product.subCategory},{
    $pull:{
     "subcategories.$.products":product._id  }
    } )}
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------------- Update Product ----------------------
export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true }
    );

    res.status(200).json({ message: "Product updated", updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
export const addToCard = async(req,res)=>{

  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if(!user || user.role === "Admin"){
      return res.status(401).json({message:"Cannot add to cart"});
    }
    
    const productId = req.params.id;
    const product = await Product.findById(productId);
    
    if(!product){
      return res.status(404).json({message:"Product not found"});
    }
    
    // Check if product already in cart
    const existingItem = user.cart.find(
      item => item.productId.toString() === productId
    );
    
    if (existingItem) {
      // Increase quantity
      await User.findOneAndUpdate(
        { _id: userId, "cart.productId": productId },
        { $inc: { "cart.$.quantity": 1 } },
        { new: true }
      );
    } else {
      // Add new item with quantity
      await user.updateOne({
        $push: { cart: { productId: productId, quantity: 1 } }
      });
    }
    
    const updatedUser = await User.findById(userId).populate('cart.productId');
    res.status(201).json(updatedUser);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

export const removeFromCard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || user.role === "Admin") {
      return res.status(401).json({ message: "unauthorized" });
    }

    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await User.updateOne(
      { _id: userId },
      { $pull: { cart: { productId: productId } } }
    );

    const updatedUser = await User.findById(userId);
    res.status(200).json({ message: "Removed successfully", user: updatedUser });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const indexCard = async(req,res)=>{
  
} 
// Add this new function to product.js controller
export const updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user || user.role === "Admin") {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const productId = req.params.id;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    
    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({ 
        message: `Only ${product.stock} items available in stock` 
      });
    }
    
    // Update quantity in cart
    await User.findOneAndUpdate(
      { _id: userId, "cart.productId": productId },
      { $set: { "cart.$.quantity": quantity } },
      { new: true }
    );
    
    const updatedUser = await User.findById(userId).populate('cart.productId');
    res.status(200).json(updatedUser);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}; 
export const relatedProduct = async(req,res)=>{
  try {
    const productId = req.params.id
    const product = await Product.findById(productId)
    const categoryId = product.category
    const subId = product.subCategory
    const products = await Product.find({
      category:categoryId,
      subCategory:subId,
      _id:{$ne : new mongoose.Types.ObjectId(productId)}

    })
    res.status(200).json(products);
  } catch (error) {
     console.error(error);
    res.status(500).json({ message: error.message });
 
  }
}