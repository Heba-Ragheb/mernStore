import mongoose from "mongoose";
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

    ], totalPrice: {
        type: Number
    }},
    { timestamps: true })
const Order = mongoose.model("Order", OrderSchema)
export default Order