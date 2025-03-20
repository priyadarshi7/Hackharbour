import streamlit as st
import google.generativeai as genai
import base64
import json
import re
import logging
import os
import time
import requests
from typing import Dict, Any, List
from datetime import datetime
from PIL import Image
import io

# Setup logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configure Gemini API
API_KEY = "AIzaSyD5Lk-4zyhINZST5dOKaBuuXOSB3DEq8YY"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# API endpoint for sending analyzed food data
API_ENDPOINT = "http://localhost:4000/api/food/add"

# Create directory for storing images if it doesn't exist
UPLOAD_DIR = "product_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize session state variables
if 'analysis_history' not in st.session_state:
    st.session_state.analysis_history = {}
if 'last_webcam_image' not in st.session_state:
    st.session_state.last_webcam_image = None
if 'last_analysis_time' not in st.session_state:
    st.session_state.last_analysis_time = 0
if 'auto_analyze' not in st.session_state:
    st.session_state.auto_analyze = False
if 'current_analysis' not in st.session_state:
    st.session_state.current_analysis = None
if 'camera_key' not in st.session_state:
    st.session_state.camera_key = 0  # Used to reset the camera
if 'api_response' not in st.session_state:
    st.session_state.api_response = None

def toggle_auto_analyze():
    st.session_state.auto_analyze = not st.session_state.auto_analyze
    if st.session_state.auto_analyze:
        st.session_state.last_analysis_time = 0  # Reset to trigger immediate analysis

def analyze_product_image(image_data: bytes) -> Dict[str, Any]:
    """Analyze product image using Gemini AI"""
    prompt_text = """
    Analyze this product image and return details in JSON format with these keys:
    - name (product name)
    - category (e.g., Electronics, Accessories, Apparel)
    - price (estimated price in INR)
    - stock (approximate stock availability)
    - key_features (list of 3-5 key product features)
    - description (concise product description, max 100 words)
    Return only a valid JSON object, without any additional text.
    """
    
    try:
        # Convert bytes to base64
        image_b64 = base64.b64encode(image_data).decode('utf-8')
        
        response = model.generate_content(
            [
                {"mime_type": "image/jpeg", "data": image_b64},
                {"text": prompt_text},
            ]
        )
        
        # Extract response text
        response_text = response.text
        
        # Extract JSON safely
        match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if match:
            json_text = match.group(0)
            try:
                product_data = json.loads(json_text)
                
                # Ensure price is a string
                if "price" in product_data and isinstance(product_data["price"], (int, float)):
                    product_data["price"] = str(product_data["price"])
                
                return product_data
            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON response: {response_text}")
                return {"error": "Failed to parse response"}
        else:
            logger.error(f"No valid JSON found in response: {response_text}")
            return {"error": "No valid JSON found in response"}
    except Exception as e:
        logger.error(f"Error analyzing product: {str(e)}")
        return {"error": str(e)}

def save_and_analyze_image(image_file):
    # Generate unique ID for this analysis
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    image_id = f"product_{timestamp}"
    
    # Read image data
    image_data = image_file.getvalue()
    
    # Save image to file
    image_path = os.path.join(UPLOAD_DIR, f"{image_id}.jpg")
    with open(image_path, "wb") as f:
        f.write(image_data)
    
    logger.info(f"Image saved to {image_path}, analyzing...")
    
    # Analyze the image
    analysis_result = analyze_product_image(image_data)
    
    # Add metadata and image path
    result_with_metadata = {
        "id": image_id,
        "timestamp": timestamp,
        "image_path": image_path,
        **analysis_result
    }
    
    # Store in history
    st.session_state.analysis_history[image_id] = result_with_metadata
    
    return result_with_metadata

def reset_camera():
    """Reset the camera by incrementing the camera key"""
    st.session_state.camera_key += 1
    st.session_state.last_webcam_image = None

def send_to_api(analysis_data):
    """Send the analyzed data to the API endpoint"""
    try:
        # Prepare data for the API
        api_data = {
            "name": analysis_data.get("name", "Unknown Product"),
            "category": analysis_data.get("category", "Uncategorized"),
            "price": analysis_data.get("price", "0"),
            "description": analysis_data.get("description", ""),
            "features": analysis_data.get("key_features", []),
            "stock": analysis_data.get("stock", "Unknown"),
            "imageId": analysis_data.get("id", "")
        }
        
        # Send POST request to API
        response = requests.post(API_ENDPOINT, json=api_data)
        
        # Check response
        if response.status_code == 200 or response.status_code == 201:
            return {"success": True, "message": "Data successfully sent to API", "data": response.json()}
        else:
            return {"success": False, "message": f"API Error: {response.status_code}", "data": response.text}
    
    except Exception as e:
        logger.error(f"Error sending data to API: {str(e)}")
        return {"success": False, "message": f"Error: {str(e)}", "data": None}

