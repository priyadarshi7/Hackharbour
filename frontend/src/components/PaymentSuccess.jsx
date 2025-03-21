import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { CheckCircle, FileText, ArrowLeft } from "react-feather"

const PaymentSuccess = () => {
  const { bookingId } = useParams()
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(`http://localhost:8000/payment-success/${bookingId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch payment status")
        }

        const data = await response.json()

        if (data.status === "success") {
          setInvoice(data.invoice)
        } else {
          setError(data.message || "Payment verification failed")
        }
      } catch (error) {
        console.error("Error fetching payment status:", error)
        setError("Failed to verify payment. Please contact support.")
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchPaymentStatus()
    }
  }, [bookingId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">Verifying your payment...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Payment Verification Issue</h2>
          <p>{error}</p>
        </div>
        <Link to="/" className="safari-button inline-flex items-center">
          <ArrowLeft size={16} className="mr-2" />
          Return to Booking
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-center">
        <CheckCircle className="mr-3 flex-shrink-0" size={24} />
        <div>
          <h2 className="text-xl font-semibold">Payment Successful!</h2>
          <p>Your jungle safari booking has been confirmed.</p>
        </div>
      </div>

      {invoice && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-emerald-800">Booking Invoice</h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Booking ID:</span>
              <span className="font-mono text-sm">{invoice.booking_id}</span>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-4 mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="text-sm text-gray-500">Name:</span>
                <span className="ml-2">{invoice.customer_name}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <span className="ml-2">{invoice.email}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Contact:</span>
                <span className="ml-2">{invoice.contact_number}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">Date:</span>
                <span className="ml-2">{invoice.booking_date}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Booking Details</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2">Jungle Safari Tickets</td>
                  <td className="text-right py-2">{invoice.booking_details.number_of_tickets}</td>
                  <td className="text-right py-2">₹{invoice.booking_details.price_per_ticket}</td>
                  <td className="text-right py-2">₹{invoice.booking_details.subtotal}</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td colSpan="3" className="text-right py-2">
                    Subtotal:
                  </td>
                  <td className="text-right py-2">₹{invoice.booking_details.subtotal}</td>
                </tr>
                <tr>
                  <td colSpan="3" className="text-right py-2">
                    GST (18%):
                  </td>
                  <td className="text-right py-2">₹{invoice.booking_details.gst}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan="3" className="text-right py-2">
                    Total:
                  </td>
                  <td className="text-right py-2">₹{invoice.booking_details.grand_total}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Payment Status:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{invoice.payment_status}</span>
            </div>
            <p className="text-sm text-gray-600">
              Thank you for booking with Jungle Safari. Please keep this invoice for your records.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Link to="/" className="safari-button-secondary inline-flex items-center">
          <ArrowLeft size={16} className="mr-2" />
          Return Home
        </Link>

        <Link to={`/invoice/${bookingId}`} className="safari-button inline-flex items-center">
          <FileText size={16} className="mr-2" />
          View Full Invoice
        </Link>
      </div>
    </div>
  )
}

export default PaymentSuccess

