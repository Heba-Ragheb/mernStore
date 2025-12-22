import mongoose from "mongoose";
const subCategorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    products:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Product",
            
        }
    ]
})
const CategorySchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    }, products:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Product",
            
        }
    ],
     subcategories: [subCategorySchema],
},{ timestamps: true })

const Category = mongoose.model("Category",CategorySchema)
export default Category