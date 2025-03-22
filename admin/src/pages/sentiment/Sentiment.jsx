import React, {useState, useEffect } from "react"
import { Box, Container, Grid, Paper, Typography, CircularProgress } from "@mui/material"
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt"
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral"
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Components
import MetricCard from "../../components/sentiment/MetricCard"
import SentimentDistribution from "../../components/sentiment/SentimentDistribution"
import ProductCard from "../../components/sentiment/ProductCard"
import CommentList from "../../components/sentiment/CommentList"
import InsightCard from "../../components/sentiment/InsightCard"

function SentimentMain() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metrics, setMetrics] = useState({
    totalComments: 0,
    averageSentiment: 0,
    positiveComments: 0,
    negativeComments: 0,
    neutralComments: 0,
  })
  const [productMetrics, setProductMetrics] = useState([])
  const [sentimentTrend, setSentimentTrend] = useState([])
  const [insights, setInsights] = useState([])

  // Colors for charts
  const COLORS = ["#4caf50", "#ff9800", "#f44336", "#2196f3", "#9c27b0", "#00bcd4"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:4000/api/comment/all-with-products")

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const result = await response.json()

        if (result.success && Array.isArray(result.data)) {
          setData(result.data)
          processData(result.data)
        } else {
          throw new Error("Invalid data structure received from API")
        }
      } catch (err) {
        setError(err.message)
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const processData = (comments) => {
    // Calculate overall metrics
    let positive = 0
    let negative = 0
    let neutral = 0
    let totalSentiment = 0

    // Group by product
    const productGroups = {}

    // Process each comment
    comments.forEach((comment) => {
      // Simple sentiment calculation based on rating
      const sentiment = calculateSentiment(comment.rating)
      totalSentiment += sentiment

      if (sentiment > 0.3) positive++
      else if (sentiment < -0.3) negative++
      else neutral++

      // Group by product
      const productId = comment.productId
      if (!productGroups[productId]) {
        productGroups[productId] = {
          id: productId,
          name: comment.productDetails?.name || "Unknown Product",
          description: comment.productDetails?.description || "",
          price: comment.productDetails?.price || 0,
          image: comment.productDetails?.image || "",
          comments: [],
          totalSentiment: 0,
          averageSentiment: 0,
          ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        }
      }

      productGroups[productId].comments.push(comment)
      productGroups[productId].totalSentiment += sentiment
      if (comment.rating) {
        productGroups[productId].ratings[comment.rating]++
      }
    })

    // Calculate averages for products
    const productData = Object.values(productGroups).map((product) => {
      return {
        ...product,
        commentCount: product.comments.length,
        averageSentiment: product.totalSentiment / product.comments.length,
        averageRating:
          product.comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / product.comments.length,
      }
    })

    // Sort products by comment count
    productData.sort((a, b) => b.commentCount - a.commentCount)

    // Generate mock sentiment trend (in a real app, this would come from historical data)
    const mockTrend = generateMockSentimentTrend()

    // Generate insights
    const generatedInsights = generateInsights(comments, productData)

    setMetrics({
      totalComments: comments.length,
      averageSentiment: totalSentiment / comments.length,
      positiveComments: positive,
      negativeComments: negative,
      neutralComments: neutral,
    })

    setProductMetrics(productData)
    setSentimentTrend(mockTrend)
    setInsights(generatedInsights)
  }

  const calculateSentiment = (rating) => {
    if (!rating) return 0
    // Convert 1-5 rating to a sentiment score between -1 and 1
    return (rating - 3) / 2
  }

  const generateMockSentimentTrend = () => {
    // In a real app, this would be historical data
    const now = new Date()
    const trend = []

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      trend.push({
        date: date.toISOString().split("T")[0],
        sentiment: Math.random() * 0.6 - 0.2 + 0.3, // Random value between -0.2 and 0.8
      })
    }

    return trend
  }

  const generateInsights = (comments, products) => {
    // In a real app, these would be generated from more sophisticated analysis
    const insights = []

    // Overall sentiment insight
    const overallSentiment =
      comments.reduce((sum, comment) => sum + calculateSentiment(comment.rating), 0) / comments.length

    if (overallSentiment > 0.3) {
      insights.push({
        type: "positive",
        text: `Overall sentiment is positive (${overallSentiment.toFixed(2)}). Customers are generally satisfied with the products.`,
      })
    } else if (overallSentiment < -0.3) {
      insights.push({
        type: "negative",
        text: `Overall sentiment is negative (${overallSentiment.toFixed(2)}). There may be issues that need attention.`,
      })
    } else {
      insights.push({
        type: "neutral",
        text: `Overall sentiment is neutral (${overallSentiment.toFixed(2)}). Customer opinions are mixed.`,
      })
    }

    // Product-specific insights
    if (products.length > 0) {
      const bestProduct = products.reduce(
        (best, product) => (product.averageSentiment > best.averageSentiment ? product : best),
        products[0],
      )

      const worstProduct = products.reduce(
        (worst, product) => (product.averageSentiment < worst.averageSentiment ? product : worst),
        products[0],
      )

      if (bestProduct.averageSentiment > 0.3) {
        insights.push({
          type: "positive",
          text: `${bestProduct.name} is receiving the most positive feedback with a sentiment score of ${bestProduct.averageSentiment.toFixed(2)}.`,
        })
      }

      if (worstProduct.averageSentiment < -0.3) {
        insights.push({
          type: "negative",
          text: `${worstProduct.name} is receiving the most negative feedback with a sentiment score of ${worstProduct.averageSentiment.toFixed(2)}.`,
        })
      }
    }

    // Add more insights based on common keywords, trends, etc.
    insights.push({
      type: "info",
      text: "Most comments mention product quality and customer service as key factors in their ratings.",
    })

    return insights
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography color="error" variant="h5">
          Error: {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sentiment Analysis Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Analyze customer feedback and sentiment across products
      </Typography>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Summary Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="Total Comments"
              value={metrics.totalComments}
              icon={<SentimentNeutralIcon />}
              color="#3f51b5"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="Positive Comments"
              value={metrics.positiveComments}
              percentage={((metrics.positiveComments / metrics.totalComments) * 100).toFixed(1)}
              icon={<SentimentSatisfiedAltIcon />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="Neutral Comments"
              value={metrics.neutralComments}
              percentage={((metrics.neutralComments / metrics.totalComments) * 100).toFixed(1)}
              icon={<SentimentNeutralIcon />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <MetricCard
              title="Negative Comments"
              value={metrics.negativeComments}
              percentage={((metrics.negativeComments / metrics.totalComments) * 100).toFixed(1)}
              icon={<SentimentVeryDissatisfiedIcon />}
              color="#f44336"
            />
          </Grid>
        </Grid>

        {/* Sentiment Trend and Distribution */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Sentiment Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sentimentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[-1, 1]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#3f51b5"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Sentiment Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <SentimentDistribution
              positive={metrics.positiveComments}
              neutral={metrics.neutralComments}
              negative={metrics.negativeComments}
            />
          </Grid>
        </Grid>

        {/* Insights */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Key Insights
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <InsightCard type={insight.type} text={insight.text} />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Product Cards */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Product Analysis
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {productMetrics.map((product) => (
            <Grid item xs={12} md={6} lg={4} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>

        {/* Recent Comments */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
          Recent Comments
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          <CommentList comments={data.slice(0, 10)} />
        </Paper>
      </Container>
    </Box>
  )
}

export default SentimentMain

