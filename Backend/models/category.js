import mongoose from "mongoose";
const subCategorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
})
const CategorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
     subcategories: [subCategorySchema],
},{ timestamps: true })

const Category = mongoose.model("Category",CategorySchema)
export default Category