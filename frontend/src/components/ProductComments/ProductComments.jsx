import React, { useState, useEffect, useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { Star, MessageSquare, ThumbsUp, Award, Clock, User, ChevronRight, Send } from 'lucide-react';

const ProductComments = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'positive', 'critical'
  
  // Get the store context including the token for authentication
  const { url, token } = useContext(StoreContext);
  
  // Get userName from localStorage
  const userName = localStorage.getItem('name') || 'Priyadarshi Satyakam';
  
  // Fetch comments for this product
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}/api/comment/product/${productId}`);
        const result = await response.json();
        
        if (result.success) {
          setComments(result.data);
        } else {
          console.error('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchComments();
    }
  }, [productId, url]);

  // Submit a new comment
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || !token) return;
    
    try {
      setSubmitting(true);
      
      const commentData = {
        productId,
        text: newComment.trim(),
        rating,
        userName
      };
      
      const response = await fetch(`${url}/api/comment/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify(commentData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add the new comment to the list
        setComments([result.data, ...comments]);
        // Reset form
        setNewComment('');
        setRating(5);
      } else {
        console.error('Failed to add comment:', result.message);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate average rating
  const averageRating = comments.length 
    ? (comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length).toFixed(1) 
    : 0;

  // Filter comments
  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    if (filter === 'positive') return comment.rating >= 4;
    if (filter === 'critical') return comment.rating < 4;
    return true;
  });

  // Render star rating component
  const StarRating = ({ value, onChange, interactive = false, size = 'md' }) => {
    const sizeMap = {
      sm: 16,
      md: 20,
      lg: 24,
      xl: 28
    };
    
    const starSize = interactive ? sizeMap.lg : sizeMap[size];
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => onChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer' : ''} focus:outline-none transition-transform ${interactive && 'hover:scale-110'}`}
          >
            <Star 
              size={starSize} 
              className={`${star <= value 
                ? 'text-amber-400 fill-current' 
                : 'text-gray-200'} ${interactive && 'hover:text-amber-400'} transition-colors`}
              strokeWidth={interactive ? 1.5 : 2} 
            />
          </button>
        ))}
      </div>
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate random pastel color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600',
      'bg-gradient-to-br from-green-100 to-green-200 text-green-600',
      'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600',
      'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600',
      'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600',
      'bg-gradient-to-br from-teal-100 to-teal-200 text-teal-600',
      'bg-gradient-to-br from-orange-100 to-orange-200 text-orange-600',
      'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-600',
    ];
    // Simple hash function
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Get badge for high-rated reviews
  const getReviewBadge = (rating) => {
    if (rating === 5) return { text: 'Outstanding', color: 'bg-green-500' };
    if (rating >= 4) return { text: 'Great', color: 'bg-teal-500' };
    if (rating >= 3) return { text: 'Good', color: 'bg-blue-500' };
    if (rating >= 2) return { text: 'Fair', color: 'bg-orange-500' };
    return { text: 'Needs Improvement', color: 'bg-red-500' };
  };

  // Days since review was posted
  const getDaysSince = (dateString) => {
    const today = new Date();
    const commentDate = new Date(dateString);
    const diffTime = Math.abs(today - commentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="mt-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="pt-8">
        {/* Header with curved element */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-teal-50 rounded-3xl -z-10"></div>
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-t-3xl -z-20"></div>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-full shadow-lg z-10">
            <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-full p-4">
              <MessageSquare className="text-white" size={32} />
            </div>
          </div>
          <div className="pt-12 pb-8 px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-3 mt-4">Customer Reviews</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real experiences from our customers. See what people are saying about this product.
            </p>
          </div>
        </div>
        
        {/* Review summary card */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-10 transform transition-all hover:shadow-lg">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur opacity-20"></div>
                <div className="relative bg-white rounded-full p-6 shadow-md">
                  <div className="text-6xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                    {averageRating}
                  </div>
                </div>
              </div>
              <div>
                <StarRating value={Math.round(averageRating)} size="lg" />
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <User size={14} className="mr-1" />
                  <span>Based on {comments.length} {comments.length === 1 ? 'review' : 'reviews'}</span>
                </p>
              </div>
            </div>
            
            <div className="h-20 w-px bg-gray-200 hidden lg:block"></div>
            
            <div className="w-full lg:w-auto">
              <div className="grid grid-cols-1 gap-3">
                {[5, 4, 3, 2, 1].map((num) => {
                  const count = comments.filter(c => Math.round(c.rating) === num).length;
                  const percentage = comments.length ? (count / comments.length) * 100 : 0;
                  
                  return (
                    <div key={num} className="flex items-center text-sm">
                      <Star 
                        size={14}
                        className="mr-1 text-amber-400 fill-current"
                      />
                      <span className="w-3 font-medium">{num}</span>
                      <div className="w-48 h-3 bg-gray-100 rounded-full mx-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600 font-medium w-8">{count}</span>
                      <span className="text-gray-400 text-xs ml-1">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Add new review form */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Write a Review</h3>
            {token && (
              <div className="px-4 py-2 bg-green-50 rounded-full text-green-600 text-sm font-medium flex items-center">
                <User size={14} className="mr-2" />
                {userName}
              </div>
            )}
          </div>
          
          {token ? (
            <form onSubmit={handleSubmitComment} className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-2xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Rating
                </label>
                <StarRating value={rating} onChange={setRating} interactive={true} />
              </div>
              
              <div className="relative">
                <textarea
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your honest thoughts about this product..."
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors resize-none"
                  required
                ></textarea>
                <div className="absolute bottom-4 right-4">
                  <button
                    type="submit"
                    disabled={submitting || !newComment.trim()}
                    className={`p-3 rounded-full font-medium text-white transition-all ${
                      submitting || !newComment.trim()
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-lg transform hover:-translate-y-1'
                    }`}
                  >
                    <Send size={20} className={submitting ? 'animate-pulse' : ''} />
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 italic">
                Your review will be public and may help other customers make better decisions.
              </div>
            </form>
          ) : (
            <div className="text-center py-10 px-6 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl">
              <div className="bg-white w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-sm mb-4">
                <User size={28} className="text-green-500" />
              </div>
              <p className="text-gray-600 mb-5">Please login to share your experience</p>
              <a 
                href="/login" 
                className="inline-block px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-medium hover:shadow-lg transform transition-all hover:-translate-y-1"
              >
                Login to Review
              </a>
            </div>
          )}
        </div>
        
        {/* Filter tabs */}
        {comments.length > 0 && (
          <div className="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
            {['all', 'positive', 'critical'].map((option) => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-5 py-2 rounded-full whitespace-nowrap font-medium transition-all ${
                  filter === option
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option === 'all' && 'All Reviews'}
                {option === 'positive' && 'Positive (4-5★)'}
                {option === 'critical' && 'Critical (1-3★)'}
              </button>
            ))}
            
            <div className="bg-white px-4 py-2 rounded-full shadow-sm text-sm text-gray-500 flex items-center ml-auto">
              <span className="font-medium text-gray-700 mr-1">{filteredComments.length}</span> 
              {filter !== 'all' ? 'filtered' : ''} reviews
            </div>
          </div>
        )}
        
        {/* Comments list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-green-500 opacity-20"></div>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-md">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <MessageSquare size={36} className="text-gray-300" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800 mb-3">No Reviews Yet</h4>
            <p className="text-gray-500 max-w-md mx-auto">
              Be the first to share your experience with this product and help others make informed decisions!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredComments.map((comment) => {
              const avatarClass = getAvatarColor(comment.userName);
              const badge = getReviewBadge(comment.rating);
              
              return (
                <div key={comment._id} className="bg-white rounded-3xl shadow-md p-6 transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center shadow-md ${avatarClass}`}>
                      {getInitials(comment.userName)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800 truncate">{comment.userName}</h4>
                        <div className="flex space-x-1">
                          <div className={`text-xs text-white px-2 py-1 rounded-full ${badge.color}`}>
                            {badge.text}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-1 mb-3">
                        <StarRating value={comment.rating} size="sm" />
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {getDaysSince(comment.createdAt)}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                        <p className="text-gray-700">{comment.text}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {formatDate(comment.createdAt)}
                        </div>
                        
                        <button className="text-gray-500 hover:text-amber-500 flex items-center text-sm transition-colors group">
                          <ThumbsUp size={14} className="mr-1 group-hover:scale-110 transition-transform" />
                          <span>Helpful</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Show more button */}
        {comments.length > 6 && (
          <div className="mt-8 text-center">
            <button className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-md text-green-600 font-medium hover:shadow-lg transition-all">
              Show More Reviews
              <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductComments;