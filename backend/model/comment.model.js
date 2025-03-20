import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'product', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
  username: { 
    type: String, 
    required: true 
  },
  comment: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema);
export default commentModel;