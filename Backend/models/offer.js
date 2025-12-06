import mongoose from "mongoose";
const OfferSchema = mongoose.Schema({
  offerName:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  image:[
  { public_id: String,
      url: String,}
  ],
  discount:{
   type: Number,
      required: true,
      min: 0,
      max: 100,
  }
},{timestamps:true})
const Offer = mongoose.model(OfferSchema,"Offer")
export default Offer