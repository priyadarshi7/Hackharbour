from fastapi import FastAPI, Body, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import json
import stripe
from datetime import datetime
from typing import List, Dict, Optional, Any

load_dotenv()
if not os.getenv("GROQ_API_KEY"):
    print("Warning: GROQ_API_KEY environment variable is not set.")

# Stripe configuration
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")
if not STRIPE_API_KEY:
    print("Warning: Stripe API key is not set in environment variables.")

# Initialize Stripe
try:
    stripe.api_key = STRIPE_API_KEY
except Exception as e:
    print(f"Warning: Failed to initialize Stripe: {str(e)}")

app = FastAPI(title="Jungle Safari Ticket Booking Chatbot API")
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

class ComplaintRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class PaymentRequest(BaseModel):
    booking_id: str
    amount: int
    currency: str = "inr"
    email: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = "Jungle Safari Tickets"
    return_url: str

class BookingDetails(BaseModel):
    name: Optional[str] = None
    contact_number: Optional[str] = None
    email: Optional[str] = None
    num_tickets: Optional[int] = None
    booking_status: str = "initiated"
    payment_status: str = "pending"
    payment_intent_id: Optional[str] = None
    payment_method_id: Optional[str] = None

# Custom chat message history implementation
class InMemoryChatMessageHistory(BaseChatMessageHistory):
    def __init__(self):
        self.messages = []
    
    def add_message(self, message):
        self.messages.append(message)
    
    def clear(self):
        self.messages = []

booking_state = {}
SESSION_HISTORIES = {}
BOOKINGS_FILE = "bookings.json"
COMPLAINTS_FILE = "complaints.json"
PAYMENTS_FILE = "payments.json"
TICKET_PRICE = 500

def generate_booking_id():
    return f"JSB-{datetime.now().strftime('%Y%m%d%H%M%S')}"

def save_booking(booking_id: str, details: dict) -> None:
    booking = {
        "booking_id": booking_id,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }
    
    if not os.path.exists(BOOKINGS_FILE):
        with open(BOOKINGS_FILE, "w") as f:
            json.dump([], f)
    
    try:
        with open(BOOKINGS_FILE, "r") as f:
            bookings: List[Dict] = json.load(f)
    except json.JSONDecodeError:
        bookings = []
    
    bookings.append(booking)
    with open(BOOKINGS_FILE, "w") as f:
        json.dump(bookings, f, indent=2)

def save_payment(payment_info: dict) -> None:
    """Save payment information to file."""
    if not os.path.exists(PAYMENTS_FILE):
        with open(PAYMENTS_FILE, "w") as f:
            json.dump([], f)
    
    try:
        with open(PAYMENTS_FILE, "r") as f:
            payments: List[Dict] = json.load(f)
    except json.JSONDecodeError:
        payments = []
    
    payments.append(payment_info)
    with open(PAYMENTS_FILE, "w") as f:
        json.dump(payments, f, indent=2)

def update_booking_payment_status(booking_id: str, payment_status: str, payment_intent_id: str = None, payment_method_id: str = None) -> bool:
    """Update the payment status of a booking."""
    try:
        with open(BOOKINGS_FILE, "r") as f:
            bookings: List[Dict] = json.load(f)
        
        for booking in bookings:
            if booking["booking_id"] == booking_id:
                booking["details"]["payment_status"] = payment_status
                if payment_intent_id:
                    booking["details"]["payment_intent_id"] = payment_intent_id
                if payment_method_id:
                    booking["details"]["payment_method_id"] = payment_method_id
                
                with open(BOOKINGS_FILE, "w") as f:
                    json.dump(bookings, f, indent=2)
                return True
        
        return False
    except (json.JSONDecodeError, FileNotFoundError):
        return False

