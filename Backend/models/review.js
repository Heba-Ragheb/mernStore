import mongoose from "mongoose";
const reviewSchema = mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },
    review:{
        type:String,
    },
    userName:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        min:1,
        max:5,
        default:0,
        required:true
    }
},{timestamps: true })
const Review = mongoose.model("Review",reviewSchema)
export default Review