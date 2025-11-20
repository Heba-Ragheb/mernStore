import mongoose from "mongoose";
const CategorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    image: {
        public_id: String,
        url: String,
      }
},{ timestamps: true })
const Category = mongoose.model("Category",CategorySchema)
export default Category