import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle } from "react-feather"

// Replace with your Stripe publishable key
const stripePromise = loadStripe("pk_test_your_stripe_key")

const CheckoutForm = ({ paymentInfo }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [clientSecret, setClientSecret] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("initial")
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()

  useEffect(() => {
    if (!paymentInfo) return

    const createPaymentIntent = async () => {
      try {
        const response = await fetch("http://localhost:8000/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            booking_id: paymentInfo.booking_id,
            amount: paymentInfo.amount,
            currency: "inr",
            email: paymentInfo.email,
            name: paymentInfo.name,
            description: paymentInfo.description,
            return_url: window.location.origin + "/payment-success",
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create payment intent")
        }

        const data = await response.json()
        setClientSecret(data.client_secret)
      } catch (error) {
        console.error("Error creating payment intent:", error)
        setError("Failed to initialize payment. Please try again.")
      }
    }

    createPaymentIntent()
  }, [paymentInfo])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const cardElement = elements.getElement(CardElement)

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: paymentInfo.name,
            email: paymentInfo.email,
          },
        },
      })

      if (error) {
        setError(error.message)
        setPaymentStatus("failed")
      } else if (paymentIntent.status === "succeeded") {
        setPaymentStatus("succeeded")
        // Navigate to success page after a short delay
        setTimeout(() => {
          navigate(`/payment-success/${paymentInfo.booking_id}`)
        }, 1500)
      } else {
        setPaymentStatus("processing")
        // Check payment status
        checkPaymentStatus(paymentInfo.booking_id, paymentIntent.id)
      }
    } catch (err) {
      console.error("Payment error:", err)
      setError("An unexpected error occurred. Please try again.")
      setPaymentStatus("failed")
    } finally {
      setLoading(false)
    }
  }

  const checkPaymentStatus = async (bookingId, paymentIntentId) => {
    try {
      const response = await fetch(`http://localhost:8000/check-payment/${bookingId}/${paymentIntentId}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to check payment status")
      }

      const data = await response.json()

      if (data.status === "success") {
        setPaymentStatus("succeeded")
        // Navigate to success page
        navigate(`/payment-success/${bookingId}`)
      } else if (data.status === "pending") {
        // Check again after a delay
        setTimeout(() => {
          checkPaymentStatus(bookingId, paymentIntentId)
        }, 2000)
      } else {
        setPaymentStatus("failed")
        setError("Payment failed. Please try again.")
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
      setPaymentStatus("failed")
      setError("Failed to verify payment. Please contact support.")
    }
  }

  const goBack = () => {
    navigate("/")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Card Details</label>
        <div className="border border-gray-300 rounded-lg p-4 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="mr-2 flex-shrink-0 mt-0.5" size={16} />
          <span>{error}</span>
        </div>
      )}

      {paymentStatus === "succeeded" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="mr-2" size={16} />
          <span>Payment successful! Redirecting to confirmation page...</span>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Booking
        </button>

        <button
          type="submit"
          disabled={!stripe || loading || paymentStatus === "succeeded"}
          className={`safari-button flex items-center ${
            loading || paymentStatus === "succeeded" ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <CreditCard size={16} className="mr-2" />
              Pay Now
            </>
          )}
        </button>
      </div>
    </form>
  )
}

const PaymentPage = () => {
  const [paymentInfo, setPaymentInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Retrieve payment info from session storage
    const storedPaymentInfo = sessionStorage.getItem("paymentInfo")

    if (storedPaymentInfo) {
      setPaymentInfo(JSON.parse(storedPaymentInfo))
    } else {
      // Redirect back to chat if no payment info
      navigate("/")
    }
  }, [navigate])

  if (!paymentInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  // Calculate amounts
  const subtotal = paymentInfo.amount / 100 // Convert from paise to rupees
  const gstAmount = subtotal * 0.18
  const totalAmount = subtotal

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-emerald-800 mb-6">Complete Your Payment</h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 payment-card">
          <Elements stripe={stripePromise}>
            <CheckoutForm paymentInfo={paymentInfo} />
          </Elements>
        </div>

        <div className="md:col-span-2">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 text-emerald-800">Order Summary</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Booking ID:</span>
                <span className="font-mono">{paymentInfo.booking_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>GST (18%):</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-4">
              <p className="mb-2">Your booking details:</p>
              <p>{paymentInfo.description}</p>
              <p>Name: {paymentInfo.name}</p>
              <p>Email: {paymentInfo.email}</p>
              <p>Contact: {paymentInfo.contact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage

