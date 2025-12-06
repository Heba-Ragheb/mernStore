import Order from "../models/order.js"
import User from "../models/user.js"
import Product from "../models/product.js"
import { sendEmail } from "../Mail/email.js";
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

    // Build products array with full details
    const productsWithDetails = [];
    let totalPrice = 0;

    // Validate stock and build product details
    for (const item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.productId}` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`
        });
      }

      // Reduce stock FIRST
      product.stock -= item.quantity;
      await product.save();

      // Calculate total
      const itemTotal = product.finalPrice * item.quantity;
      totalPrice += itemTotal;

      // Build product with details for order
      productsWithDetails.push({
        productId: product._id,
        name: product.name,
        price: product.finalPrice,
        quantity: item.quantity,
        images: product.images
      });
    }

    // Create order with detailed products
    const order = await Order.create({
      fullname,
      phone,
      address,
      products: productsWithDetails,
      totalPrice
    });

    // Clear the user's cart after successful order
    user.cart = [];
    await user.save();

    // Build email HTML with correct data
    const itemsRows = order.products
      .map((item) => {
        const name = item.name || "Product";
        const image = item.images?.[0]?.url || "";
        const price = Number(item.finalPrice || 0).toFixed(2);
        const qty = item.quantity || 1;
        const subtotal = (Number(item.finalPrice || 0) * qty).toFixed(2);

        return `
        <tr>
          <td style="padding:12px; border-bottom:1px solid #eee;">
            <div style="display:flex; gap:12px; align-items:center;">
              ${
                image
                  ? `<img src="${image}" alt="${name}" style="width:64px;height:64px;border-radius:8px;object-fit:cover;">`
                  : `<div style="width:64px;height:64px;border-radius:8px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#777;">No Image</div>`
              }
              <div style="font-size:15px;color:#111;font-weight:500;">${name}</div>
            </div>
          </td>
          <td style="padding:12px;text-align:center;border-bottom:1px solid #eee;color:#333;">${qty}</td>
          <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;color:#333;">$${price}</td>
          <td style="padding:12px;text-align:right;border-bottom:1px solid #eee;color:#667eea;font-weight:600;">$${subtotal}</td>
        </tr>
        `;
      })
      .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:650px;margin:40px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 6px 40px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;color:white;text-align:center;">
          <div style="width:70px;height:70px;background:rgba(255,255,255,0.2);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:15px;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h2 style="margin:0;font-size:28px;font-weight:700;">Order Confirmed!</h2>
          <p style="margin:8px 0 0;font-size:15px;opacity:0.9;">Thank you for shopping with LUXE</p>
        </div>

        <!-- Content -->
        <div style="padding:30px;">
          <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 10px;">
            Hi <strong>${user.name || "Customer"}</strong>,
          </p>
          <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 25px;">
            Your order has been confirmed! We're preparing your items for shipment.
          </p>

          <!-- Order Info -->
          <div style="background:#f8f9fa;border-radius:8px;padding:15px;margin-bottom:25px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">Order ID:</td>
                <td style="padding:6px 0;color:#333;font-size:14px;font-weight:600;text-align:right;">#${order._id.toString().slice(-8).toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#666;font-size:14px;">Order Date:</td>
                <td style="padding:6px 0;color:#333;font-size:14px;font-weight:600;text-align:right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
            </table>
          </div>

          <!-- Shipping Address -->
          <div style="margin-bottom:25px;">
            <h3 style="color:#667eea;font-size:16px;margin:0 0 12px;font-weight:600;">Shipping Address</h3>
            <div style="background:#f8f9fa;border-left:4px solid #667eea;padding:15px;border-radius:4px;">
              <p style="margin:0 0 5px;color:#333;font-weight:600;">${fullname}</p>
              <p style="margin:0 0 5px;color:#666;">${phone}</p>
              <p style="margin:0;color:#666;">${address}</p>
            </div>
          </div>

          <!-- Order Items -->
          <h3 style="color:#333;font-size:18px;margin:0 0 15px;font-weight:600;">Order Summary</h3>

          <table width="100%" style="border-collapse:collapse;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#f8f9fa;">
                <th align="left" style="padding:12px;color:#666;font-size:13px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e0e0e0;">Product</th>
                <th align="center" style="padding:12px;color:#666;font-size:13px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e0e0e0;">Qty</th>
                <th align="right" style="padding:12px;color:#666;font-size:13px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e0e0e0;">Price</th>
                <th align="right" style="padding:12px;color:#666;font-size:13px;font-weight:600;text-transform:uppercase;border-bottom:2px solid #e0e0e0;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
              <!-- Total Row -->
              <tr style="background:#f8f9fa;">
                <td colspan="3" style="padding:20px 12px;text-align:right;font-size:18px;font-weight:700;color:#333;border-top:2px solid #e0e0e0;">
                  Total:
                </td>
                <td style="padding:20px 12px;text-align:right;font-size:22px;font-weight:700;color:#667eea;border-top:2px solid #e0e0e0;">
                  $${totalPrice.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Call to Action -->
          <div style="text-align:center;margin-top:30px;">
            <p style="color:#666;font-size:14px;margin:0 0 15px;">We'll send you a shipping confirmation email as soon as your order ships.</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f8f8f8;padding:25px;text-align:center;color:#777;font-size:13px;border-top:1px solid #e0e0e0;">
          <p style="margin:0 0 10px;font-weight:600;color:#333;">Thank you for shopping with LUXE!</p>
          <p style="margin:0;">
            &copy; ${new Date().getFullYear()} LUXE Store. All rights reserved.
          </p>
          <p style="margin:10px 0 0;font-size:12px;color:#999;">
            This is an automated email. Please do not reply.
          </p>
        </div>

      </div>
    </body>
    </html>
    `;

    // Send email (assuming you have a sendEmail function)
    try {
      await sendEmail(
        user.email,
        `Order Confirmation - Order #${order._id.toString().slice(-8).toUpperCase()}`,
        html
      );
      console.log(`✅ Order confirmation email sent to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: {
        _id: order._id,
        fullname: order.fullname,
        phone: order.phone,
        address: order.address,
        products: order.products,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error("Order creation error:", error);
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
    const orders = await Order.find().populate('products.productId');
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
export const updateOrderStatus = async(req,res)=>{
    try {
    const { status } = req.body;
    const orderId = req.params.id
    const userId = req.user._id
    const user = await User.findById(userId)
    if(!user||user.role == "User"){
        return res.status(401).json({message:"unauthrized"})
    }
     const order = await Order.findByIdAndUpdate(orderId,{status},{ new: true })
    res.status(201).json({message:"order updated",order})

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