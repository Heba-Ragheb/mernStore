import Order from "../models/order.js"
import User from "../models/user.js"
import Product from "../models/product.js"
export const addOrder = async(req,res)=>{
try {
    const{fullname,phone,address} = req.body
    //const products = []
    const userId = req.user._id
    const user = await User.findById(userId)
    const products = user.card
    if(!user||user.role == "Admin"){
        return res.status(401).json({message:"unauthrized"})
    }
    const order = await Order.create({
         fullname,phone,address,products
    })
    res.status(201).json(order)

} catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
}
}
export const removeOrder = async(req,res)=>{
    try {
    const orderId = req.params.id
    const userId = req.user._id
    const user = await User.findById(userId)
    if(!user||user.role == "Admin"){
        return res.status(401).json({message:"unauthrized"})
    }
     await Order.findByIdAndDelete(orderId)
    res.status(201).json({message:"order cancled"})

} catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
}
}
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