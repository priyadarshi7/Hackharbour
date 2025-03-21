import { useState, useEffect } from "react"
import { Send, AlertCircle, CheckCircle } from "react-feather"

const ComplaintForm = () => {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [chatHistory, setChatHistory] = useState([])

  useEffect(() => {
    // Generate a random session ID for complaints
    const newSessionId = `complaint_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    setSessionId(newSessionId)

    // Add initial message
    setChatHistory([
      {
        text: "Hello! I'm here to help with any concerns or complaints you might have about your jungle safari experience. Please describe your issue in detail, and I'll do my best to assist you.",
        sender: "bot",
      },
    ])
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim()) return

    // Add user message to chat
    setChatHistory((prev) => [...prev, { text: message, sender: "user" }])

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          session_id: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit complaint")
      }

      const data = await response.json()

      // Add bot response to chat
      setChatHistory((prev) => [...prev, { text: data.response, sender: "bot" }])

      // Show success message if complaint was logged
      if (data.complaint_logged) {
        setSuccess(true)

        // Add info about complaint category
        setChatHistory((prev) => [
          ...prev,
          {
            text: `Your complaint has been logged in our system under the category: ${data.complaint_category}. Our team will review it promptly.`,
            sender: "bot",
            isInfo: true,
          },
        ])
      }

      // Clear the input
      setMessage("")
    } catch (error) {
      console.error("Error submitting complaint:", error)
      setError("Failed to submit your complaint. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-amber-600 text-white p-4">
          <h2 className="text-xl font-bold">Customer Support</h2>
          <p className="text-amber-100">We're here to help with any issues or concerns</p>
        </div>

        <div className="chat-container">
          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`message ${chat.sender === "user" ? "user-message" : "bot-message"} ${
                chat.isInfo ? "bg-amber-50 border border-amber-200" : ""
              }`}
            >
              {chat.text}
            </div>
          ))}

          {loading && (
            <div className="message bot-message">
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mx-4 my-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
            <AlertCircle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-4 my-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start">
            <CheckCircle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
            <span>Your complaint has been successfully submitted. We'll address it as soon as possible.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue or concern..."
              className="safari-input flex-grow"
              disabled={loading}
            />

            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              disabled={loading || !message.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-amber-800 mb-4">Frequently Asked Questions</h3>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-amber-700">What is your refund policy?</h4>
            <p className="text-gray-600 mt-1">
              We offer full refunds if cancellations are made at least 48 hours before the scheduled safari. For
              cancellations within 48 hours, a 50% refund is provided.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-amber-700">How can I reschedule my safari?</h4>
            <p className="text-gray-600 mt-1">
              You can reschedule your safari up to 24 hours before the scheduled time, subject to availability. Please
              contact our support team with your booking ID.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-amber-700">What should I bring for the safari?</h4>
            <p className="text-gray-600 mt-1">
              We recommend comfortable clothing, sunscreen, insect repellent, a hat, sunglasses, and a camera.
              Binoculars are provided by our guides.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-amber-700">Is the safari suitable for children?</h4>
            <p className="text-gray-600 mt-1">
              Yes, our safari is family-friendly. Children under 5 years can join for free, while those between 5-12
              years get a 50% discount on ticket prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplaintForm

