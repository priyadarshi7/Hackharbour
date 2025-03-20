from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import base64
import json
import uuid
from datetime import datetime
import google.generativeai as genai
from dotenv import load_dotenv
import uvicorn
from typing import List, Dict, Optional

# Load environment variables
load_dotenv()

# Configure Gemini AI
GEMINI_API_KEY = "AIzaSyD5Lk-4zyhINZST5dOKaBuuXOSB3DEq8YY"
if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY environment variable is not set.")
    
genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI app
app = FastAPI(title="AI Product Analyzer API")

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Storage for analysis history
ANALYSIS_HISTORY = []
HISTORY_FILE = "analysis_history.json"

# Load existing history if available
if os.path.exists(HISTORY_FILE):
    try:
        with open(HISTORY_FILE, "r") as f:
            ANALYSIS_HISTORY = json.load(f)
    except:
        ANALYSIS_HISTORY = []

# Function to analyze image using Gemini AI
async def analyze_product_image(image_base64: str) -> Dict:
    try:
        # Remove data URL prefix if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        # Decode base64 image
        image_bytes = base64.b64decode(image_base64)
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-pro-vision')
        
        # Create image part for the model
        image_part = {
            "mime_type": "image/jpeg",
            "data": image_bytes
        }
        
        # Prompt for product analysis
        prompt = """
        Analyze this product image and provide the following information:
        - Product name
        - Category
        - Estimated price (use USD)
        - Stock availability (guess based on appearance)
        - Brief description
        
        Format your response as JSON with these fields:
        {
            "name": "Product Name",
            "category": "Category",
            "price": "Estimated Price",
            "stock": "Stock Availability",
            "description": "Brief description of the product"
        }
        
        Only return the JSON object, nothing else.
        """
        
        # Generate response
        response = model.generate_content([prompt, image_part])
        
        # Extract and parse JSON from response
        result_text = response.text
        result_text = result_text.replace("```json", "").replace("```", "").strip()
        result = json.loads(result_text)
        
        # Add metadata
        timestamp = datetime.now().isoformat()
        analysis_id = f"analysis_{str(uuid.uuid4())[:8]}"
        
        result["id"] = analysis_id
        result["timestamp"] = timestamp
        
        # Save to history
        ANALYSIS_HISTORY.insert(0, result)
        if len(ANALYSIS_HISTORY) > 100:  # Limit history size
            ANALYSIS_HISTORY = ANALYSIS_HISTORY[:100]
            
        # Save history to file
        with open(HISTORY_FILE, "w") as f:
            json.dump(ANALYSIS_HISTORY, f)
            
        return result
    
    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        return {"error": str(e), "id": f"error_{str(uuid.uuid4())[:8]}", "timestamp": datetime.now().isoformat()}

# WebSocket endpoint for real-time image analysis
@app.websocket("/ws/analyze")
async def websocket_analyze(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            if "image" in data:
                # Analyze image
                result = await analyze_product_image(data["image"])
                
                # Send result back to client
                await websocket.send_json(result)
            else:
                await websocket.send_json({"error": "No image data received"})
    
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error in WebSocket: {str(e)}")
        try:
            await websocket.send_json({"error": str(e)})
        except:
            pass

# API endpoint to get analysis history
@app.get("/api/history")
async def get_history():
    return ANALYSIS_HISTORY

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "gemini_api_key_configured": bool(GEMINI_API_KEY)}

# Startup event
@app.on_event("startup")
async def startup_event():
    print("Server started successfully")
    print("API endpoints available at /api/*")
    print("WebSocket endpoint available at /ws/analyze")

# For development - mount the React app's build directory
# In production, you might use Nginx to serve the frontend
# app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")

# Run the server if executed directly
if __name__ == "__main__":
    print("Starting AI Product Analyzer server...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)