import React, { useState, useEffect, useContext } from 'react';
import 'aframe';
import { Entity, Scene } from 'aframe-react';
import { StoreContext } from '../Context/StoreContext'; // Adjust the path as needed

// Main VR App Component
const VRStore = () => {
  const [showCart, setShowCart] = useState(false);
  
  // Use the StoreContext instead of local state for cart functionality
  const { 
    food_list, 
    cartItems, 
    addToCart, 
    removeFromCart, 
    getTotalCartAmount,
    currency
  } = useContext(StoreContext);
  
  // Function to get the appropriate 3D model based on product category
  const getModelByCategory = (category) => {
    // Map category names to their corresponding GLB model files
    const categoryModelMap = {
      "Shirts": "/models/shirt.glb",
      "T-Shirts": "/models/tshirt.glb",
      "Jackets": "/models/jacket.glb",
      "Caps/Hats": "/models/cap.glb",
      "Mugs": "/models/mug.glb",
      "Key Chains": "/models/keychain.glb",
      "Paintings": "/models/painting.glb",
      "Bottles": "/models/bottle.glb",
      "Stationary": "/models/stationery.glb",
      "Sunglasses": "/models/sunglasses.glb"
    };
    
    // Return the model path if category exists in the map, otherwise use a default model
    return categoryModelMap[category] || "/models/default.glb";
  };
  
  // Get appropriate scale factors for different product categories
  const getScaleByCategory = (category) => {
    // Different products might need different scale factors to look appropriate in VR
    const categoryScaleMap = {
      "Shirts": "0.4 0.4 0.4",
      "T-Shirts": "0.5 0.5 0.5",
      "Jackets": "0.5 0.5 0.5",
      "Caps/Hats": "0.3 0.3 0.3",
      "Mugs": "4 4 4",
      "Key Chains": "0.2 0.2 0.2",
      "Paintings": "0.6 0.6 0.05",
      "Bottles": "0.4 0.4 0.4",
      "Stationary": "0.3 0.3 0.3",
      "Sunglasses": "0.3 0.3 0.3"
    };
    
    return categoryScaleMap[category] || "0.5 0.5 0.5";
  };
  
  // Map food items to VR products with position information and category-specific models
  const products = food_list.map((item, index) => {
    // Create a grid layout with 3 items per row
    const row = Math.floor(index / 3);
    const col = index % 3;
    
    return {
      id: item._id,
      name: item.name,
      price: item.price,
      category: item.category, // Add category from the item data
      model: getModelByCategory(item.category), // Get model based on category
      scale: getScaleByCategory(item.category), // Get scale based on category
      position: { 
        x: (col * 2) - 2, // Space items horizontally
        y: 1.5 - (row * 1.5), // Space items vertically
        z: -3 
      }
    };
  });
  
  // Toggle cart visibility
  const toggleCart = () => {
    setShowCart(!showCart);
  };

  // Calculate total quantity of items in cart
  const getTotalCartItems = () => {
    let total = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        total += cartItems[item];
      }
    }
    return total;
  };
  
  // Handle add to cart with StoreContext
  const handleAddToCart = (product) => {
    addToCart(product.id);
    
    // Visual feedback for adding to cart
    console.log(`Added ${product.name} to cart`);
  };
  
  // Handle remove from cart with StoreContext
  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId);
  };
  
  return (
    <Scene>
      {/* Environment setup */}
      <Entity primitive="a-sky" color="#ECECEC" />
      <Entity primitive="a-plane" position="0 0 0" rotation="-90 0 0" width="20" height="20" color="#CCCCCC" />
      
      {/* Store shelves/environment */}
      <Entity
        primitive="a-entity"
        position="0 0 -5"
        gltf-model="/models/store_interior.glb"
        scale="2 2 2"
      />
      
      {/* Lighting */}
      <Entity primitive="a-light" type="ambient" color="#ffffff" intensity="0.5" />
      <Entity primitive="a-light" type="directional" color="#ffffff" intensity="1" position="-1 1 0" />
      
      {/* Camera with cursor for interaction */}
      <Entity primitive="a-camera" position="0 1.6 0">
        <Entity
          primitive="a-cursor"
          color="black"
          animation__click={{property: 'scale', startEvents: 'click', from: '0.1 0.1 0.1', to: '1 1 1', dur: 150}}
        />
        
        {/* Cart icon floating in view */}
        <Entity
          primitive="a-plane"
          position="0.6 0.6 -1"
          width="0.2"
          height="0.2"
          material={{src: '/icons/cart.png', transparent: true}}
          events={{click: toggleCart}}
          className="interactive"
        >
          {/* Cart item count */}
          <Entity
            primitive="a-text"
            value={getTotalCartItems().toString()}
            align="center"
            position="0.1 0.1 0.01"
            color="red"
            scale="0.5 0.5 0.5"
          />
        </Entity>
      </Entity>
      
      {/* Products display */}
      {products.map(product => (
        <Entity key={product.id} position={`${product.position.x} ${product.position.y} ${product.position.z}`}>
          {/* Product 3D model - now using category-specific models */}
          <Entity
            primitive="a-entity"
            gltf-model={product.model}
            scale={product.scale}
            animation__rotate={{property: 'rotation', dur: 10000, loop: true, to: '0 360 0', easing: 'linear'}}
            className="interactive"
          />
          
          {/* Category label above product */}
          <Entity
            primitive="a-text"
            value={product.category}
            align="center"
            position="0 0.5 0"
            color="#1E88E5"
            width="3"
          />
          
          {/* Product info panel */}
          <Entity
            primitive="a-plane"
            position="0 -0.7 0"
            rotation="0 0 0"
            width="1.5"
            height="0.5"
            color="#FFFFFF"
          >
            {/* Product name */}
            <Entity
              primitive="a-text"
              value={product.name}
              align="center"
              position="0 0.15 0.01"
              color="black"
              width="3"
            />
            
            {/* Product price */}
            <Entity
              primitive="a-text"
              value={`${currency}${product.price.toFixed(2)}`}
              align="center"
              position="0 0 0.01"
              color="black"
              width="3"
            />
            
            {/* Add to cart button */}
            <Entity
              primitive="a-plane"
              position="0 -0.15 0.01"
              width="0.8"
              height="0.15"
              color="#4CAF50"
              className="interactive"
              events={{click: () => handleAddToCart(product)}}
            >
              <Entity
                primitive="a-text"
                value="ADD TO CART"
                align="center"
                position="0 0 0.01"
                color="white"
                width="3"
              />
            </Entity>
          </Entity>
        </Entity>
      ))}
      
      {/* Shopping cart panel */}
      <Entity
        primitive="a-plane"
        position="0 1.6 -1.5"
        rotation="0 0 0"
        width="2"
        height="2"
        color="#FFFFFF"
        visible={showCart}
      >
        <Entity
          primitive="a-text"
          value="YOUR CART"
          align="center"
          position="0 0.8 0.01"
          color="black"
          width="4"
        />
        
        {/* Cart items */}
        <Entity position="0 0.5 0.01">
          {Object.keys(cartItems).length === 0 || getTotalCartItems() === 0 ? (
            <Entity
              primitive="a-text"
              value="Your cart is empty"
              align="center"
              position="0 0 0"
              color="black"
              width="4"
            />
          ) : (
            Object.keys(cartItems).map((itemId, index) => {
              if (cartItems[itemId] <= 0) return null;
              
              // Find product info
              const itemInfo = food_list.find(product => product._id === itemId);
              if (!itemInfo) return null;
              
              return (
                <Entity key={itemId} position={`0 ${-index * 0.2} 0`}>
                  <Entity
                    primitive="a-text"
                    value={`${itemInfo.name} (${cartItems[itemId]}) - ${currency}${(itemInfo.price * cartItems[itemId]).toFixed(2)}`}
                    align="left"
                    position="-0.8 0 0"
                    color="black"
                    width="3"
                  />
                  
                  {/* Remove item button */}
                  <Entity
                    primitive="a-plane"
                    position="0.75 0 0"
                    width="0.15"
                    height="0.15"
                    color="red"
                    className="interactive"
                    events={{click: () => handleRemoveFromCart(itemId)}}
                  >
                    <Entity
                      primitive="a-text"
                      value="X"
                      align="center"
                      position="0 0 0.01"
                      color="white"
                      width="3"
                    />
                  </Entity>
                </Entity>
              );
            }).filter(Boolean)
          )}
        </Entity>
        
        {/* Cart total */}
        <Entity
          primitive="a-text"
          value={`Total: ${currency}${getTotalCartAmount().toFixed(2)}`}
          align="right"
          position="0.8 -0.7 0.01"
          color="black"
          width="3"
        />
        
        {/* Checkout button */}
        <Entity
          primitive="a-plane"
          position="0 -0.8 0.01"
          width="1"
          height="0.2"
          color="#4CAF50"
          className="interactive"
          visible={getTotalCartItems() > 0}
          events={{
            click: () => {
              alert("Checkout functionality would go here");
              // Note: Don't clear cart here - checkout should be handled by the actual app
              setShowCart(false);
            }
          }}
        >
          <Entity
            primitive="a-text"
            value="CHECKOUT"
            align="center"
            position="0 0 0.01"
            color="white"
            width="3"
          />
        </Entity>
        
        {/* Close cart button */}
        <Entity
          primitive="a-plane"
          position="0.9 0.8 0.01"
          width="0.15"
          height="0.15"
          color="#555555"
          className="interactive"
          events={{click: toggleCart}}
        >
          <Entity
            primitive="a-text"
            value="X"
            align="center"
            position="0 0 0.01"
            color="white"
            width="3"
          />
        </Entity>
      </Entity>
    </Scene>
  );
};

// CSS styles for interactive elements
const styles = `
  .interactive {
    cursor: pointer;
  }
  
  body {
    margin: 0;
    padding: 0;
  }
`;

export default VRStore;