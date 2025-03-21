import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'react-feather';
import { useReactToPrint } from 'react-to-print';

const InvoicePage = () => {
  const { bookingId } = useParams();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`http://localhost:8000/invoice/${bookingId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }
        
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Failed to load invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchInvoice();
    }
  }, [bookingId]);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice-${bookingId}`,
  });

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-700">Loading invoice...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <Link to="/" className="safari-button inline-flex items-center">
          <ArrowLeft size={16} className="mr-2" />
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link to={`/payment-success/${bookingId}`} className="text-emerald-700 hover:text-emerald-800 flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Confirmation
        </Link>
        
        <div className="flex space-x-2">
          <button 
            onClick={handlePrint}
            className="safari-button-secondary inline-flex items-center"
          >
            <Printer size={16} className="mr-2" />
            Print
          </button>
          
          <button 
            onClick={handlePrint}
            className="safari-button inline-flex items-center"
          >
            <Download size={16} className="mr-2" />
            Download PDF
          </button>
        </div>
      </div>
      
      {invoice && (
        <div ref={invoiceRef} className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-emerald-800 mb-1">INVOICE</h1>
              <p className="text-gray-500">{invoice.invoice_id}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-emerald-800 mb-1">Jungle Safari</div>
              <p className="text-sm text-gray-500">
                Wildlife Conservation Park<br />
                Nature Valley, Green Hills<br />
                contact@junglesafari.com<br />
                +1 (234) 567-8900
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To:</h2>
              <p className="font-medium">{invoice.customer_name}</p>
              <p className="text-gray-600">{invoice.email}</p>
              <p className="text-gray-600">{invoice.contact_number}</p>
            </div>
            
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Invoice Details:</h2>
              <div className="grid grid-cols-2 gap-x-4 text-sm">
                <div className="text-gray-600">Invoice Number:</div>
                <div>{invoice.invoice_id}</div>
                
                <div className="text-gray-600">Booking ID:</div>
                <div>{invoice.booking_id}</div>
                
                <div className="text-gray-600">Issue Date:</div>
                <div>{invoice.booking_date}</div>
                
                <div className="text-gray-600">Status:</div>
                <div className="text-green-600 font-medium">{invoice.payment_status}</div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Invoice Items</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-sm text-gray-600">
                  <th className="text-left py-3">Description</th>
                  <th className="text-center py-3">Quantity</th>
                  <th className="text-right py-3">Unit Price</th>
                  <th className="text-right py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4">
                    <div className="font-medium">Jungle Safari Tickets</div>
                    <div className="text-sm text-gray-500">Access to wildlife safari tour</div>
                  </td>
                  <td className="text-center py-4">{invoice.booking_details.number_of_tickets}</td>
                  <td className="text-right py-4">₹{invoice.booking_details.price_per_ticket}</td>
                  <td className="text-right py-4">₹{invoice.booking_details.subtotal}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-64">
              <div className="flex justify-between py-2">
                <div className="text-gray-600">Subtotal:</div>
                <div>₹{invoice.booking_details.subtotal}</div>
              </div>
              <div className="flex justify-between py-2">
                <div className="text-gray-600">GST (18%):</div>
                <div>₹{invoice.booking_details.gst}</div>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200 font-bold">
                <div>Total:</div>
                <div>₹{invoice.booking_details.grand_total}</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
            <p className="mb-2">Thank you for your booking with Jungle Safari!</p>
            <p>For any queries, please contact our support team at support@junglesafari.com</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicePage;
