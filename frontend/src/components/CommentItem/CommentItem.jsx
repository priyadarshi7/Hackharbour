import React from 'react';
import './CommentItem.css';
import { assets } from '../../assets/assets';

const CommentItem = ({ comment, onDelete, isOwner }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Generate stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<span key={i} className="star filled">★</span>);
      } else {
        stars.push(<span key={i} className="star">☆</span>);
      }
    }
    return stars;
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="user-info">
          <div className="username">{comment.username}</div>
          <div className="comment-date">{formatDate(comment.createdAt)}</div>
        </div>
        <div className="rating">{renderStars(comment.rating)}</div>
      </div>
      <div className="comment-text">{comment.comment}</div>
      
      {isOwner && (
        <div className="comment-actions">
          <button className="delete-btn" onClick={() => onDelete(comment._id)}>
            <img src={assets.remove_icon_red} alt="Delete" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default CommentItem;