def save_complaint(message: str) -> dict:
    """Analyze and save customer complaint information."""
    complaint_info = {
        "complaint_id": f"COMP-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "issue_category": "general",
        "severity": "medium"
    }
    
    # Determine complaint category and severity based on keywords
    if "refund" in message.lower():
        complaint_info["issue_category"] = "refund"
        complaint_info["severity"] = "high"
    elif "cancel" in message.lower():
        complaint_info["issue_category"] = "cancellation"
        complaint_info["severity"] = "high"
    elif "late" in message.lower() or "delay" in message.lower():
        complaint_info["issue_category"] = "timing"
        complaint_info["severity"] = "medium"
    elif "rude" in message.lower() or "unprofessional" in message.lower():
        complaint_info["issue_category"] = "staff_behavior"
        complaint_info["severity"] = "high"
    
    # Save complaint to file
    if not os.path.exists(COMPLAINTS_FILE):
        with open(COMPLAINTS_FILE, "w") as f:
            json.dump([], f)
    
    try:
        with open(COMPLAINTS_FILE, "r") as f:
            complaints: List[Dict] = json.load(f)
    except json.JSONDecodeError:
        complaints = []
    
    complaints.append(complaint_info)
    with open(COMPLAINTS_FILE, "w") as f:
        json.dump(complaints, f, indent=2)
    
    return complaint_info

def generate_prompt_based_on_complaint(message: str, complaint_info: dict) -> str:
    """Generate an appropriate prompt based on complaint category."""
    category = complaint_info["issue_category"]
    
    if category == "refund":
        return f"Customer is asking about a refund. Message: {message}. Please provide information about our refund policy and how to process a refund request."
    elif category == "cancellation":
        return f"Customer wants to cancel a booking. Message: {message}. Please provide information about our cancellation policy and process."
    elif category == "timing":
        return f"Customer has concerns about timing or delays. Message: {message}. Please apologize for the inconvenience and provide information on what they can expect."
    elif category == "staff_behavior":
        return f"Customer has complained about staff behavior. Message: {message}. Please apologize sincerely and assure them that the matter will be investigated."
    else:
        return message

def generate_invoice(booking_id: str, details: dict) -> dict:
    """Generate a detailed invoice with payment information."""
    num_tickets = details.get("num_tickets", 0)
    total_cost = num_tickets * TICKET_PRICE
    
    return {
        "invoice_id": f"INV-{booking_id}",
        "booking_id": booking_id,
        "customer_name": details.get("name", ""),
        "contact_number": details.get("contact_number", ""),
        "email": details.get("email", ""),
        "booking_details": {
            "number_of_tickets": num_tickets,
            "price_per_ticket": TICKET_PRICE,
            "subtotal": total_cost,
            "gst": round(total_cost * 0.18, 2),  # Adding GST calculation (18%)
            "grand_total": round(total_cost * 1.18, 2)  # Total with GST
        },
        "booking_date": datetime.now().strftime("%Y-%m-%d"),
        "payment_status": details.get("payment_status", "Pending"),
        "payment_intent_id": details.get("payment_intent_id", ""),
        "payment_method_id": details.get("payment_method_id", "")
    }

# Updated message history getter function
def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in SESSION_HISTORIES:
        SESSION_HISTORIES[session_id] = InMemoryChatMessageHistory()
    
    # Initialize booking state if needed
    if session_id not in booking_state:
        booking_state[session_id] = {
            "booking_id": generate_booking_id(),
            "details": BookingDetails().dict(),
            "conversation_state": "greeting"
        }
    
    return SESSION_HISTORIES[session_id]

# Define the main chain
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a professional jungle safari ticket booking assistant. You help customers book tickets, make payments, and address any concerns they might have."),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{input}"),
])

llm = ChatGroq(model="llama-3.3-70b-versatile")
chain = prompt | llm

chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="history"
)

