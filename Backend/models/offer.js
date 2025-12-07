import mongoose from "mongoose";
const OfferSchema = mongoose.Schema({
 
  images:[
  { public_id: String,
      url: String,}
  ],

},{timestamps:true})
const Offer = mongoose.model("Offer",OfferSchema)
export default Offer