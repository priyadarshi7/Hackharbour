import express from 'express';
import { getProductComments, addComment, deleteComment, getAllCommentsWithProducts } from '../controller/comment.controller.js';

const commentRouter = express.Router();

// Get comments for a product
commentRouter.get("/product/:productId", getProductComments);

// Add a new comment
commentRouter.post("/add", addComment);

// Delete a comment
commentRouter.delete("/delete/:commentId", deleteComment);

commentRouter.get("/all-with-products", getAllCommentsWithProducts);

export default commentRouter;