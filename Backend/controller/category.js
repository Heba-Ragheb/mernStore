import User from "../models/user.js"
import Category from "../models/category.js"
import Product from "../models/product.js"

export const addCategory = async (req, res) => {
    try {
        const {name} = req.body
        let image = {}
        const user = await User.findById(req.user._id)
        if (!user || user.role == "User") {
            return res.status(401).json({ message: "unautherized" })
        }
        if (req.file) {
            image = {
                public_id: req.file.filename,
                url: req.file.path
            }
        }
         const category = await Category.create({
            name , image
         })
         res.status(201).json({message:"categor created",category})
    
    } catch (error) {
         console.error(error);
    res.status(500).json({ message: error.message });
    }}
    export const index = async(req,res)=>{
       try {
         const categorys = await Category.find()
         res.status(200).json(categorys)
       } catch (error) {
          console.error(error);
    res.status(500).json({ message: error.message });
       }
    }
    export const show = async(req,res)=>{
       try {
        const categoryId = req.params.id
         const products = await Product.find({category:categoryId})
         res.status(200).json({products})
       } catch (error) {
          console.error(error);
    res.status(500).json({ message: error.message });
       }
    }