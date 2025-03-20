import React, { useState } from 'react';
import './AddComment.css';

const AddComment = ({ onAddComment }) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    onAddComment({ comment, rating });
    setComment('');
    setRating(5);
    setError('');
  };

  return (
    <div className="add-comment">
      <h4>Write a Review</h4>
      <form onSubmit={handleSubmit}>
        <div className="rating-selector">
          <label>Rating:</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= rating ? 'selected' : ''}`}
                onClick={() => setRating(star)}
              >
                {star <= rating ? '★' : '☆'}
              </span>
            ))}
          </div>
        </div>
        
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your thoughts about this product..."
          rows={3}
        ></textarea>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" className="submit-btn">
          Post Review
        </button>
      </form>
    </div>
  );
};

export default AddComment;