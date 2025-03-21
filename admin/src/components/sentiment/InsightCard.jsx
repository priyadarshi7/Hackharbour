import { Paper, Typography, Box } from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import WarningIcon from "@mui/icons-material/Warning"
import ErrorIcon from "@mui/icons-material/Error"
import LightbulbIcon from "@mui/icons-material/Lightbulb"

const InsightCard = ({ type, text }) => {
  const getTypeConfig = () => {
    switch (type) {
      case "positive":
        return {
          icon: <CheckCircleIcon />,
          color: "#4caf50",
          bgColor: "#4caf5020",
        }
      case "negative":
        return {
          icon: <ErrorIcon />,
          color: "#f44336",
          bgColor: "#f4433620",
        }
      case "warning":
        return {
          icon: <WarningIcon />,
          color: "#ff9800",
          bgColor: "#ff980020",
        }
      case "action":
        return {
          icon: <LightbulbIcon />,
          color: "#3f51b5",
          bgColor: "#3f51b520",
        }
      case "info":
      default:
        return {
          icon: <InfoIcon />,
          color: "#2196f3",
          bgColor: "#2196f320",
        }
    }
  }

  const config = getTypeConfig()

  return (
    <Paper
      sx={{
        p: 2,
        borderLeft: `4px solid ${config.color}`,
        backgroundColor: config.bgColor,
        height: "100%",
      }}
      elevation={0}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start" }}>
        <Box sx={{ color: config.color, mr: 1, mt: 0.5 }}>{config.icon}</Box>
        <Typography variant="body1">{text}</Typography>
      </Box>
    </Paper>
  )
}

export default InsightCard

