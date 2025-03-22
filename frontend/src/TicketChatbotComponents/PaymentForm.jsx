"use client"

import { useState } from "react"
import { Button, Card, CardContent, CardHeader, TextField, Box, Typography, InputAdornment, CircularProgress } from "@mui/material"
import { CreditCard, Lock, Mail } from "lucide-react"

const PaymentForm = ({ totalAmount, onPaymentComplete, isLoading }) => {
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState({})

  const formatCardNumber = (value) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "")
    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19)
  }

  const formatExpiryDate = (value) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, "")
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`
    }
    return digits
  }

  const handleCardNumberChange = (e) => {
    setCardNumber(formatCardNumber(e.target.value))
  }

  const handleExpiryDateChange = (e) => {
    setExpiryDate(formatExpiryDate(e.target.value))
  }

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validateForm = () => {
    const newErrors = {}

    if (!cardNumber || cardNumber.replace(/\s/g, "").length !== 16) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number"
    }

    if (!cardName) {
      newErrors.cardName = "Please enter the name on card"
    }

    if (!expiryDate || expiryDate.length !== 5) {
      newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)"
    } else {
      const [month, year] = expiryDate.split("/")
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1

      if (Number.parseInt(month) < 1 || Number.parseInt(month) > 12) {
        newErrors.expiryDate = "Invalid month"
      } else if (
        Number.parseInt(year) < currentYear ||
        (Number.parseInt(year) === currentYear && Number.parseInt(month) < currentMonth)
      ) {
        newErrors.expiryDate = "Card has expired"
      }
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = "Please enter a valid CVV"
    }

    if (!email || !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onPaymentComplete(email)
    }
  }

  return (
    <Card sx={{ border: '1px solid #d7f5dd' }}>
      <CardHeader 
        title={
          <Typography variant="h6" align="center" color="primary">
            Payment Details
          </Typography>
        }
        subheader={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: '#059669' }}>
            <Lock style={{ height: 16, width: 16 }} />
            <Typography variant="body2">Secure Payment</Typography>
          </Box>
        }
      />
      <CardContent>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle2">Email Address</Typography>
            <TextField
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail style={{ height: 16, width: 16, color: 'rgba(0,0,0,0.54)' }} />
                  </InputAdornment>
                ),
              }}
              error={!!errors.email}
              helperText={errors.email || "Your booking confirmation will be sent to this email address"}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle2">Card Number</Typography>
            <TextField
              id="card-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              inputProps={{ maxLength: 19 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CreditCard style={{ height: 16, width: 16, color: 'rgba(0,0,0,0.54)' }} />
                  </InputAdornment>
                ),
              }}
              error={!!errors.cardNumber}
              helperText={errors.cardNumber}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle2">Name on Card</Typography>
            <TextField
              id="card-name"
              placeholder="John Doe"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              error={!!errors.cardName}
              helperText={errors.cardName}
              fullWidth
              variant="outlined"
              size="small"
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="subtitle2">Expiry Date</Typography>
              <TextField
                id="expiry"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                inputProps={{ maxLength: 5 }}
                error={!!errors.expiryDate}
                helperText={errors.expiryDate}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="subtitle2">CVV</Typography>
              <TextField
                id="cvv"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputProps={{ maxLength: 4 }}
                type="password"
                error={!!errors.cvv}
                helperText={errors.cvv}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
        </form>
      </CardContent>
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          p: 1.5, 
          bgcolor: '#f0fdf4', 
          borderRadius: 1 
        }}>
          <Typography variant="body2" fontWeight="medium">Total Payment:</Typography>
          <Typography variant="body1" fontWeight="bold" color="#047857">${totalAmount.toFixed(2)}</Typography>
        </Box>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}
        >
          {isLoading ? (
            <>
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            "Pay Now"
          )}
        </Button>
        <Typography variant="caption" align="center" color="text.secondary">
          This is a demo. No actual payment will be processed.
        </Typography>
      </Box>
    </Card>
  )
}

export default PaymentForm