def main():
    st.set_page_config(
        page_title="Real-time Product Analyzer",
        page_icon="🔍",
        layout="wide",
        initial_sidebar_state="collapsed"
    )
    
    # Apply global styling
    st.markdown("""
    <style>
    /* Global Styles */
    .main .block-container {
        padding-top: 1rem;
        padding-bottom: 1rem;
        max-width: 1200px;
    }
    
    /* Custom Container Styling */
    .custom-container {
        background-color: #1E1E1E;
        color: white;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
    }
    
    /* Header Styling */
    .app-header {
        text-align: center;
        padding-bottom: 10px;
        border-bottom: 1px solid #333;
        margin-bottom: 20px;
    }
    
    /* Tab Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 0;
        background-color: #2C2C2C;
        border-radius: 10px 10px 0 0;
        padding: 0 20px;
    }
    
    .stTabs [data-baseweb="tab"] {
        padding: 15px 20px;
        color: #CCC;
    }
    
    .stTabs [data-baseweb="tab-highlight"] {
        background-color: #4CAF50;
    }
    
    .stTabs [data-baseweb="tab-panel"] {
        background-color: #2C2C2C;
        border-radius: 0 0 10px 10px;
        padding: 20px;
    }
    
    /* Product Card Styling */
    .product-card {
        background-color: #333;
        border-radius: 10px;
        padding: 20px;
        color: white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .card-header {
        border-bottom: 1px solid #444;
        padding-bottom: 15px;
        margin-bottom: 15px;
    }
    
    .feature-item {
        background-color: #2C2C2C;
        padding: 8px 12px;
        border-radius: 5px;
        margin: 5px 0;
    }
    
    /* Button Styling */
    .stButton > button {
        border-radius: 5px;
        padding: 10px 15px;
        font-weight: 500;
        transition: all 0.3s;
    }
    
    .primary-btn {
        background-color: #4CAF50;
        color: white;
    }
    
    .secondary-btn {
        background-color: #333;
        color: white;
        border: 1px solid #555;
    }
    
    /* Camera Container */
    .camera-container {
        background-color: #1E1E1E;
        border-radius: 10px;
        padding: 15px;
        border: 1px solid #333;
    }
    
    /* Override Streamlit Camera Input styling */
    [data-testid="stCamera"] > div {
        background-color: transparent !important;
        border: none !important;
    }
    
    [data-testid="stCamera"] video {
        border-radius: 10px;
    }
    
    /* Select box styling */
    .stSelectbox {
        background-color: #2C2C2C;
        border-radius: 5px;
        padding: 5px;
    }
    
    /* Analysis Status */
    .status-box {
        padding: 10px 15px;
        border-radius: 5px;
        margin: 10px 0;
        font-size: 0.9em;
    }
    
    .auto-on {
        background-color: rgba(76, 175, 80, 0.2);
        border: 1px solid #4CAF50;
    }
    
    .no-results {
        background-color: rgba(255, 255, 255, 0.05);
        border: 1px solid #444;
    }
    
    /* API Response Styling */
    .api-success {
        background-color: rgba(76, 175, 80, 0.2);
        border: 1px solid #4CAF50;
        padding: 10px;
        border-radius: 5px;
        margin-top: 10px;
    }
    
    .api-error {
        background-color: rgba(255, 87, 34, 0.2);
        border: 1px solid #FF5722;
        padding: 10px;
        border-radius: 5px;
        margin-top: 10px;
    }
    
    /* Hide Streamlit branding */
    #MainMenu, footer, header {
        visibility: hidden;
    }
    
    /* Fix for white border in display */
    [data-testid="stVerticalBlock"] {
        gap: 0 !important;
    }
    
    [data-testid="stHorizontalBlock"] {
        gap: 20px !important;
    }
    
    /* Custom divider */
    .custom-divider {
        height: 1px;
        background-color: #333;
        margin: 15px 0;
    }
    
    /* Product details styling */
    .product-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .product-info p {
        margin: 0;
        padding: 0;
    }
    
    .info-label {
        color: #AAA;
        font-size: 0.9em;
    }
    
    .info-value {
        font-weight: 500;
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Application header
    st.markdown('<div class="app-header">', unsafe_allow_html=True)
    st.title("Real-time Product Analyzer")
    st.markdown('<p style="font-size: 1.2em; opacity: 0.8;">Instantly analyze products using camera and Gemini AI</p>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Create custom styled tabs
    tab1, tab2 = st.tabs(["📸 Analyze Product", "📊 Analysis History"])
    
    with tab1:
        # Choose input method
        col_method1, col_method2 = st.columns(2)
        with col_method1:
            camera_method = st.button("📷 Camera Capture", key="camera_method", use_container_width=True)
        with col_method2:
            upload_method = st.button("📤 Upload Image", key="upload_method", use_container_width=True)
        
        st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)
        
        # Set the method based on button clicks
        if 'input_method' not in st.session_state:
            st.session_state.input_method = "camera"  # Default to camera
        
        if camera_method:
            st.session_state.input_method = "camera"
        elif upload_method:
            st.session_state.input_method = "upload"
        
        if st.session_state.input_method == "camera":  # Camera Method
            # Create a two-column layout for camera and results
            col1, col2 = st.columns([5, 7])
            
            with col1:
                st.markdown('<div class="camera-container">', unsafe_allow_html=True)
                st.markdown('<h3 style="margin-top: 0; font-size: 1.2em;">📷 Camera Feed</h3>', unsafe_allow_html=True)
                
                # Camera input
                img_file_buffer = st.camera_input("", key=f"camera_{st.session_state.camera_key}", label_visibility="collapsed")
                
                # Camera controls
                col_auto, col_capture = st.columns(2)
                
                with col_auto:
                    auto_analyze = st.checkbox("🔄 Auto-analyze", 
                                             value=st.session_state.auto_analyze, 
                                             help="Automatically analyze images as they're captured",
                                             on_change=toggle_auto_analyze)
                                             
                with col_capture:
                    if not st.session_state.auto_analyze:
                        analyze_button = st.button("🔍 Analyze", key="manual_analyze_btn", use_container_width=True)
                    else:
                        reset_button = st.button("🔄 Reset", key="reset_camera_btn", use_container_width=True)
                        if reset_button:
                            reset_camera()
                            st.session_state.current_analysis = None
                            st.session_state.api_response = None
                            st.rerun()
                
                # Status indicator
                if st.session_state.auto_analyze:
                    st.markdown('<div class="status-box auto-on">🔄 Auto-analysis is active. Images will be processed immediately.</div>', unsafe_allow_html=True)
                
                # Clear button (separate from other controls)
                if img_file_buffer is not None:
                    if st.button("❌ Clear Camera", key="clear_camera_btn", use_container_width=True):
                        reset_camera()
                        st.session_state.current_analysis = None
                        st.session_state.api_response = None
                        st.rerun()
                
                st.markdown('</div>', unsafe_allow_html=True)
                
                # Image analysis logic
                if img_file_buffer is not None and img_file_buffer != st.session_state.last_webcam_image:
                    st.session_state.last_webcam_image = img_file_buffer
                    
                    # If auto-analyze is on or the analyze button was pressed
                    current_time = time.time()
                    if (st.session_state.auto_analyze and 
                        current_time - st.session_state.last_analysis_time > 2):  # Throttle to avoid too many API calls
                        st.session_state.last_analysis_time = current_time
                        with st.spinner("Analyzing..."):
                            analysis = save_and_analyze_image(img_file_buffer)
                            st.session_state.current_analysis = analysis
                            
                            # We don't clear the camera in auto mode to avoid disrupting the user flow
                            # Instead, we clearly show the analysis result in the other column
                            st.rerun()
                    elif not st.session_state.auto_analyze and 'analyze_button' in locals() and analyze_button:
                        with st.spinner("Analyzing..."):
                            analysis = save_and_analyze_image(img_file_buffer)
                            st.session_state.current_analysis = analysis
                            st.rerun()
            
            # Analysis Results Column
            with col2:
                st.markdown('<h3 style="margin-top: 0; font-size: 1.2em;">🔍 Analysis Results</h3>', unsafe_allow_html=True)
                
                # Display analysis results or placeholder
                if st.session_state.current_analysis:
                    display_product_card(st.session_state.current_analysis)
                    
                    # Add button to send to API
                    if st.button("📤 Send to Food API", key="send_to_api_btn", use_container_width=True):
                        with st.spinner("Sending data to API..."):
                            api_response = send_to_api(st.session_state.current_analysis)
                            st.session_state.api_response = api_response
                            st.rerun()
                    
                    # Display API response if available
                    if st.session_state.api_response:
                        if st.session_state.api_response["success"]:
                            st.markdown(f'<div class="api-success">✅ {st.session_state.api_response["message"]}</div>', unsafe_allow_html=True)
                        else:
                            st.markdown(f'<div class="api-error">❌ {st.session_state.api_response["message"]}</div>', unsafe_allow_html=True)
                            st.markdown(f'<details><summary>Details</summary>{st.session_state.api_response["data"]}</details>', unsafe_allow_html=True)
                else:
                    st.markdown('<div class="status-box no-results">👈 Capture an image to see the analysis results here.</div>', unsafe_allow_html=True)
        
        else:  # Upload Method
            st.markdown('<h3 style="margin-top: 0; font-size: 1.2em;">📤 Upload Product Image</h3>', unsafe_allow_html=True)
            
            uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"], label_visibility="collapsed")
            
            if uploaded_file is not None:
                col_img, col_result = st.columns([4, 8])
                
                with col_img:
                    # Resize and display the image
                    image = Image.open(uploaded_file)
                    width, height = image.size
                    new_width = 350
                    new_height = int(height * (new_width / width))
                    resized_img = image.resize((new_width, new_height))
                    
                    st.image(resized_img, caption="Uploaded Image")
                    
                    # Analyze button
                    if st.button("🔍 Analyze Product", key="upload_analyze_btn", use_container_width=True):
                        with st.spinner("Analyzing product..."):
                            analysis = save_and_analyze_image(uploaded_file)
                            st.session_state.current_analysis = analysis
                            st.session_state.api_response = None
                            st.rerun()
                
                with col_result:
                    st.markdown('<h3 style="margin-top: 0; font-size: 1.2em;">🔍 Analysis Results</h3>', unsafe_allow_html=True)
                    # Display analysis results if available
                    if st.session_state.current_analysis:
                        display_product_card(st.session_state.current_analysis)
                        
                        # Add button to send to API
                        if st.button("📤 Send to Food API", key="upload_send_to_api_btn", use_container_width=True):
                            with st.spinner("Sending data to API..."):
                                api_response = send_to_api(st.session_state.current_analysis)
                                st.session_state.api_response = api_response
                                st.rerun()
                        
                        # Display API response if available
                        if st.session_state.api_response:
                            if st.session_state.api_response["success"]:
                                st.markdown(f'<div class="api-success">✅ {st.session_state.api_response["message"]}</div>', unsafe_allow_html=True)
                            else:
                                st.markdown(f'<div class="api-error">❌ {st.session_state.api_response["message"]}</div>', unsafe_allow_html=True)
                                st.markdown(f'<details><summary>Details</summary>{st.session_state.api_response["data"]}</details>', unsafe_allow_html=True)
                    else:
                        st.markdown('<div class="status-box no-results">👈 Click "Analyze Product" to see the results here.</div>', unsafe_allow_html=True)
            else:
                st.markdown('<div class="status-box no-results" style="text-align: center; padding: 30px;">📤 Upload a product image to analyze</div>', unsafe_allow_html=True)
    
    with tab2:
        st.markdown('<h3 style="margin-top: 0; font-size: 1.2em;">📊 Product Analysis History</h3>', unsafe_allow_html=True)
        
        # Check if history exists
        if not st.session_state.analysis_history:
            st.markdown('<div class="status-box no-results" style="text-align: center; padding: 30px;">📝 No analysis history yet. Analyze some products first!</div>', unsafe_allow_html=True)
        else:
            # Prepare history data
            analysis_ids = list(st.session_state.analysis_history.keys())
            analysis_timestamps = [st.session_state.analysis_history[aid]["timestamp"] for aid in analysis_ids]
            analysis_names = [st.session_state.analysis_history[aid].get("name", "Unknown Product") for aid in analysis_ids]
            
            # Create selection labels with timestamp and name
            selection_labels = [f"{name} ({timestamp})" for name, timestamp in zip(analysis_names, analysis_timestamps)]
            
            # Sort by most recent first
            sorted_indices = sorted(range(len(analysis_timestamps)), key=lambda i: analysis_timestamps[i], reverse=True)
            sorted_labels = [selection_labels[i] for i in sorted_indices]
            sorted_ids = [analysis_ids[i] for i in sorted_indices]
            
            col_list, col_details = st.columns([3, 7])
            
            with col_list:
                st.markdown('<div style="background-color: #2C2C2C; padding: 15px; border-radius: 10px;">', unsafe_allow_html=True)
                st.markdown('<h4 style="margin-top: 0; font-size: 1.1em;">Saved Analyses</h4>', unsafe_allow_html=True)
                
                selected_index = st.selectbox("Select a product to view details:", 
                                            range(len(sorted_labels)), 
                                            format_func=lambda i: sorted_labels[i],
                                            label_visibility="collapsed")
                
                # Show history count
                st.markdown(f'<p style="color: #AAA; font-size: 0.9em;">Total items: {len(sorted_labels)}</p>', unsafe_allow_html=True)
                
                # Clear history button
                if st.button("🗑️ Clear History", key="clear_history_btn", use_container_width=True):
                    st.session_state.analysis_history = {}
                    st.rerun()
                
                st.markdown('</div>', unsafe_allow_html=True)
            
            with col_details:
                st.markdown('<h4 style="margin-top: 0; font-size: 1.1em;">Product Details</h4>', unsafe_allow_html=True)
                
                if selected_index is not None:
                    selected_id = sorted_ids[selected_index]
                    selected_analysis = st.session_state.analysis_history[selected_id]
                    display_product_card(selected_analysis)
                    
                    # Add button to send to API for history items
                    if st.button("📤 Send to Food API", key="history_send_to_api_btn", use_container_width=True):
                        with st.spinner("Sending data to API..."):
                            api_response = send_to_api(selected_analysis)
                            st.session_state.api_response = api_response
                            st.rerun()
                    
                    # Display API response if available
                    if st.session_state.api_response:
                        if st.session_state.api_response["success"]:
                            st.markdown(f'<div class="api-success">✅ {st.session_state.api_response["message"]}</div>', unsafe_allow_html=True)
                        else:
                            st.markdown(f'<div class="api-error">❌ {st.session_state.api_response["message"]}</div>', unsafe_allow_html=True)
                            st.markdown(f'<details><summary>Details</summary>{st.session_state.api_response["data"]}</details>', unsafe_allow_html=True)

def display_product_card(analysis):
    """Display analysis results in a visually appealing dark-themed card"""
    if "error" in analysis:
        st.error(f"Analysis Error: {analysis['error']}")
        return
    
    # Start the card
    st.markdown('<div class="product-card">', unsafe_allow_html=True)
    
    # Card header with product name
    st.markdown(f'<div class="card-header"><h2 style="margin: 0; color: white;">{analysis.get("name", "Unknown Product")}</h2></div>', unsafe_allow_html=True)
    
    # Create two columns for the content
    col1, col2 = st.columns([3, 7])
    
    with col1:
        # Display the product image
        if "image_path" in analysis and os.path.exists(analysis["image_path"]):
            st.image(analysis["image_path"], width=200)
        else:
            st.image("https://via.placeholder.com/200x200?text=No+Image", width=200)
    
    with col2:
        # Display product details
        st.markdown('<div class="product-info">', unsafe_allow_html=True)
        
        st.markdown(f'<p><span class="info-label">Category:</span> <span class="info-value">{analysis.get("category", "N/A")}</span></p>', unsafe_allow_html=True)
        st.markdown(f'<p><span class="info-label">Price:</span> <span class="info-value">₹{analysis.get("price", "N/A")}</span></p>', unsafe_allow_html=True)
        st.markdown(f'<p><span class="info-label">Stock:</span> <span class="info-value">{analysis.get("stock", "N/A")}</span></p>', unsafe_allow_html=True)
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Features section
    st.markdown('<div style="margin-top: 15px;">', unsafe_allow_html=True)
    st.markdown('<h4 style="margin-bottom: 10px; color: #4CAF50;">Key Features</h4>', unsafe_allow_html=True)
    
    if "key_features" in analysis and analysis["key_features"]:
        features = analysis["key_features"]
        if isinstance(features, list):
            for feature in features:
                st.markdown(f'<div class="feature-item">• {feature}</div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="feature-item">{features}</div>', unsafe_allow_html=True)
    else:
        st.markdown('<p style="color: #AAA;">No features available</p>', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Description section
    st.markdown('<div style="margin-top: 15px;">', unsafe_allow_html=True)
    st.markdown('<h4 style="margin-bottom: 10px; color: #4CAF50;">Description</h4>', unsafe_allow_html=True)
    st.markdown(f'<p style="line-height: 1.5;">{analysis.get("description", "No description available")}</p>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Footer with metadata
    st.markdown('<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #444; font-size: 0.8em; color: #777;">', unsafe_allow_html=True)
    st.markdown(f'Analysis ID: {analysis.get("id", "N/A")} | Timestamp: {analysis.get("timestamp", "N/A")}', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Close the card
    st.markdown('</div>', unsafe_allow_html=True)

if __name__ == "__main__":
    main()