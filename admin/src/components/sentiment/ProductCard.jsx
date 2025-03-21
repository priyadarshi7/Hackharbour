import { Paper, Typography, Box, Divider, LinearProgress, Grid, Rating } from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const ProductCard = ({ product }) => {
  // Convert ratings object to array for chart
  const ratingData = Object.entries(product.ratings).map(([rating, count]) => ({
    rating: `${rating} ★`,
    count,
  }))

  // Calculate sentiment color
  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.3) return "#4caf50"
    if (sentiment < -0.3) return "#f44336"
    return "#ff9800"
  }

  const sentimentColor = getSentimentColor(product.averageSentiment)

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        {product.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {product.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Comments
          </Typography>
          <Typography variant="h6">{product.commentCount}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Average Rating
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" sx={{ mr: 1 }}>
              {product.averageRating.toFixed(1)}
            </Typography>
            <Rating value={product.averageRating} precision={0.5} readOnly size="small" />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Sentiment Score
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
          <Box sx={{ width: "100%", mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={(product.averageSentiment + 1) * 50} // Convert -1 to 1 range to 0 to 100
              sx={{
                height: 10,
                borderRadius: 5,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: sentimentColor,
                  borderRadius: 5,
                },
              }}
            />
          </Box>
          <Typography variant="body2" color={sentimentColor} sx={{ fontWeight: "bold" }}>
            {product.averageSentiment.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 3, height: 150 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Rating Distribution
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ratingData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  )
}

export default ProductCard

