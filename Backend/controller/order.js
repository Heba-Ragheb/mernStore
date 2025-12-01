import Order from "../models/order.js"
import User from "../models/user.js"
import Product from "../models/product.js"
export const addOrder = async (req, res) => {
  try {
    const { fullname, phone, address } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || user.role === "Admin") {
      return res.status(401).json({ message: "unauthorized" });
    }

    const products = user.cart;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Reduce stock for each product
    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`
        });
      }

      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      fullname,
      phone,
      address,
      products,
    });

    // Clear the user's cart after successful order
    user.cart = [];
    await user.save();

    res.status(201).json(order);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const getOrder = async(req,res)=>{
      try {
    const orderId = req.params.id;
         const userId = req.user._id
    const user = await User.findById(userId)
    const order = await Order.findById(orderId);
    if(!user){
        return res.status(401).json({message:"unauthrized"})
    }
    if (!order)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
export const getAllOrder = async(req,res)=>{
      try {
    const orders = await Order.find();
     const userId = req.user._id
    const user = await User.findById(userId)
    if(!user||user.role == "User"){
        return res.status(401).json({message:"unauthrized"})
    }
    res.status(200).json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
export const updateOrder = async(req,res)=>{
    try {
    const orderId = req.params.id
    const userId = req.user._id
    const user = await User.findById(userId)
    if(!user||user.role == "Admin"){
        return res.status(401).json({message:"unauthrized"})
    }
     await Order.findByIdAndUpdate(orderId)
    res.status(201).json({message:"order updated"})

} catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
}
} 
export const removeOrder = async(req,res)=>{
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({message:"Order not found"});
    }
    
    // Restore stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }
    
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({message:"Order cancelled and stock restored"});
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}