import React, { useState, useEffect, useContext } from 'react';
import './CommentSection.css';
import { StoreContext } from '../../Context/StoreContext';
import CommentItem from '../CommentItem/CommentItem';
import AddComment from '../AddComment/AddComment';

const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { url, user } = useContext(StoreContext);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/api/comment/product/${productId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchComments();
    }
  }, [productId]);

  const handleAddComment = async (newComment) => {
    try {
      const response = await fetch(`${url}/api/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComment,
          productId,
          userId: user._id,
          username: user.name || 'Anonymous',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const addedComment = await response.json();
      setComments([addedComment, ...comments]);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`${url}/api/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="comment-section">
      <h3>Customer Reviews</h3>
      
      {user?._id ? (
        <AddComment onAddComment={handleAddComment} />
      ) : (
        <p className="login-message">Please log in to leave a comment</p>
      )}
      
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length === 0 ? (
        <p>No comments yet. Be the first to comment!</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onDelete={handleDeleteComment}
              isOwner={user?._id === comment.userId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;