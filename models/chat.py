from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from dotenv import load_dotenv
import os
import json
from datetime import datetime
from typing import List, Dict, Optional

load_dotenv()
if not os.getenv("GROQ_API_KEY"):
    print("Warning: GROQ_API_KEY environment variable is not set.")

app = FastAPI(title="Junglee Safari Customer Support Chatbot API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ComplaintData(BaseModel):
    message: str
    customer_name: Optional[str] = None
    contact_info: Optional[str] = None
    visit_date: Optional[str] = None
    issue_category: Optional[str] = None
    severity: Optional[str] = None
    location_in_park: Optional[str] = None
    timestamp: str

COMPLAINTS_FILE = "complaints.json"
SESSION_MEMORY = {}

def categorize_complaint(message: str) -> Dict:
    """
    Extract useful information from customer complaints
    """
    # Categories for Junglee Safari complaints
    categories = [
        "animal welfare", "staff behavior", "facilities", "ticket issues", 
        "food services", "safety concerns", "cleanliness", "wait times",
        "photography issues", "tour guide experience", "other"
    ]
    
    # Safari park locations
    locations = [
        "entrance", "safari route", "food court", "gift shop", 
        "animal enclosures", "restrooms", "parking", "viewing areas",
        "walking trails", "visitor center", "unknown"
    ]
    
    # Simple keyword matching for demo purposes
    # In production, you would use your LLM for better extraction
    category = "other"
    for c in categories:
        if c.lower() in message.lower():
            category = c
            break
    
    location = "unknown"
    for loc in locations:
        if loc.lower() in message.lower():
            location = loc
            break
    
    # Extract potential date mentions (simple regex would be used here)
    visit_date = None
    if "yesterday" in message.lower():
        visit_date = "yesterday"
    elif "last week" in message.lower():
        visit_date = "last week"
    elif "today" in message.lower():
        visit_date = "today"
    
    # Estimate severity based on keywords
    severity = "medium"
    high_urgency_words = ["dangerous", "unsafe", "emergency", "hurt", "injured", "terrible"]
    low_urgency_words = ["minor", "small", "slight", "just wondering"]
    
    if any(word in message.lower() for word in high_urgency_words):
        severity = "high"
    elif any(word in message.lower() for word in low_urgency_words):
        severity = "low"
    
    # Extract name and contact info (basic implementation)
    customer_name = None
    contact_info = None
    
    name_indicators = ["my name is", "i am", "this is"]
    for indicator in name_indicators:
        if indicator in message.lower():
            # Extract name (simplified)
            start_idx = message.lower().find(indicator) + len(indicator)
            end_idx = message.find(" ", start_idx + 10)
            if end_idx == -1:
                end_idx = len(message)
            potential_name = message[start_idx:end_idx].strip()
            if len(potential_name) > 0 and len(potential_name) < 30:  # reasonable name length
                customer_name = potential_name
    
    # Look for potential contact info (simplified)
    if "@" in message:
        # Very basic email extraction
        words = message.split()
        for word in words:
            if "@" in word:
                contact_info = word
    
    return {
        "issue_category": category,
        "location_in_park": location,
        "visit_date": visit_date,
        "severity": severity,
        "customer_name": customer_name,
        "contact_info": contact_info
    }

def save_complaint(message: str) -> None:
    """Saves customer complaints to a JSON file with enhanced metadata."""
    # Extract useful information from complaint
    complaint_info = categorize_complaint(message)
    
    complaint = {
        "message": message,
        "customer_name": complaint_info["customer_name"],
        "contact_info": complaint_info["contact_info"], 
        "visit_date": complaint_info["visit_date"],
        "issue_category": complaint_info["issue_category"],
        "severity": complaint_info["severity"],
        "location_in_park": complaint_info["location_in_park"],
        "timestamp": datetime.now().isoformat(),
        "status": "new",
        "assigned_to": None,
        "resolution": None,
        "resolution_date": None
    }
    
    # Create file if it doesn't exist
    if not os.path.exists(COMPLAINTS_FILE):
        with open(COMPLAINTS_FILE, "w") as f:
            json.dump([], f)
    
    # Read existing complaints
    try:
        with open(COMPLAINTS_FILE, "r") as f:
            complaints: List[Dict] = json.load(f)
    except json.JSONDecodeError:
        complaints = []
    
    # Add new complaint and save
    complaints.append(complaint)
    with open(COMPLAINTS_FILE, "w") as f:
        json.dump(complaints, f, indent=2)
    
    return complaint_info

def generate_prompt_based_on_complaint(message: str, complaint_info: Dict) -> str:
    """Generate a tailored prompt based on complaint information to get better responses"""
    
    # Base prompt to guide the Groq model to respond appropriately
    base_prompt = (
        "You are the customer support chatbot for Junglee Safari, a wildlife park. "
        "Respond to the customer in a helpful, empathetic manner. "
        "If they have a complaint, acknowledge it and assure them it will be addressed. "
        "Hey please ask the following if not already mentioned bu=y the user"
        """
        "message": message,
        "customer_name": complaint_info["customer_name"],
        "contact_info": complaint_info["contact_info"], 
        "visit_date": complaint_info["visit_date"],
        "issue_category": complaint_info["issue_category"],
        "severity": complaint_info["severity"],
        "location_in_park": complaint_info["location_in_park"]"
        """
    )
    
    # Add context based on extracted information
    if complaint_info["issue_category"] != "other":
        base_prompt += f"\nThe customer seems to be mentioning an issue related to {complaint_info['issue_category']}. "
    
    if complaint_info["location_in_park"] != "unknown":
        base_prompt += f"\nThe issue appears to have occurred at the {complaint_info['location_in_park']} area. "
    
    # Add severity-specific guidance
    if complaint_info["severity"] == "high":
        base_prompt += (
            "\nThis appears to be a high-priority issue. Express sincere apologies and "
            "assure them that this will be escalated immediately to management. "
            "If it's a safety concern, provide appropriate guidance."
        )
    
    # If we're missing key information, ask for it
    missing_info_prompts = []
    if not complaint_info["visit_date"]:
        missing_info_prompts.append("Ask when they visited the safari if they haven't mentioned it.")
    
    if not complaint_info["customer_name"]:
        missing_info_prompts.append("Politely ask for their name if they haven't provided it.")
    
    if not complaint_info["contact_info"]:
        missing_info_prompts.append("Ask for their contact information (email or phone) so the management can follow up.")
    
    if missing_info_prompts:
        base_prompt += "\n" + " ".join(missing_info_prompts)
    
    # Combine with the original message
    final_prompt = f"{base_prompt}\n\nCustomer message: {message}"
    return final_prompt

@app.post("/chat")
async def chat_endpoint(chat_request: ChatRequest = Body(...)):
    """Handles customer interactions with improved complaint handling."""
    try:
        # Extract session ID or create one
        session_id = chat_request.session_id or f"session_{datetime.now().timestamp()}"
        
        # Get or create memory for this session
        if session_id not in SESSION_MEMORY:
            SESSION_MEMORY[session_id] = ConversationBufferMemory()
        
        memory = SESSION_MEMORY[session_id]
        
        # Process complaint information
        complaint_info = save_complaint(chat_request.message)
        
        # Create enhanced prompt for the LLM
        enhanced_prompt = generate_prompt_based_on_complaint(chat_request.message, complaint_info)
        
        # Initialize LLM and conversation chain
        llm = ChatGroq(model="llama-3.3-70b-versatile")
        chain = ConversationChain(llm=llm, memory=memory)
        
        # Get response using the enhanced prompt
        response = chain.invoke(enhanced_prompt)
        
        # Return response with session ID
        return {
            "response": response["response"],
            "session_id": session_id,
            "complaint_logged": True,
            "complaint_category": complaint_info["issue_category"],
            "severity": complaint_info["severity"]
        }
    
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/complaints")
async def get_complaints():
    """Get all logged complaints for admin dashboard."""
    try:
        if not os.path.exists(COMPLAINTS_FILE):
            return {"complaints": []}
        
        with open(COMPLAINTS_FILE, "r") as f:
            complaints = json.load(f)
        
        return {"complaints": complaints}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving complaints: {str(e)}")

@app.put("/complaints/{complaint_index}")
async def update_complaint_status(complaint_index: int, status: str, assigned_to: Optional[str] = None):
    """Update the status of a complaint for management."""
    try:
        if not os.path.exists(COMPLAINTS_FILE):
            raise HTTPException(status_code=404, detail="No complaints file exists")
        
        with open(COMPLAINTS_FILE, "r") as f:
            complaints = json.load(f)
        
        if complaint_index >= len(complaints):
            raise HTTPException(status_code=404, detail="Complaint index out of range")
        
        # Update the complaint status
        complaints[complaint_index]["status"] = status
        if assigned_to:
            complaints[complaint_index]["assigned_to"] = assigned_to
        
        with open(COMPLAINTS_FILE, "w") as f:
            json.dump(complaints, f, indent=2)
        
        return {"success": True, "updated_complaint": complaints[complaint_index]}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating complaint: {str(e)}")
