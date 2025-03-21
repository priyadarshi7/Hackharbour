import commentModel from "../model/comment.model.js";
import mongoose from "mongoose";

// Get all comments with product details
const getAllCommentsWithProducts = async (req, res) => {
  try {
    // Use aggregation to look up product details for each comment
    const commentsWithProducts = await commentModel.aggregate([
      {
        $lookup: {
          from: "products", // Your product collection name
          localField: "productId",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      {
        $unwind: {
          path: "$productDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { createdAt: -1 } // Most recent first
      }
    ]);

    res.json({ success: true, data: commentsWithProducts });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching comments with product details" });
  }
};

// Get all comments for a specific product
const getProductComments = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const comments = await commentModel.find({ productId })
      .sort({ createdAt: -1 }); // Most recent first
      
    res.json({ success: true, data: comments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching comments" });
  }
};

// Add a new comment to a product
const addComment = async (req, res) => {
  try {
    const { productId, userId, userName, text, rating } = req.body;
    
    // Create and save new comment
    const comment = new commentModel({
      productId,
      userId: mongoose.Types.ObjectId.isValid(userId) ? userId : new mongoose.Types.ObjectId(), // Convert or create new ObjectId,
      userName,
      text,
      rating
    });
    
    await comment.save();
    
    res.json({ success: true, data: comment, message: "Comment added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error adding comment" });
  }
};

// Delete a comment (optional - good for moderation)
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Only allow deletion if user owns the comment or is admin
    // You'd need to add auth middleware to check this properly
    
    await commentModel.findByIdAndDelete(commentId);
    
    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting comment" });
  }
};

export { getProductComments, addComment, deleteComment, getAllCommentsWithProducts };