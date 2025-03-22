import { Paper, Box, Typography } from "@mui/material"
import React from "react"

const MetricCard = ({ title, value, percentage, icon, color }) => {
  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${color}20`, // 20% opacity of the color
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>

      <Typography variant="h4" component="div" sx={{ fontWeight: "bold", mb: 1 }}>
        {value}
      </Typography>

      {percentage && (
        <Typography variant="body2" color="text.secondary">
          {percentage}% of total
        </Typography>
      )}
    </Paper>
  )
}

export default MetricCard

