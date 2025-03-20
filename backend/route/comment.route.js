import express from "express";
import { getCommentsByProduct, addComment, deleteComment, updateComment } from "../controller/comment.controller.js";

const router = express.Router();

// Get all comments for a specific product
router.get("/product/:productId", getCommentsByProduct);

// Add a new comment
router.post("/", addComment);

// Delete a comment
router.delete("/:commentId", deleteComment);

// Update a comment
router.put("/:commentId", updateComment);

export default router;