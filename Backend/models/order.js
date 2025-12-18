import mongoose from "mongoose";
import Product from "./product.js";
const OrderSchema = mongoose.Schema({
     userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
    fullname: {
        type: String,
        required: [true, "fullname is required"],
    },
    phone: {
        type: String,
        required: [true, "phone name is required"],
        match: /^01[0-9]{9}$/
    }
    ,
    address: {
        type: String,
        required: [true, "address name is required"],
    },
    paymentMethod: {
  type: String,
  enum: ['Online', 'Cash'],
  required: true
},
    payment: {
         type:String,
         enum: ['Paid', 'notPaid'],
          default: 'notPaid'
         },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            }, name: {
                type: String,
                required: true
            },
            finalPrice: {
                type: Number,
                required: true
            },
        }
    ],
     totalPrice: {
        type: Number
    },
    status:{
        type:String,
         enum: ['Pending', 'Processing', 'Completed', 'Cancelled','Failed'],
          default: 'Pending'
    },
},
    { timestamps: true })
const Order = mongoose.model("Order", OrderSchema)
export default Order