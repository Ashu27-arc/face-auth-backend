import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    method: {
        type: String
    }, // "password" or "face"
    time: {
        type: Date,
        default: Date.now
    },
});

export default mongoose.model("LoginLog", logSchema);