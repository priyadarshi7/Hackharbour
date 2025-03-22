"use client"

import { useState, useEffect, useContext } from "react"
import "aframe"
import { Entity, Scene } from "aframe-react"
import { StoreContext } from "../Context/StoreContext" // Adjust the path as needed

// Main VR App Component
const VRStore = () => {
  const [showCart, setShowCart] = useState(false)

  // Use the StoreContext instead of local state for cart functionality
  const { food_list, cartItems, addToCart, removeFromCart, getTotalCartAmount, currency } = useContext(StoreContext)

  // Function to get the appropriate 3D model based on product category
  const getModelByCategory = (category) => {
    // Map category names to their corresponding GLB model files
    const categoryModelMap = {
      Shirts: "/models/shirt.glb",
      "T-Shirts": "/models/tshirt.glb",
      Jackets: "/models/jacket.glb",
      "Caps/Hats": "/models/cap.glb",
      Mugs: "/models/mug.glb",
      "Key Chains": "/models/keychain.glb",
      Paintings: "/models/painting.glb",
      Bottles: "/models/bottle.glb",
      Stationary: "/models/stationery.glb",
      Sunglasses: "/models/sunglasses.glb",
    }

    // Return the model path if category exists in the map, otherwise use a default model
    return categoryModelMap[category] || "/models/default.glb"
  }

  // Get appropriate scale factors for different product categories
  const getScaleByCategory = (category) => {
    // Different products might need different scale factors to look appropriate in VR
    const categoryScaleMap = {
      Shirts: "0.4 0.4 0.4",
      "T-Shirts": "0.5 0.5 0.5",
      Jackets: "0.5 0.5 0.5",
      "Caps/Hats": "0.3 0.3 0.3",
      Mugs: "4 4 4",
      "Key Chains": "0.2 0.2 0.2",
      Paintings: "0.6 0.6 0.05",
      Bottles: "0.4 0.4 0.4",
      Stationary: "0.3 0.3 0.3",
      Sunglasses: "0.3 0.3 0.3",
    }

    return categoryScaleMap[category] || "0.5 0.5 0.5"
  }

  // Get category-specific colors for product displays
  const getColorByCategory = (category) => {
    const categoryColorMap = {
      Shirts: "#E3F2FD", // Light blue
      "T-Shirts": "#E8F5E9", // Light green
      Jackets: "#FFF3E0", // Light orange
      "Caps/Hats": "#F3E5F5", // Light purple
      Mugs: "#FFEBEE", // Light red
      "Key Chains": "#E0F7FA", // Light cyan
      Paintings: "#FFF8E1", // Light amber
      Bottles: "#E8EAF6", // Light indigo
      Stationary: "#F1F8E9", // Light light-green
      Sunglasses: "#EFEBE9", // Light brown
    }

    return categoryColorMap[category] || "#F5F5F5" // Light grey default
  }

  // Map food items to VR products with position information and category-specific models
  const products = food_list.map((item, index) => {
    // Create a grid layout with 3 items per row
    const row = Math.floor(index / 3)
    const col = index % 3

    return {
      id: item._id,
      name: item.name,
      price: item.price,
      category: item.category, // Add category from the item data
      model: getModelByCategory(item.category), // Get model based on category
      scale: getScaleByCategory(item.category), // Get scale based on category
      color: getColorByCategory(item.category), // Get color based on category
      position: {
        x: col * 2.5 - 2.5, // More spacing horizontally
        y: 1.5 - row * 1.8, // More spacing vertically
        z: -3,
      },
    }
  })

  // Toggle cart visibility
  const toggleCart = () => {
    setShowCart(!showCart)
  }

  // Calculate total quantity of items in cart
  const getTotalCartItems = () => {
    let total = 0
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        total += cartItems[item]
      }
    }
    return total
  }

  // Handle add to cart with StoreContext
  const handleAddToCart = (product) => {
    addToCart(product.id)

    // Visual feedback for adding to cart
    console.log(`Added ${product.name} to cart`)
  }

  // Handle remove from cart with StoreContext
  const handleRemoveFromCart = (productId) => {
    removeFromCart(productId)
  }

  // Department sections for store organization
  const departments = [
    {
      name: "Apparel",
      position: "-6 2.5 -8",
      rotation: "0 30 0",
      categories: ["Shirts", "T-Shirts", "Jackets", "Caps/Hats"],
    },
    {
      name: "Accessories",
      position: "0 2.5 -8",
      rotation: "0 0 0",
      categories: ["Mugs", "Key Chains", "Bottles", "Sunglasses"],
    },
    { name: "Home & Office", position: "6 2.5 -8", rotation: "0 -30 0", categories: ["Paintings", "Stationary"] },
  ]

  return (
    <Scene>
      {/* Environment setup - Warm store lighting and atmosphere */}
      <Entity primitive="a-sky" color="#87CEEB" /> {/* Light blue sky */}
      <Entity primitive="a-plane" position="0 0 0" rotation="-90 0 0" width="30" height="30" color="#8D6E63" />{" "}
      {/* Wood-like floor */}
      {/* Store environment */}
      <Entity primitive="a-entity" position="0 0 -5" gltf-model="/models/store_interior.glb" scale="2 2 2" />
      {/* Store name sign */}
      <Entity primitive="a-entity" position="0 3.5 -6" rotation="0 0 0">
        <Entity
          primitive="a-plane"
          width="6"
          height="1.2"
          color="#3F51B5"
          material={{ shader: "standard", metalness: 0.3, roughness: 0.7 }}
        >
          <Entity
            primitive="a-text"
            value="VIRTUAL MARKETPLACE"
            align="center"
            position="0 0 0.01"
            color="white"
            width="6"
            font="kelsonsans"
          />
        </Entity>
        {/* Decorative elements for the sign */}
        <Entity primitive="a-box" position="-3.1 0 0" width="0.2" height="1.4" depth="0.1" color="#FFC107" />
        <Entity primitive="a-box" position="3.1 0 0" width="0.2" height="1.4" depth="0.1" color="#FFC107" />
      </Entity>
      {/* Department signs */}
      {departments.map((dept, index) => (
        <Entity key={`dept-${index}`} position={dept.position} rotation={dept.rotation}>
          <Entity
            primitive="a-plane"
            width="4"
            height="0.8"
            color="#FF5722"
            material={{ shader: "standard", metalness: 0.2, roughness: 0.8 }}
          >
            <Entity
              primitive="a-text"
              value={dept.name}
              align="center"
              position="0 0 0.01"
              color="white"
              width="4"
              font="kelsonsans"
            />
          </Entity>
        </Entity>
      ))}
      {/* Enhanced lighting for store atmosphere */}
      <Entity primitive="a-light" type="ambient" color="#ffffff" intensity="0.7" />
      <Entity primitive="a-light" type="directional" color="#fffceb" intensity="0.8" position="-1 1 0" />{" "}
      {/* Warm main light */}
      <Entity
        primitive="a-light"
        type="spot"
        color="#fffceb"
        intensity="0.6"
        position="0 4 0"
        angle="60"
        penumbra="0.4"
      />{" "}
      {/* Center spotlight */}
      {/* Accent lights for products */}
      <Entity primitive="a-light" type="point" color="#ffcdd2" intensity="0.4" position="-3 2 -3" /> {/* Red accent */}
      <Entity primitive="a-light" type="point" color="#bbdefb" intensity="0.4" position="3 2 -3" /> {/* Blue accent */}
      <Entity primitive="a-light" type="point" color="#c8e6c9" intensity="0.4" position="0 2 -6" /> {/* Green accent */}
      {/* Camera with cursor for interaction */}
      <Entity primitive="a-camera" position="0 1.6 0">
        <Entity
          primitive="a-cursor"
          color="black"
          animation__click={{ property: "scale", startEvents: "click", from: "0.1 0.1 0.1", to: "1 1 1", dur: 150 }}
        />

        {/* Enhanced cart icon floating in view */}
        <Entity primitive="a-entity" position="0.7 0.7 -1">
          <Entity
            primitive="a-plane"
            width="0.25"
            height="0.25"
            material={{
              color: "#2196F3",
              opacity: 0.9,
              shader: "standard",
              metalness: 0.2,
              roughness: 0.8,
            }}
            animation__hover={{
              property: "material.emissive",
              startEvents: "mouseenter",
              endEvents: "mouseleave",
              from: "#000000",
              to: "#444444",
              dur: 200,
            }}
            events={{ click: toggleCart }}
            className="interactive"
          >
            <Entity primitive="a-image" src="/icons/cart.png" width="0.2" height="0.2" position="0 0 0.01" />
            {/* Cart item count with notification bubble */}
            <Entity
              primitive="a-circle"
              radius="0.06"
              position="0.08 0.08 0.02"
              color="#F44336"
              visible={getTotalCartItems() > 0}
            >
              <Entity
                primitive="a-text"
                value={getTotalCartItems().toString()}
                align="center"
                position="0 0 0.01"
                color="white"
                width="0.5"
                font="kelsonsans"
              />
            </Entity>
          </Entity>
        </Entity>
      </Entity>
      {/* Store shelves and fixtures */}
      <Entity primitive="a-entity" position="0 0 -5">
        {/* Central display table */}
        <Entity
          primitive="a-box"
          position="0 0.5 0"
          width="6"
          height="1"
          depth="2"
          color="#A1887F"
          material={{ shader: "standard", metalness: 0.1, roughness: 0.8 }}
        />

        {/* Side shelves */}
        <Entity
          primitive="a-box"
          position="-4 1.5 -2"
          width="0.2"
          height="3"
          depth="6"
          color="#795548"
          material={{ shader: "standard", metalness: 0.1, roughness: 0.9 }}
        />
        <Entity
          primitive="a-box"
          position="4 1.5 -2"
          width="0.2"
          height="3"
          depth="6"
          color="#795548"
          material={{ shader: "standard", metalness: 0.1, roughness: 0.9 }}
        />

        {/* Shelf boards */}
        {[-2, 0, 2].map((z, i) => (
          <Entity key={`shelf-left-${i}`}>
            <Entity
              primitive="a-box"
              position={`-3.5 ${1 + i * 0.8} ${z}`}
              width="1"
              height="0.1"
              depth="1.8"
              color="#D7CCC8"
              material={{ shader: "standard", metalness: 0.1, roughness: 0.7 }}
            />
            <Entity
              primitive="a-box"
              position={`3.5 ${1 + i * 0.8} ${z}`}
              width="1"
              height="0.1"
              depth="1.8"
              color="#D7CCC8"
              material={{ shader: "standard", metalness: 0.1, roughness: 0.7 }}
            />
          </Entity>
        ))}
      </Entity>
      {/* Decorative elements */}
      <Entity primitive="a-entity" position="0 0 0">
        {/* Plants */}
        <Entity primitive="a-cone" position="-5 0.5 -7" radius-bottom="0.5" radius-top="0.1" height="1" color="#4CAF50">
          <Entity primitive="a-cylinder" position="0 -0.5 0" radius="0.4" height="0.2" color="#795548" />
        </Entity>
        <Entity primitive="a-cone" position="5 0.5 -7" radius-bottom="0.5" radius-top="0.1" height="1" color="#4CAF50">
          <Entity primitive="a-cylinder" position="0 -0.5 0" radius="0.4" height="0.2" color="#795548" />
        </Entity>

        {/* Ceiling decorations */}
        {[-4, -2, 0, 2, 4].map((x, i) => (
          <Entity key={`ceiling-decor-${i}`}>
            <Entity primitive="a-cylinder" position={`${x} 3.5 -4`} radius="0.05" height="1" color="#BDBDBD" />
            <Entity
              primitive="a-sphere"
              position={`${x} 3 -4`}
              radius="0.2"
              color={["#F44336", "#2196F3", "#FFC107", "#4CAF50", "#9C27B0"][i]}
              material={{
                shader: "standard",
                emissive: ["#F44336", "#2196F3", "#FFC107", "#4CAF50", "#9C27B0"][i],
                emissiveIntensity: 0.3,
              }}
            />
          </Entity>
        ))}
      </Entity>
      {/* Enhanced product displays */}
      {products.map((product, index) => (
        <Entity key={product.id} position={`${product.position.x} ${product.position.y} ${product.position.z}`}>
          {/* Product platform/pedestal */}
          <Entity
            primitive="a-cylinder"
            radius="0.5"
            height="0.1"
            color={product.color}
            material={{
              shader: "standard",
              metalness: 0.2,
              roughness: 0.8,
            }}
            position="0 -0.3 0"
          />

          {/* Spotlight for product */}
          <Entity
            primitive="a-light"
            type="spot"
            color="#ffffff"
            intensity="0.5"
            position="0 2 0"
            target={`#product-model-${product.id}`}
            angle="30"
            penumbra="0.5"
          />

          {/* Product 3D model with enhanced animation */}
          <Entity
            id={`product-model-${product.id}`}
            primitive="a-entity"
            gltf-model={product.model}
            scale={product.scale}
            animation__rotate={{
              property: "rotation",
              dur: 15000,
              loop: true,
              to: "0 360 0",
              easing: "linear",
            }}
            animation__hover={{
              property: "position",
              startEvents: "mouseenter",
              endEvents: "mouseleave",
              from: "0 0 0",
              to: "0 0.1 0",
              dur: 300,
              easing: "easeInOutSine",
            }}
            className="interactive"
          />

          {/* Category label with enhanced styling */}
          <Entity primitive="a-entity" position="0 0.7 0">
            <Entity
              primitive="a-plane"
              width="1.2"
              height="0.3"
              color="#673AB7"
              opacity="0.9"
              material={{
                shader: "standard",
                metalness: 0.3,
                roughness: 0.7,
              }}
            >
              <Entity
                primitive="a-text"
                value={product.category}
                align="center"
                position="0 0 0.01"
                color="white"
                width="3"
                font="kelsonsans"
              />
            </Entity>
          </Entity>

          {/* Enhanced product info panel */}
          <Entity primitive="a-entity" position="0 -0.7 0">
            <Entity
              primitive="a-plane"
              width="1.8"
              height="0.7"
              color="white"
              material={{
                shader: "standard",
                metalness: 0.1,
                roughness: 0.9,
              }}
              animation__hover={{
                property: "material.emissive",
                startEvents: "mouseenter",
                endEvents: "mouseleave",
                from: "#000000",
                to: "#444444",
                dur: 200,
              }}
            >
              {/* Product name with background */}
              <Entity primitive="a-plane" width="1.7" height="0.25" position="0 0.2 0.01" color="#E0E0E0">
                <Entity
                  primitive="a-text"
                  value={product.name}
                  align="center"
                  position="0 0 0.01"
                  color="#212121"
                  width="3"
                  font="kelsonsans"
                />
              </Entity>

              {/* Product price with enhanced styling */}
              <Entity
                primitive="a-text"
                value={`${currency}${product.price.toFixed(2)}`}
                align="center"
                position="0 0 0.02"
                color="#1976D2"
                width="3"
                font="kelsonsans"
              />

              {/* Enhanced add to cart button */}
              <Entity
                primitive="a-plane"
                position="0 -0.2 0.01"
                width="1"
                height="0.2"
                color="#4CAF50"
                material={{
                  shader: "standard",
                  metalness: 0.2,
                  roughness: 0.8,
                }}
                animation__hover={{
                  property: "material.emissive",
                  startEvents: "mouseenter",
                  endEvents: "mouseleave",
                  from: "#000000",
                  to: "#2E7D32",
                  dur: 200,
                }}
                className="interactive"
                events={{ click: () => handleAddToCart(product) }}
              >
                <Entity
                  primitive="a-text"
                  value="ADD TO CART"
                  align="center"
                  position="0 0 0.01"
                  color="white"
                  width="3"
                  font="kelsonsans"
                />
              </Entity>
            </Entity>
          </Entity>
        </Entity>
      ))}
      {/* Enhanced shopping cart panel */}
      <Entity primitive="a-entity" position="0 1.6 -1.5" visible={showCart}>
        <Entity
          primitive="a-plane"
          width="2.2"
          height="2.2"
          color="#FFFFFF"
          material={{
            shader: "standard",
            metalness: 0.1,
            roughness: 0.9,
            opacity: 0.95,
          }}
        >
          {/* Cart header with gradient */}
          <Entity
            primitive="a-plane"
            width="2.2"
            height="0.4"
            position="0 0.9 0.01"
            color="#3F51B5"
            material={{
              shader: "standard",
              metalness: 0.3,
              roughness: 0.7,
            }}
          >
            <Entity
              primitive="a-text"
              value="YOUR SHOPPING CART"
              align="center"
              position="0 0 0.01"
              color="white"
              width="4"
              font="kelsonsans"
            />
          </Entity>

          {/* Cart items with scrolling container */}
          <Entity position="0 0.3 0.01">
            {Object.keys(cartItems).length === 0 || getTotalCartItems() === 0 ? (
              <Entity primitive="a-entity" position="0 0 0">
                <Entity primitive="a-plane" width="1.8" height="0.6" color="#F5F5F5">
                  <Entity
                    primitive="a-text"
                    value="Your cart is empty"
                    align="center"
                    position="0 0 0.01"
                    color="#9E9E9E"
                    width="4"
                    font="kelsonsans"
                  />
                  <Entity
                    primitive="a-image"
                    src="/icons/empty-cart.png"
                    width="0.3"
                    height="0.3"
                    position="0 -0.15 0.01"
                  />
                </Entity>
              </Entity>
            ) : (
              <Entity primitive="a-entity">
                {Object.keys(cartItems)
                  .map((itemId, index) => {
                    if (cartItems[itemId] <= 0) return null

                    // Find product info
                    const itemInfo = food_list.find((product) => product._id === itemId)
                    if (!itemInfo) return null

                    return (
                      <Entity key={itemId} position={`0 ${-index * 0.25} 0`}>
                        <Entity
                          primitive="a-plane"
                          width="1.8"
                          height="0.2"
                          color={index % 2 === 0 ? "#F5F5F5" : "#E0E0E0"}
                        >
                          <Entity
                            primitive="a-text"
                            value={`${itemInfo.name}`}
                            align="left"
                            position="-0.8 0.03 0.01"
                            color="#212121"
                            width="2.5"
                            font="kelsonsans"
                          />
                          <Entity
                            primitive="a-text"
                            value={`${cartItems[itemId]} × ${currency}${itemInfo.price.toFixed(2)}`}
                            align="left"
                            position="-0.8 -0.05 0.01"
                            color="#757575"
                            width="2"
                            font="kelsonsans"
                          />

                          {/* Enhanced remove item button */}
                          <Entity
                            primitive="a-plane"
                            position="0.75 0 0.01"
                            width="0.2"
                            height="0.15"
                            color="#F44336"
                            material={{
                              shader: "standard",
                              metalness: 0.2,
                              roughness: 0.8,
                            }}
                            animation__hover={{
                              property: "material.emissive",
                              startEvents: "mouseenter",
                              endEvents: "mouseleave",
                              from: "#000000",
                              to: "#D32F2F",
                              dur: 200,
                            }}
                            className="interactive"
                            events={{ click: () => handleRemoveFromCart(itemId) }}
                          >
                            <Entity
                              primitive="a-text"
                              value="X"
                              align="center"
                              position="0 0 0.01"
                              color="white"
                              width="3"
                              font="kelsonsans"
                            />
                          </Entity>
                        </Entity>
                      </Entity>
                    )
                  })
                  .filter(Boolean)}
              </Entity>
            )}
          </Entity>

          {/* Cart divider */}
          <Entity primitive="a-plane" width="1.8" height="0.02" position="0 -0.5 0.01" color="#BDBDBD" />

          {/* Enhanced cart total */}
          <Entity primitive="a-plane" width="1.8" height="0.25" position="0 -0.7 0.01" color="#E8EAF6">
            <Entity
              primitive="a-text"
              value="TOTAL:"
              align="left"
              position="-0.8 0 0.01"
              color="#3F51B5"
              width="3"
              font="kelsonsans"
            />
            <Entity
              primitive="a-text"
              value={`${currency}${getTotalCartAmount().toFixed(2)}`}
              align="right"
              position="0.8 0 0.01"
              color="#3F51B5"
              width="3"
              font="kelsonsans"
              fontWeight="bold"
            />
          </Entity>

          {/* Enhanced checkout button */}
          <Entity
            primitive="a-plane"
            position="0 -0.95 0.01"
            width="1.2"
            height="0.25"
            color="#4CAF50"
            material={{
              shader: "standard",
              metalness: 0.2,
              roughness: 0.8,
            }}
            animation__hover={{
              property: "material.emissive",
              startEvents: "mouseenter",
              endEvents: "mouseleave",
              from: "#000000",
              to: "#2E7D32",
              dur: 200,
            }}
            visible={getTotalCartItems() > 0}
            className="interactive"
            events={{
              click: () => {
                alert("Checkout functionality would go here")
                setShowCart(false)
              },
            }}
          >
            <Entity
              primitive="a-text"
              value="CHECKOUT"
              align="center"
              position="0 0 0.01"
              color="white"
              width="3"
              font="kelsonsans"
            />
          </Entity>

          {/* Enhanced close cart button */}
          <Entity
            primitive="a-plane"
            position="0.95 0.9 0.01"
            width="0.2"
            height="0.2"
            color="#757575"
            material={{
              shader: "standard",
              metalness: 0.2,
              roughness: 0.8,
            }}
            animation__hover={{
              property: "material.emissive",
              startEvents: "mouseenter",
              endEvents: "mouseleave",
              from: "#000000",
              to: "#424242",
              dur: 200,
            }}
            className="interactive"
            events={{ click: toggleCart }}
          >
            <Entity
              primitive="a-text"
              value="X"
              align="center"
              position="0 0 0.01"
              color="white"
              width="3"
              font="kelsonsans"
            />
          </Entity>
        </Entity>
      </Entity>
    </Scene>
  )
}

// CSS styles for interactive elements
const styles = `
  .interactive {
    cursor: pointer;
  }
  
  body {
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: #000;
  }
  
  .a-enter-vr-button {
    background-color: #3F51B5;
    border-radius: 5px;
    border: 2px solid white;
  }
`

// Add styles to document
const StyleSheet = () => {
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = styles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  return null
}

const VRStoreWithStyles = () => (
  <>
    <StyleSheet />
    <VRStore />
  </>
)

export default VRStoreWithStyles

