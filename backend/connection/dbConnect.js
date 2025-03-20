import mongoose from "mongoose";

export async function dbConnect(url) {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
}
