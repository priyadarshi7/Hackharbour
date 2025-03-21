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
  userName: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1,
    max: 5
  }
}, { 
  timestamps: true 
});

const commentModel = mongoose.models.comment || mongoose.model("comment", commentSchema);

export default commentModel;