import mongoose from "mongoose";
import Product from "./product.js";
const OrderSchema = mongoose.Schema({
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
    payment: {

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
         enum: ['Pending', 'Processing', 'Completed', 'Cancelled'],
          default: 'Pending'
    }
},
    { timestamps: true })
const Order = mongoose.model("Order", OrderSchema)
export default Order