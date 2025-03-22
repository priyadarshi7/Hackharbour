import { Paper, Typography, useTheme, useMediaQuery } from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import React from "react"

const ProductSentimentComparison = ({ products }) => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"))

  // Prepare data for the chart
  const chartData = products.map((product) => ({
    name: product.name,
    sentiment: Number.parseFloat(product.averageSentiment.toFixed(2)),
    comments: product.commentCount,
  }))

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Product Sentiment Comparison
      </Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 70,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={70} />
          <YAxis yAxisId="left" orientation="left" stroke="#3f51b5" domain={[-1, 1]} />
          <YAxis yAxisId="right" orientation="right" stroke="#f50057" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="sentiment" name="Sentiment Score" fill="#3f51b5" />
          <Bar yAxisId="right" dataKey="comments" name="Comment Count" fill="#f50057" />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  )
}

export default ProductSentimentComparison

