import commentModel from "../model/comment.model.js";

// Get all comments for a specific product
export const getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const comments = await commentModel.find({ productId }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Error fetching comments", error: error.message });
  }
};

// Add a new comment
export const addComment = async (req, res) => {
  try {
    const { productId, userId, username, comment, rating } = req.body;
    
    if (!productId || !userId || !username || !comment || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const newComment = new commentModel({
      productId,
      userId,
      username,
      comment,
      rating
    });
    
    const savedComment = await newComment.save();
    res.status(201).json(savedComment);
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;
    
    const comment = await commentModel.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if the user is the owner of the comment
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }
    
    await commentModel.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error: error.message });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { userId, comment, rating } = req.body;
    
    const existingComment = await commentModel.findById(commentId);
    
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Check if the user is the owner of the comment
    if (existingComment.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }
    
    existingComment.comment = comment || existingComment.comment;
    existingComment.rating = rating || existingComment.rating;
    
    const updatedComment = await existingComment.save();
    res.status(200).json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: "Error updating comment", error: error.message });
  }
};