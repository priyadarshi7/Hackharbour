import { useState, useEffect, useRef } from "react"
import { createRoot } from "react-dom/client"
import { cn } from "../../utils/utils"
import PaymentForm from "../../TicketChatbotComponents/PaymentForm"
import SafariOptions from "../../TicketChatbotComponents/SafariOptions"
import TicketSelector from "../../TicketChatbotComponents/TicketSelector"
import BookingConfirmation from "../../TicketChatbotComponents/BookingConfirmation"
import { Button, Input, Card, CardContent, TextField, Dialog, DialogContent, DialogTitle } from "@mui/material"
import { format } from "date-fns"
import { CalendarIcon, Send } from "lucide-react"

// Safari package data
const safariPackages = [
  {
    id: "morning-safari",
    name: "Morning Safari",
    description: "Experience the jungle as it awakens. Spot animals during their most active morning hours.",
    duration: "3 hours",
    startTime: "6:00 AM",
    price: 49.99,
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80",
  },
  {
    id: "afternoon-safari",
    name: "Afternoon Safari",
    description: "Enjoy the vibrant jungle life during daylight hours with our experienced guides.",
    duration: "4 hours",
    startTime: "1:00 PM",
    price: 59.99,
    image:
      "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
  },
  {
    id: "sunset-safari",
    name: "Sunset Safari",
    description: "Witness the magical transition as day turns to night in the jungle.",
    duration: "3 hours",
    startTime: "4:30 PM",
    price: 69.99,
    image:
      "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
  },
]

// Ticket types
const ticketTypes = [
  { id: "adult", name: "Adult", description: "Ages 18+", priceMultiplier: 1 },
  { id: "child", name: "Child", description: "Ages 5-17", priceMultiplier: 0.6 },
  { id: "senior", name: "Senior", description: "Ages 65+", priceMultiplier: 0.8 },
]

// Simulated chat API response
const simulateChatResponse = (message) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! I'm your safari booking assistant. How can I help you today?"
  } else if (lowerMessage.includes("wildlife") || lowerMessage.includes("animals")) {
    return "During our safaris, you might see elephants, tigers, monkeys, exotic birds, and other wildlife. While sightings can't be guaranteed, our experienced guides know the best spots!"
  } else if (lowerMessage.includes("bring") || lowerMessage.includes("pack")) {
    return "For your safari, we recommend bringing comfortable clothing, walking shoes, a hat, sunscreen, insect repellent, a water bottle, and a camera. Binoculars are also useful if you have them!"
  } else if (lowerMessage.includes("cancel") || lowerMessage.includes("refund")) {
    return "For cancellations, please contact our customer service at least 48 hours before your scheduled safari for a full refund. Within 48 hours, a 50% cancellation fee applies."
  } else {
    return "I'm here to help with your safari booking. Would you like to know more about our packages, or are you ready to book your adventure?"
  }
}

function TicketChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef(null)
  const [bookingState, setBookingState] = useState("initial")
  const [selectedDate, setSelectedDate] = useState(undefined)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedTickets, setSelectedTickets] = useState({
    adult: 1,
    child: 0,
    senior: 0,
  })
  const [totalPrice, setTotalPrice] = useState(0)
  const [isPaymentComplete, setIsPaymentComplete] = useState(false)
  const [bookingReference, setBookingReference] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [customerEmail, setCustomerEmail] = useState("")
  const [dateDialogOpen, setDateDialogOpen] = useState(false)
  const [tempDate, setTempDate] = useState("")

  // Calculate total price whenever tickets or package changes
  useEffect(() => {
    if (selectedPackage) {
      let total = 0
      Object.entries(selectedTickets).forEach(([type, count]) => {
        const ticketType = ticketTypes.find((t) => t.id === type)
        if (ticketType) {
          total += selectedPackage.price * ticketType.priceMultiplier * count
        }
      })
      setTotalPrice(Number.parseFloat(total.toFixed(2)))
    }
  }, [selectedTickets, selectedPackage])

  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          role: "assistant",
          content:
            "👋 Welcome to Jungle Safari Booking! I'm your virtual assistant to help you book an unforgettable safari adventure. Would you like to start booking a safari experience?",
        },
      ])
    }
  }, [messages.length])

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")

      // Simulate API response
      setTimeout(() => {
        const botResponse = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: simulateChatResponse(input),
        }

        setMessages((prev) => [...prev, botResponse])
      }, 500)
    }
  }

  const handleDateDialogOpen = () => {
    setDateDialogOpen(true)
  }

  const handleDateDialogClose = () => {
    setDateDialogOpen(false)
  }

  const handleDateChange = (e) => {
    setTempDate(e.target.value)
  }

  const handleDateSubmit = () => {
    const date = new Date(tempDate)
    
    if (tempDate && !isNaN(date.getTime())) {
      setSelectedDate(date)
      handleDateDialogClose()
      
      const formattedDate = format(date, "MMMM d, yyyy")
      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          role: "user",
          content: `I'd like to book for ${formattedDate}`,
        },
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Great! You've selected ${formattedDate}. Now, please choose a safari package:`,
        },
      ])
      setBookingState("package")
    }
  }

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg)
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        role: "user",
        content: `I'd like to book the ${pkg.name}`,
      },
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Excellent choice! The ${pkg.name} (${pkg.duration}, starting at ${pkg.startTime}) is a wonderful experience. Now, let's select the number of tickets:`,
      },
    ])
    setBookingState("tickets")
  }

  const handleTicketsConfirm = () => {
    const ticketSummary = Object.entries(selectedTickets)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => `${count} ${type}`)
      .join(", ")

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        role: "user",
        content: `I'd like to book ${ticketSummary} tickets`,
      },
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Perfect! You've selected ${ticketSummary} tickets for the ${selectedPackage?.name} on ${format(selectedDate, "MMMM d, yyyy")}. Your total is $${totalPrice.toFixed(2)}. Please provide your email and payment details to secure your booking.`,
      },
    ])
    setBookingState("payment")
  }

  const handlePaymentComplete = (email) => {
    setIsLoading(true)
    setCustomerEmail(email)

    // Simulate payment processing and booking confirmation
    setTimeout(() => {
      const reference = `SAFARI-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      setBookingReference(reference)
      setIsPaymentComplete(true)
      setBookingState("confirmation")

      setMessages([
        ...messages,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `Thank you! Your payment has been processed successfully. Your booking reference is ${reference}. We've sent a confirmation email to ${email} with all the details. We look forward to welcoming you to our Jungle Safari!`,
        },
      ])

      setIsLoading(false)
    }, 2000)
  }

  const startBooking = () => {
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        role: "user",
        content: "I'd like to book a safari",
      },
      {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Great! Let's start by selecting a date for your safari adventure:",
      },
    ])
    setBookingState("date")
  }

  const resetBooking = () => {
    setBookingState("initial")
    setSelectedDate(undefined)
    setSelectedPackage(null)
    setSelectedTickets({
      adult: 1,
      child: 0,
      senior: 0,
    })
    setIsPaymentComplete(false)
    setBookingReference("")
    setCustomerEmail("")
    setTempDate("")

    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "👋 Welcome to Jungle Safari Booking! I'm your virtual assistant to help you book an unforgettable safari adventure. Would you like to start booking a safari experience?",
      },
    ])
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-green-700 text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">Jungle Safari Booking</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 max-w-4xl">
        <Card className="h-[80vh] flex flex-col shadow-lg border-green-100">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-2",
                      message.role === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {bookingState === "date" && (
                <div className="flex justify-center my-4">
                  <Button 
                    variant="outlined" 
                    onClick={handleDateDialogOpen} 
                    className="w-full max-w-sm border-green-200 hover:bg-green-50"
                    startIcon={<CalendarIcon className="h-4 w-4 text-green-700" />}
                  >
                    {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                  </Button>
                  
                  <Dialog open={dateDialogOpen} onClose={handleDateDialogClose}>
                    <DialogTitle>Select Date</DialogTitle>
                    <DialogContent>
                      <TextField
                        autoFocus
                        margin="dense"
                        id="date"
                        label="Safari Date"
                        type="date"
                        fullWidth
                        variant="outlined"
                        value={tempDate}
                        onChange={handleDateChange}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        inputProps={{
                          min: new Date().toISOString().split('T')[0]
                        }}
                      />
                      <div className="mt-4 flex justify-end">
                        <Button onClick={handleDateDialogClose} color="primary">
                          Cancel
                        </Button>
                        <Button onClick={handleDateSubmit} color="primary" variant="contained">
                          Confirm
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {bookingState === "package" && (
                <div className="my-4">
                  <SafariOptions packages={safariPackages} onSelect={handlePackageSelect} />
                </div>
              )}

              {bookingState === "tickets" && selectedPackage && (
                <div className="my-4">
                  <TicketSelector
                    ticketTypes={ticketTypes}
                    selectedTickets={selectedTickets}
                    setSelectedTickets={setSelectedTickets}
                    basePrice={selectedPackage.price}
                    totalPrice={totalPrice}
                    onConfirm={handleTicketsConfirm}
                  />
                </div>
              )}

              {bookingState === "payment" && (
                <div className="my-4">
                  <PaymentForm
                    totalAmount={totalPrice}
                    onPaymentComplete={handlePaymentComplete}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {bookingState === "confirmation" && (
                <div className="my-4">
                  <BookingConfirmation
                    reference={bookingReference}
                    date={selectedDate}
                    packageDetails={selectedPackage}
                    tickets={selectedTickets}
                    ticketTypes={ticketTypes}
                    totalPrice={totalPrice}
                    email={customerEmail}
                    onBookAgain={resetBooking}
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <div className="p-4 border-t border-green-100">
            {bookingState === "initial" && (
              <Button 
                onClick={startBooking} 
                variant="contained" 
                color="primary" 
                className="w-full" 
                style={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' } }}
              >
                Start Booking
              </Button>
            )}

            {!["initial", "date", "package", "tickets", "payment", "confirmation"].includes(bookingState) && (
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1"
                  fullWidth
                />
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  style={{ backgroundColor: '#16a34a', '&:hover': { backgroundColor: '#15803d' } }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}

export default TicketChat