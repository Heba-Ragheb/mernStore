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
        card:[]
    }
)
const User = mongoose.model("User", userSchema);
export default User