@app.post("/chat")
async def chat_endpoint(chat_request: ChatRequest = Body(...)):
    try:
        session_id = chat_request.session_id or "default_session"
        user_input = chat_request.message
        
        # Get current state
        if session_id not in booking_state:
            booking_state[session_id] = {
                "booking_id": generate_booking_id(),
                "details": BookingDetails().dict(),
                "conversation_state": "greeting"
            }
        
        current_state = booking_state[session_id]
        
        # Process conversation state
        if current_state["conversation_state"] == "greeting":
            response = chain_with_history.invoke(
                {"input": "Welcome to Jungle Safari Booking! May I have your name to begin?"},
                config={"configurable": {"session_id": session_id}}
            )
            current_state["conversation_state"] = "ask_name"
            
        elif current_state["conversation_state"] == "ask_name":
            current_state["details"]["name"] = user_input
            response = chain_with_history.invoke(
                {"input": f"Thank you {user_input}. Please provide your contact number."},
                config={"configurable": {"session_id": session_id}}
            )
            current_state["conversation_state"] = "ask_contact"
            
        elif current_state["conversation_state"] == "ask_contact":
            current_state["details"]["contact_number"] = user_input
            response = chain_with_history.invoke(
                {"input": f"Great! Now, please provide your email address for booking confirmations."},
                config={"configurable": {"session_id": session_id}}
            )
            current_state["conversation_state"] = "ask_email"
            
        elif current_state["conversation_state"] == "ask_email":
            current_state["details"]["email"] = user_input
            response = chain_with_history.invoke(
                {"input": f"Each ticket costs {TICKET_PRICE} rupees (plus 18% GST). How many tickets would you like?"},
                config={"configurable": {"session_id": session_id}}
            )
            current_state["conversation_state"] = "ask_tickets"
            
        elif current_state["conversation_state"] == "ask_tickets":
            try:
                num_tickets = int(user_input)
                current_state["details"]["num_tickets"] = num_tickets
                
                # Save initial booking
                save_booking(current_state["booking_id"], current_state["details"])
                
                # Generate invoice
                invoice = generate_invoice(current_state["booking_id"], current_state["details"])
                
                # Calculate total with GST
                total_amount = num_tickets * TICKET_PRICE
                total_with_gst = round(total_amount * 1.18, 0)  # 18% GST
                
                response = chain_with_history.invoke(
                    {"input": f"""Booking details confirmed:
                    Name: {current_state['details']['name']}
                    Contact: {current_state['details']['contact_number']}
                    Email: {current_state['details']['email']}
                    Tickets: {num_tickets}
                    Ticket Price: {TICKET_PRICE}₹ per ticket
                    Subtotal: {total_amount}₹
                    GST (18%): {round(total_amount * 0.18, 2)}₹
                    Total: {total_with_gst}₹
                    Booking ID: {current_state['booking_id']}
                    
                    To complete your booking, please proceed to payment."""},
                    config={"configurable": {"session_id": session_id}}
                )
                
                # Create payment info for frontend
                payment_info = {
                    "booking_id": current_state["booking_id"],
                    "amount": int(total_with_gst * 100),  # Amount in paise/cents for Stripe
                    "name": current_state["details"]["name"],
                    "email": current_state["details"]["email"],
                    "contact": current_state["details"]["contact_number"],
                    "description": f"Jungle Safari Tickets ({num_tickets})"
                }
                
                current_state["conversation_state"] = "payment_pending"
                return {"response": response.content, "invoice": invoice, "payment_info": payment_info}
                
            except ValueError:
                response = chain_with_history.invoke(
                    {"input": "Please enter a valid number of tickets."},
                    config={"configurable": {"session_id": session_id}}
                )
                
        elif current_state["conversation_state"] == "payment_pending" or current_state["conversation_state"] == "completed":
            # Handle general inquiries after booking is created
            response = chain_with_history.invoke(
                {"input": user_input},
                config={"configurable": {"session_id": session_id}}
            )
        
        return {"response": response.content}

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/create-payment-intent")
async def create_payment_intent(payment_request: PaymentRequest):
    """Create a Stripe Payment Intent for booking payment."""
    try:
        if not STRIPE_API_KEY:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        # Fetch booking details to verify
        try:
            with open(BOOKINGS_FILE, "r") as f:
                bookings = json.load(f)
            
            booking_found = False
            for booking in bookings:
                if booking["booking_id"] == payment_request.booking_id:
                    booking_found = True
                    break
            
            if not booking_found:
                raise HTTPException(status_code=404, detail="Booking not found")
        except (json.JSONDecodeError, FileNotFoundError):
            raise HTTPException(status_code=404, detail="Booking records not found")
        
        # Create Stripe Payment Intent
        try:
            metadata = {
                "booking_id": payment_request.booking_id,
                "email": payment_request.email or ""
            }
            
            payment_intent = stripe.PaymentIntent.create(
                amount=payment_request.amount,  # Amount in smallest currency unit (paise)
                currency=payment_request.currency,
                metadata=metadata,
                description=payment_request.description,
                receipt_email=payment_request.email,
                automatic_payment_methods={"enabled": True}
            )
            
            # Update booking with payment intent ID
            update_booking_payment_status(
                payment_request.booking_id,
                "intent_created",
                payment_intent_id=payment_intent.id
            )
            
            # Save payment information
            payment_info = {
                "payment_intent_id": payment_intent.id,
                "booking_id": payment_request.booking_id,
                "amount": payment_request.amount,
                "currency": payment_request.currency,
                "status": "created",
                "created_at": datetime.now().isoformat()
            }
            save_payment(payment_info)
            
            # Return client secret for frontend to complete payment
            return {
                "client_secret": payment_intent.client_secret,
                "payment_intent_id": payment_intent.id,
                "booking_id": payment_request.booking_id
            }
            
        except stripe.error.StripeError as e:
            print(f"Stripe error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error creating payment intent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating payment intent: {str(e)}")

