import streamlit as st
import cv2
import time
import json
import base64
import threading
import os
from datetime import datetime
import google.generativeai as genai
from PIL import Image
import numpy as np
import io

# Set page configuration for a better look
st.set_page_config(
    page_title="Auto Store Scanner",
    page_icon="🛒",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for better design
st.markdown("""
<style>
    .main {
        background-color: #1E1E1E;
        color: white;
    }
    .stButton button {
        background-color: #7245C7;
        color: white;
        border-radius: 10px;
        border: none;
        padding: 10px 20px;
        font-weight: bold;
    }
    .stButton button:hover {
        background-color: #9063DB;
    }
    .stSelectbox div[data-baseweb="select"] div {
        background-color: #383838;
        color: white;
        border-radius: 10px;
    }
    div[data-testid="stSidebar"] {
        background-color: #2D2D2D;
        padding-top: 2rem;
    }
    .cart-item {
        background-color: #2D2D2D;
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 10px;
    }
    .section-title {
        border-left: 4px solid #7245C7;
        padding-left: 10px;
    }
    div.stRadio > div {
        background-color: #2D2D2D;
        padding: 10px;
        border-radius: 10px;
    }
    div.stRadio label {
        color: white !important;
    }
    /* Success message styling */
    div[data-baseweb="notification"] {
        background-color: #00CC66 !important;
        color: white !important;
        border-radius: 10px !important;
    }
    /* Info message styling */
    .stInfo {
        background-color: #4682B4 !important;
        color: white !important;
        border-radius: 10px !important;
    }
</style>
""", unsafe_allow_html=True)

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCo9c_K03UL5LdfKfsIZibxsYfccfj-FqQ")
RECORDING_DURATION = 10  # seconds for recording/analysis
AUTO_ANALYZE = True  # Auto analyze after recording

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Initialize session state for cart
if 'cart' not in st.session_state:
    st.session_state.cart = []
if 'total' not in st.session_state:
    st.session_state.total = 0.0
if 'frames' not in st.session_state:
    st.session_state.frames = []
if 'recording' not in st.session_state:
    st.session_state.recording = False
if 'analysis_results' not in st.session_state:
    st.session_state.analysis_results = []
if 'auto_analyze' not in st.session_state:
    st.session_state.auto_analyze = AUTO_ANALYZE

# Product database
# Product database
products = {
    "shirt": {"name": "Cotton Shirt", "item_id": "shirt-001", "price": 1500.00},
    "bastar art": {"name": "Handcrafted Bastar Art", "item_id": "bastar-001", "price": 2500.00},
    "bottle": {"name": "Stainless Steel Bottle", "item_id": "bottle-001", "price": 1000.00},
    "keyring": {"name": "Metal Keyring", "item_id": "keyring-001", "price": 500.00},
    "canvas": {"name": "Art Canvas", "item_id": "canvas-001", "price": 2000.00},
    "stationery": {"name": "Stationery Set", "item_id": "stationery-001", "price": 80.00},
}

def encode_image(frame):
    """Encode image to base64 for API request"""
    # Convert frame to PIL Image
    pil_img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    # Save to bytes
    img_byte_arr = io.BytesIO()
    pil_img.save(img_byte_arr, format='JPEG')
    # Get the bytes and encode
    return base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')

def get_product_details(detected_product_id):
    """Map detected product to database product"""
    # Convert the detected product ID to lowercase for case-insensitive matching
    detected_product_id = detected_product_id.lower()
    
    # Look for exact match
    if detected_product_id in products:
        return products[detected_product_id]
    
    # Look for partial match
    for product_key, product_data in products.items():
        if detected_product_id in product_key or product_key in detected_product_id:
            return product_data
            
    # Default fallback - create a generic entry
    return {
        "name": detected_product_id.title(),
        "item_id": f"unknown-{detected_product_id}",
        "price": 1.00  # Default price
    }

def analyze_frame(frame):
    """Analyze a single frame with Gemini"""
    if frame is None:
        return None
    
    # Encode frame to base64
    encoded_image = encode_image(frame)
    
    try:
        # Create prompt for Gemini
        prompt = """
        Analyze this image from a store camera. 
        I want to detect shopping interactions where customers pick up or put back items.
        
        Supported products include: apples, bananas, oranges, water bottles, soda cans, 
        chips bags, and chocolate bars.
        
        For each interaction detected, provide:
        1. Action type: "pickup" if the customer is taking an item, "putback" if returning it
        2. Product name (use generic terms like "apple", "banana", "water bottle")
        3. Confidence level (0-1)
        
        Format your response as a valid JSON with this structure:
        {
            "interactions": [
                {
                    "action": "pickup" or "putback",
                    "product": "product_name",
                    "confidence": 0.95
                }
            ]
        }
        
        Only include interactions you're reasonably confident about (>0.6).
        If no interactions are visible, return an empty interactions list.
        """
        
        # Send request to Gemini
        response = model.generate_content(
            [prompt, {"mime_type": "image/jpeg", "data": encoded_image}]
        )
        
        # Parse response
        try:
            # Extract JSON from the response text
            response_text = response.text
            
            # Find JSON content between ``` if it exists
            if "```json" in response_text:
                json_content = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_content = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_content = response_text.strip()
            
            # Parse the JSON
            result = json.loads(json_content)
            return result
        
        except (json.JSONDecodeError, AttributeError, IndexError) as e:
            st.error(f"Error parsing Gemini response: {e}")
            st.code(response_text)
            return {"interactions": []}
    
    except Exception as e:
        st.error(f"Error calling Gemini API: {e}")
        return {"interactions": []}

def process_interactions(detection_results):
    """Process detected interactions to update cart"""
    # Track current cart changes
    cart_changes = []
    
    for result in detection_results:
        interactions = result.get("interactions", [])
        
        for interaction in interactions:
            action = interaction.get("action", "").lower()
            product = interaction.get("product", "").lower()
            confidence = interaction.get("confidence", 0)
            
            # Skip low confidence detections
            if confidence < 0.6:
                continue
            
            # Get product details
            product_details = get_product_details(product)
            
            # Add to cart changes
            cart_changes.append({
                "action": action,
                "product": product_details,
                "confidence": confidence
            })
    
    # Update cart based on all changes
    update_cart(cart_changes)
    
def update_cart(cart_changes):
    """Update the cart based on detected interactions"""
    cart_items = {item["item_id"]: item for item in st.session_state.cart}
    
    for change in cart_changes:
        action = change["action"]
        product = change["product"]
        item_id = product["item_id"]
        
        if action == "pickup":
            if item_id in cart_items:
                cart_items[item_id]["quantity"] += 1
            else:
                cart_items[item_id] = {
                    "item_id": item_id,
                    "name": product["name"],
                    "quantity": 1,
                    "price": product["price"]
                }
                
        elif action == "putback" and item_id in cart_items:
            cart_items[item_id]["quantity"] -= 1
            if cart_items[item_id]["quantity"] <= 0:
                del cart_items[item_id]
    
    # Update session state
    st.session_state.cart = list(cart_items.values())
    st.session_state.total = sum(item["price"] * item["quantity"] for item in st.session_state.cart)

def clear_cart():
    """Clear the cart"""
    st.session_state.cart = []
    st.session_state.total = 0.0

def analyze_frames():
    """Analyze captured frames"""
    # Sample frames for analysis (max 5 frames to keep it quick)
    analysis_frames = st.session_state.frames
    if len(analysis_frames) > 5:
        step = len(analysis_frames) // 5
        analysis_frames = analysis_frames[::step][:5]
    
    # Analyze each frame
    results = []
    progress_bar = st.progress(0)
    
    for i, frame in enumerate(analysis_frames):
        result = analyze_frame(frame)
        if result and "interactions" in result:
            results.append(result)
        progress = (i + 1) / len(analysis_frames)
        progress_bar.progress(progress)
    
    # Process results
    st.session_state.analysis_results = results
    process_interactions(results)
    progress_bar.empty()
    
    # Display detected items
    if any(result.get("interactions", []) for result in results):
        with st.container():
            st.markdown('<div class="section-title"><h3>Detected Items</h3></div>', unsafe_allow_html=True)
            for result in results:
                interactions = result.get("interactions", [])
                for interaction in interactions:
                    action = interaction.get("action", "")
                    product = interaction.get("product", "")
                    confidence = interaction.get("confidence", 0)
                    
                    # Use different colors for pickup vs putback
                    if action.lower() == "pickup":
                        emoji = "➕"
                        color = "#4CAF50"
                    else:
                        emoji = "➖"
                        color = "#FF5722"
                        
                    st.markdown(
                        f'<div style="background-color: #2D2D2D; padding: 10px; border-radius: 5px; '
                        f'border-left: 5px solid {color}; margin-bottom: 8px;">'
                        f'{emoji} <b>{action.upper()}:</b> {product} '
                        f'<span style="float: right; opacity: 0.7;">confidence: {confidence:.2f}</span>'
                        f'</div>',
                        unsafe_allow_html=True
                    )
    else:
        st.info("No items detected in this scan")

def recorder_page():
    """Webcam analysis page"""
    st.markdown('<h1 style="text-align: center; color: #7245C7;">🛒 Automated Store Scanner</h1>', unsafe_allow_html=True)
    
    # Create tabs for better organization
    tab1, tab2 = st.tabs(["📷 Scanner", "🛒 Cart"])
    
    with tab1:
        # Camera configuration and status
        st.markdown('<div class="section-title"><h3>Camera Setup</h3></div>', unsafe_allow_html=True)
        
        col1, col2 = st.columns([3, 1])
        with col1:
            # Fixed to use camera device 1 instead of selection
            st.info("Using camera device 1 (external camera)")
            camera_device = 1  # Fixed to device 1 as requested
        
        with col2:
            # Auto-analyze toggle
            st.session_state.auto_analyze = st.checkbox("Auto analyze", value=st.session_state.auto_analyze)
        
        # Status indicators
        if st.session_state.recording:
            st.markdown(
                '<div style="background-color: #2D2D2D; padding: 10px; border-radius: 5px; '
                'border-left: 5px solid #FF5722; margin: 10px 0px;">'
                '📽️ <b>RECORDING IN PROGRESS...</b>'
                '</div>',
                unsafe_allow_html=True
            )
        else:
            st.markdown(
                '<div style="background-color: #2D2D2D; padding: 10px; border-radius: 5px; '
                'border-left: 5px solid #4CAF50; margin: 10px 0px;">'
                '📷 <b>READY TO SCAN</b>'
                '</div>',
                unsafe_allow_html=True
            )
        
        # Webcam feed placeholder with larger size
        video_container = st.container()
        video_placeholder = video_container.empty()
        
        # Controls
        col1, col2, col3 = st.columns([1, 1, 1])
        with col1:
            start_button = st.button("▶️ Start Scanning", disabled=st.session_state.recording, use_container_width=True)
        with col2:
            stop_button = st.button("⏹️ Stop Scanning", disabled=not st.session_state.recording, use_container_width=True)
        with col3:
            analyze_button = st.button("🔍 Analyze Items", disabled=len(st.session_state.frames) == 0 or st.session_state.recording, use_container_width=True)
        
        # Results section
        results_container = st.container()
        
        # Handle start scanning
        if start_button:
            st.session_state.recording = True
            st.session_state.frames = []
            st.rerun()
        
        # Handle stop scanning
        if stop_button:
            st.session_state.recording = False
            
            # Auto analyze if enabled
            if st.session_state.auto_analyze and st.session_state.frames:
                with st.spinner("Auto-analyzing frames..."):
                    analyze_frames()
            
            st.rerun()
        
        # Handle analyze
        if analyze_button and st.session_state.frames:
            with st.spinner("Analyzing frames..."):
                analyze_frames()
    
        # Webcam capture loop
        if st.session_state.recording:
            try:
                # Fixed to use camera device 1 as requested
                cap = cv2.VideoCapture(1)
                
                # Set camera properties for better performance
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                
                if not cap.isOpened():
                    st.error("Could not open camera device 1. Trying device 0 as fallback.")
                    cap = cv2.VideoCapture(1)
                    if not cap.isOpened():
                        st.error("No cameras available. Please check your camera connections.")
                        st.session_state.recording = False
                        st.rerun()
                
                # Set up recording
                start_time = time.time()
                frame_count = 0
                
                while st.session_state.recording and (time.time() - start_time) < RECORDING_DURATION:
                    try:
                        ret, frame = cap.read()
                        
                        if not ret:
                            st.error("Failed to capture frame")
                            break
                        
                        # Save every 5th frame to reduce processing load
                        if frame_count % 5 == 0:
                            st.session_state.frames.append(frame.copy())
                        
                        # Display elapsed time
                        elapsed = time.time() - start_time
                        remaining = max(0, RECORDING_DURATION - elapsed)
                        
                        # Add status overlay to frame
                        frame_with_text = frame.copy()
                        
                        # Create semi-transparent overlay for timer
                        overlay = frame_with_text.copy()
                        cv2.rectangle(overlay, (0, 0), (250, 40), (0, 0, 0), -1)
                        frame_with_text = cv2.addWeighted(overlay, 0.5, frame_with_text, 0.5, 0)
                        
                        # Add countdown text
                        cv2.putText(
                            frame_with_text, 
                            f"Recording: {int(remaining)}s", 
                            (10, 30), 
                            cv2.FONT_HERSHEY_SIMPLEX, 
                            0.9, 
                            (255, 255, 255), 
                            2
                        )
                        
                        # Convert to RGB for Streamlit
                        rgb_frame = cv2.cvtColor(frame_with_text, cv2.COLOR_BGR2RGB)
                        
                        # Display frame
                        video_placeholder.image(rgb_frame, channels="RGB", use_container_width=True)
                        frame_count += 1
                        
                        # Short sleep to limit CPU usage
                        time.sleep(0.1)
                        
                    except Exception as e:
                        st.error(f"Error capturing frame: {str(e)}")
                        break
                
            except Exception as e:
                st.error(f"Error initializing camera: {str(e)}")
            
            finally:
                # Release camera when done
                try:
                    cap.release()
                except:
                    pass
                
                # Stop recording when time is up
                if time.time() - start_time >= RECORDING_DURATION:
                    st.session_state.recording = False
                    
                    # Auto analyze if enabled
                    if st.session_state.auto_analyze and st.session_state.frames:
                        with st.spinner("Auto-analyzing frames..."):
                            analyze_frames()
                    
                    st.rerun()
    
    with tab2:
        cart_section()

def cart_section():
    """Cart contents section"""
    st.markdown('<div class="section-title"><h2>Your Shopping Cart</h2></div>', unsafe_allow_html=True)
    
    # Cart contents
    if not st.session_state.cart:
        st.markdown(
            '<div style="text-align: center; padding: 50px; background-color: #2D2D2D; '
            'border-radius: 10px; margin: 20px 0px;">'
            '<h3>Your cart is empty</h3>'
            '<p>Scan items to add them to your cart</p>'
            '</div>',
            unsafe_allow_html=True
        )
    else:
        # Display each item
        for item in st.session_state.cart:
            st.markdown(
                f'<div class="cart-item">'
                f'<div style="display: flex; justify-content: space-between; align-items: center;">'
                f'<div><h4>{item["name"]}</h4></div>'
                f'<div>{item["quantity"]} × ₹{item["price"]:.2f}</div>'
                f'<div style="font-weight: bold; color: #7245C7;">₹{item["quantity"] * item["price"]:.2f}</div>'
                f'</div></div>',
                unsafe_allow_html=True
            )
                
        # Total
        st.markdown(
            f'<div style="background-color: #2D2D2D; padding: 15px; border-radius: 10px; '
            f'margin: 20px 0px; display: flex; justify-content: space-between; align-items: center;">'
            f'<div><h3>Total</h3></div>'
            f'<div><h2 style="color: #7245C7;">₹{st.session_state.total:.2f}</h2></div>'
            f'</div>',
            unsafe_allow_html=True
        )
    
    # Actions
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🗑️ Clear Cart", use_container_width=True):
            clear_cart()
            st.success("Cart cleared!")
            st.experimental_rerun()
    with col2:
        checkout_button = st.button("✅ Checkout", disabled=not st.session_state.cart, use_container_width=True)
        
        if checkout_button:
            # Process checkout
            receipt = {
                "items": st.session_state.cart.copy(),
                "total": st.session_state.total,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Clear cart
            clear_cart()
            
            # Show success message with receipt
            st.success("Checkout successful!")
            
            # Display receipt in a nicer format
            st.markdown('<div class="section-title"><h3>Receipt</h3></div>', unsafe_allow_html=True)
            st.markdown(
                f'<div style="background-color: #2D2D2D; padding: 20px; border-radius: 10px; '
                f'border: 1px dashed #7245C7;">'
                f'<h4>Receipt #{datetime.now().strftime("%Y%m%d%H%M%S")}</h4>'
                f'<p>Date: {receipt["timestamp"]}</p>'
                f'<hr style="border-color: #555555; margin: 15px 0px;">'
                f'</div>',
                unsafe_allow_html=True
            )
            
            # Add items to receipt
            for item in receipt["items"]:
                st.markdown(
                    f'<div style="display: flex; justify-content: space-between; '
                    f'background-color: #2D2D2D; padding: 10px; border-radius: 5px; margin-bottom: 5px;">'
                    f'<span>{item["name"]} × {item["quantity"]}</span>'
                    f'<span>₹{item["quantity"] * item["price"]:.2f}</span>'
                    f'</div>',
                    unsafe_allow_html=True
                )
            
            # Add total to receipt
            st.markdown(
                f'<div style="display: flex; justify-content: space-between; '
                f'background-color: #2D2D2D; padding: 15px; border-radius: 5px; margin-top: 10px; '
                f'font-weight: bold; border-top: 1px solid #555555;">'
                f'<span>TOTAL</span>'
                f'<span style="color: #7245C7; font-size: 1.2em;">₹{receipt["total"]:.2f}</span>'
                f'</div>',
                unsafe_allow_html=True
            )

def main():
    """Main application entry point"""
    recorder_page()

if __name__ == "__main__":
    main()
