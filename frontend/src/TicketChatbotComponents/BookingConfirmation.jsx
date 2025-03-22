import { useRef } from "react"
import { Button, Card, CardContent, CardHeader, Typography, Box, Divider, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material"
import { format } from "date-fns"
import { CheckCircle, Calendar, Clock, Mail, Download, Printer } from "lucide-react"
import { useReactToPrint } from "react-to-print"

const BookingConfirmation = ({
  reference,
  date,
  packageDetails,
  tickets,
  ticketTypes,
  totalPrice,
  email,
  onBookAgain,
}) => {
  const invoiceRef = useRef()

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Card sx={{ border: '1px solid #dcfce7' }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CheckCircle style={{ height: 48, width: 48, color: '#16a34a', marginBottom: 8 }} />
              <Typography variant="h5" sx={{ color: '#166534' }}>
                Booking Confirmed!
              </Typography>
            </Box>
          }
          sx={{ textAlign: 'center' }}
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 1, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#4b5563' }}>Booking Reference</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#166534' }}>{reference}</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Mail style={{ height: 20, width: 20, color: '#16a34a', marginTop: 2 }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>Confirmation Email</Typography>
                <Typography variant="body1" sx={{ color: '#1f2937' }}>{email}</Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>A detailed invoice has been sent to this email</Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
            <Button
              variant="outlined"
              onClick={handlePrint}
              startIcon={<Printer style={{ height: 16, width: 16 }} />}
              sx={{ borderColor: '#bbf7d0', color: '#15803d' }}
            >
              Print Invoice
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                // In a real app, this would generate and download a PDF
                alert("In a real application, this would download a PDF invoice")
              }}
              startIcon={<Download style={{ height: 16, width: 16 }} />}
              sx={{ borderColor: '#bbf7d0', color: '#15803d' }}
            >
              Download
            </Button>
          </Box>
        </CardContent>
        <Box sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={onBookAgain} 
            fullWidth
            variant="contained"
            sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
          >
            Book Another Safari
          </Button>
        </Box>
      </Card>

      {/* Detailed Invoice */}
      <Box 
        ref={invoiceRef} 
        sx={{ 
          bgcolor: 'white', 
          p: 3, 
          borderRadius: 2, 
          boxShadow: 2, 
          border: '1px solid #dcfce7' 
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#166534' }}>Jungle Safari</Typography>
            <Typography sx={{ color: '#4b5563' }}>123 Wildlife Avenue</Typography>
            <Typography sx={{ color: '#4b5563' }}>Wilderness Park, WP 12345</Typography>
            <Typography sx={{ color: '#4b5563' }}>contact@junglesafari.com</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#15803d' }}>INVOICE</Typography>
            <Typography sx={{ color: '#374151', fontWeight: 500 }}>{reference}</Typography>
            <Typography sx={{ color: '#4b5563' }}>Date: {format(new Date(), "MMMM d, yyyy")}</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#15803d', mb: 1 }}>Customer Information</Typography>
          <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 1 }}>
            <Typography sx={{ color: '#1f2937' }}>
              <Box component="span" sx={{ fontWeight: 500 }}>Email:</Box> {email}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#15803d', mb: 1 }}>Safari Details</Typography>
          <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Calendar style={{ height: 20, width: 20, color: '#16a34a' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>Date</Typography>
                <Typography sx={{ color: '#1f2937' }}>{format(date, "EEEE, MMMM d, yyyy")}</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Clock style={{ height: 20, width: 20, color: '#16a34a' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, color: '#4b5563' }}>Safari Package</Typography>
                <Typography sx={{ color: '#1f2937' }}>{packageDetails.name}</Typography>
                <Typography variant="body2" sx={{ color: '#4b5563' }}>
                  {packageDetails.duration} • Starting at {packageDetails.startTime}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#15803d', mb: 1 }}>Ticket Summary</Typography>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#dcfce7' }}>
                <TableCell sx={{ borderBottom: '1px solid #bbf7d0' }}>Ticket Type</TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid #bbf7d0' }}>Quantity</TableCell>
                <TableCell align="center" sx={{ borderBottom: '1px solid #bbf7d0' }}>Unit Price</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid #bbf7d0' }}>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(tickets)
                .filter(([_, count]) => count > 0)
                .map(([typeId, count]) => {
                  const ticketType = ticketTypes.find((t) => t.id === typeId)
                  const unitPrice = packageDetails.price * (ticketType?.priceMultiplier || 1)
                  const amount = unitPrice * count

                  return (
                    <TableRow key={typeId} sx={{ borderBottom: '1px solid #dcfce7' }}>
                      <TableCell sx={{ color: '#1f2937' }}>
                        {ticketType?.name} ({ticketType?.description})
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#1f2937' }}>{count}</TableCell>
                      <TableCell align="center" sx={{ color: '#1f2937' }}>${unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right" sx={{ color: '#1f2937' }}>${amount.toFixed(2)}</TableCell>
                    </TableRow>
                  )
                })}
              <TableRow sx={{ bgcolor: '#f0fdf4', fontWeight: 600 }}>
                <TableCell colSpan={3} align="right" sx={{ color: '#166534', fontWeight: 600 }}>
                  Total
                </TableCell>
                <TableCell align="right" sx={{ color: '#166534', fontWeight: 600 }}>${totalPrice.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Divider sx={{ borderColor: '#bbf7d0', my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#15803d', mb: 1 }}>Payment Information</Typography>
          <Typography sx={{ color: '#374151' }}>Payment Method: Credit Card</Typography>
          <Typography sx={{ color: '#374151' }}>
            Payment Status: <Box component="span" sx={{ color: '#16a34a', fontWeight: 500 }}>Paid</Box>
          </Typography>
          <Typography sx={{ color: '#374151' }}>Payment Date: {format(new Date(), "MMMM d, yyyy")}</Typography>
        </Box>

        <Box sx={{ bgcolor: '#f0fdf4', p: 2, borderRadius: 1, textAlign: 'center' }}>
          <Typography sx={{ color: '#374151', mb: 0.5 }}>Thank you for choosing Jungle Safari!</Typography>
          <Typography variant="body2" sx={{ color: '#4b5563' }}>Please arrive 15 minutes before your scheduled safari time.</Typography>
          <Typography variant="body2" sx={{ color: '#4b5563' }}>Don't forget to bring your camera, water, and sun protection.</Typography>
        </Box>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>This is an electronic invoice. No signature required.</Typography>
          <Typography variant="caption" display="block" sx={{ color: '#6b7280' }}>© {new Date().getFullYear()} Jungle Safari. All rights reserved.</Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default BookingConfirmation