@app.post("/check-payment/{booking_id}/{payment_intent_id}")
async def check_payment_status(booking_id: str, payment_intent_id: str):
    """Explicitly check payment status with Stripe."""
    try:
        if not STRIPE_API_KEY:
            raise HTTPException(status_code=500, detail="Stripe API key not configured")
        
        try:
            # Retrieve payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            # Process based on payment status
            if payment_intent.status == "succeeded":
                # Update booking status to completed
                update_successful = update_booking_payment_status(
                    booking_id,
                    "completed",
                    payment_intent_id=payment_intent.id,
                    payment_method_id=payment_intent.payment_method
                )
                
                if not update_successful:
                    print(f"Warning: Failed to update booking {booking_id} status")
                
                # Save payment success info
                payment_info = {
                    "payment_intent_id": payment_intent.id,
                    "booking_id": booking_id,
                    "status": "succeeded",
                    "amount": payment_intent.amount,
                    "currency": payment_intent.currency,
                    "payment_method": payment_intent.payment_method,
                    "completed_at": datetime.now().isoformat()
                }
                save_payment(payment_info)
                
                return {
                    "status": "success",
                    "payment_status": payment_intent.status,
                    "message": "Payment completed successfully"
                }
                
            elif payment_intent.status in ["requires_payment_method", "requires_action", "processing"]:
                return {
                    "status": "pending",
                    "payment_status": payment_intent.status,
                    "message": "Payment is still being processed"
                }
                
            else:  # failed, canceled, etc.
                # Update booking status to failed
                update_booking_payment_status(booking_id, "failed", payment_intent_id=payment_intent.id)
                
                # Save payment failure info
                payment_info = {
                    "payment_intent_id": payment_intent.id,
                    "booking_id": booking_id,
                    "status": "failed",
                    "error": payment_intent.last_payment_error.message if payment_intent.last_payment_error else "Unknown error",
                    "failed_at": datetime.now().isoformat()
                }
                save_payment(payment_info)
                
                return {
                    "status": "failed",
                    "payment_status": payment_intent.status,
                    "message": "Payment failed or was canceled"
                }
                
        except stripe.error.StripeError as e:
            print(f"Stripe error: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error checking payment status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/payment-success/{booking_id}")
