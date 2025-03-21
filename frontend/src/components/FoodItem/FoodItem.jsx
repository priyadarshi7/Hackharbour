import React, { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';
import { useNavigate } from 'react-router-dom';

const FoodItem = ({ image, name, price, desc, id }) => {
  const { cartItems, addToCart, removeFromCart, url, currency } = useContext(StoreContext);
  const navigate = useNavigate();

  const handleItemClick = (e) => {
    // Prevent navigation if clicking on add/remove buttons
    if (e.target.closest('.add') || e.target.closest('.food-item-counter')) {
      return;
    }
    // Navigate to product detail page
    navigate(`/product/${id}`);
  };

  return (
    <div className='food-item' onClick={handleItemClick}>
      <div className='food-item-img-container'>
        <img className='food-item-image' src={url+"/images/"+image} alt="" />
        {!cartItems[id]
          ? <img className='add' onClick={(e) => {
              e.stopPropagation(); // Prevent navigation
              addToCart(id);
            }} src={assets.add_icon_white} alt="" />
          : <div className="food-item-counter" onClick={(e) => e.stopPropagation()}>
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
      </div>
    </div>
  );
};

export default FoodItem;