import React, { useContext, useState } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import CommentSection from '../CommentSection/CommentSection';

const FoodItem = ({ image, name, price, desc, id }) => {
  const [itemCount, setItemCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const { cartItems, addToCart, removeFromCart, url, currency } = useContext(StoreContext);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <div className='food-item'>
      <div className='food-item-img-container'>
        <img className='food-item-image' src={url + "/images/" + image} alt="" />
        {!cartItems[id]
          ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
          : <div className="food-item-counter">
            <img src={assets.remove_icon_red} onClick={() => removeFromCart(id)} alt="" />
            <p>{cartItems[id]}</p>
            <img src={assets.add_icon_green} onClick={() => addToCart(id)} alt="" />
          </div>
        }
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p> <img src={assets.rating_starts} alt="" />
        </div>
        <p className="food-item-desc">{desc}</p>
        <p className="food-item-price">{currency}{price}</p>
        <button className="view-comments-btn" onClick={toggleComments}>
          {showComments ? 'Hide Reviews' : 'Show Reviews'}
        </button>
      </div>

      {showComments && <CommentSection productId={id} />}
    </div>
  );
};

export default FoodItem;