async def payment_success_page(booking_id: str):
    """Generate success page with payment status and invoice."""
    try:
        # Get booking details
        try:
            with open(BOOKINGS_FILE, "r") as f:
                bookings = json.load(f)
            
            booking_details = None
            payment_intent_id = None
            
            for booking in bookings:
                if booking["booking_id"] == booking_id:
                    booking_details = booking["details"]
                    payment_intent_id = booking_details.get("payment_intent_id")
                    break
            
            if not booking_details:
                raise HTTPException(status_code=404, detail="Booking not found")
            
            # Check if payment is already marked as completed
            if booking_details.get("payment_status") == "completed":
                invoice = generate_invoice(booking_id, booking_details)
                return {
                    "status": "success",
                    "message": "Payment completed successfully",
                    "booking_id": booking_id,
                    "invoice": invoice
                }
            
            # If payment intent exists but status isn't complete, check with Stripe
            elif payment_intent_id:
                try:
                    payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
                    
                    if payment_intent.status == "succeeded":
                        # Update booking status to completed
                        update_booking_payment_status(
                            booking_id,
                            "completed",
                            payment_intent_id=payment_intent.id,
                            payment_method_id=payment_intent.payment_method
                        )
                        
                        # Save payment success info
                        payment_info = {
                            "payment_intent_id": payment_intent.id,
                            "booking_id": booking_id,
                            "status": "succeeded",
                            "amount": payment_intent.amount,
                            "currency": payment_intent.currency,
                            "payment_method": payment_intent.payment_method,
                            "completed_at": datetime.now().isoformat()
                        }
                        save_payment(payment_info)
                        
                        # Generate invoice with updated status
                        with open(BOOKINGS_FILE, "r") as f:
                            bookings = json.load(f)
                        
                        for booking in bookings:
                            if booking["booking_id"] == booking_id:
                                booking_details = booking["details"]
                                break
                        
                        invoice = generate_invoice(booking_id, booking_details)
                        
                        return {
                            "status": "success",
                            "message": "Payment completed successfully",
                            "booking_id": booking_id,
                            "invoice": invoice
                        }
                    
                    else:
                        return {
                            "status": "pending",
                            "message": f"Payment status: {payment_intent.status}. Please wait or contact support if this persists.",
                            "booking_id": booking_id
                        }
                        
                except stripe.error.StripeError as e:
                    print(f"Stripe error: {str(e)}")
                    return {
                        "status": "error",
                        "message": f"Error checking payment: {str(e)}",
                        "booking_id": booking_id
                    }
            
            else:
                return {
                    "status": "pending",
                    "message": "Payment information not found. Please contact support.",
                    "booking_id": booking_id
                }
                
        except (json.JSONDecodeError, FileNotFoundError):
            raise HTTPException(status_code=404, detail="Booking records not found")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error processing payment success page: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/invoice/{booking_id}")
async def get_invoice(booking_id: str):
    """Retrieve invoice for a specific booking."""
    try:
        with open(BOOKINGS_FILE, "r") as f:
            bookings = json.load(f)
        
        for booking in bookings:
            if booking["booking_id"] == booking_id:
                invoice = generate_invoice(booking_id, booking["details"])
                return invoice
        
        raise HTTPException(status_code=404, detail="Booking not found")
    except (json.JSONDecodeError, FileNotFoundError):
        raise HTTPException(status_code=404, detail="Booking records not found")

@app.post("/complaint")
async def complaint_endpoint(complaint_request: ComplaintRequest = Body(...)):
    """Handles customer complaints with enhanced complaint handling."""
    try:
        # Extract session ID or create one
        session_id = complaint_request.session_id or f"complaint_{datetime.now().timestamp()}"
        
        # Create a separate history for complaints
        if session_id not in SESSION_HISTORIES:
            SESSION_HISTORIES[session_id] = InMemoryChatMessageHistory()
        
        # Process complaint information
        complaint_info = save_complaint(complaint_request.message)
        
        # Create enhanced prompt for the LLM
        enhanced_prompt = generate_prompt_based_on_complaint(complaint_request.message, complaint_info)
        
        # Get response using the LLM with history
        response = chain_with_history.invoke(
            {"input": enhanced_prompt},
            config={"configurable": {"session_id": session_id}}
        )
        
        # Return response with session ID
        return {
            "response": response.content,
            "session_id": session_id,
            "complaint_logged": True,
            "complaint_category": complaint_info["issue_category"],
            "severity": complaint_info["severity"]
        }
    
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"An unexpected error occurred: {str(e)}"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
