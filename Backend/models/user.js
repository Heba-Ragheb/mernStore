import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        googleId: { type: String },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: function () { return !this.googleId; } // Only required if not OAuth
        },
        role: {
            type: String,
            enum: ["Admin", "User"],
            default: "User"
        },

        cart: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            }
        }],
        order: [{
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Order",
                required: true,
            },
            status: {
                type: String,
                default: "Pending",
            }
        }]
    }
)
const User = mongoose.model("User", userSchema);
export default User