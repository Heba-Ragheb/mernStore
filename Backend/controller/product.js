import Product from "../models/product.js";
import User from "../models/user.js";
// ---------------------- Add Product ----------------------
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
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

    const product = await Product.create({
      name,
      price,
      description,
      category,
      images,
    });

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

    const product = await Product.findById(productId);

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
    const userId = req.user._id
    const user = await User.findById(userId)
    if(!user||user.role == "Admin"){
      return res.status(401).json({message:"cant add to card"})
    }
    const productId = req.params.id
    const product = await Product.findById(productId)
    if(!product){
      return res.status(404).json({message:"product not found"})
    }
    await user.updateOne({
      $push : {card : product }
    })
    res.status(201).json(user)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
export const removeFromCard = async(req,res)=>{
  try {
    const userId = req.user._id
    const user = await User.findById(userId)
    if(!user||user.role == "Admin"){
      return res.status(401).json({message:"cant add to card"})
    }
    const productId = req.params.id
    const product = await Product.findById(productId)
    if(!product){
      return res.status(404).json({message:"product not found"})
    }
    await user.updateOne({
      $pull : {card : product }, new : true
    })
    res.status(201).json(user)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}