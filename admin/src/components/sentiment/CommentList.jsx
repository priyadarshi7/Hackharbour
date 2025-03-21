import React from "react"
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  Box,
  Divider,
  Rating,
} from "@mui/material"
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt"
import SentimentNeutralIcon from "@mui/icons-material/SentimentNeutral"
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied"

const CommentList = ({ comments }) => {
  const getSentimentIcon = (rating) => {
    if (!rating) return <SentimentNeutralIcon />

    if (rating >= 4) return <SentimentSatisfiedAltIcon style={{ color: "#4caf50" }} />
    if (rating <= 2) return <SentimentVeryDissatisfiedIcon style={{ color: "#f44336" }} />
    return <SentimentNeutralIcon style={{ color: "#ff9800" }} />
  }

  const getSentimentLabel = (rating) => {
    if (!rating) return { text: "Neutral", color: "#ff9800" }

    if (rating >= 4) return { text: "Positive", color: "#4caf50" }
    if (rating <= 2) return { text: "Negative", color: "#f44336" }
    return { text: "Neutral", color: "#ff9800" }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString()
    } catch (e) {
      return dateString
    }
  }

  return (
    <List sx={{ width: "100%", bgcolor: "background.paper" }}>
      {comments.map((comment, index) => {
        const sentimentLabel = getSentimentLabel(comment.rating)

        return (
          <React.Fragment key={comment._id}>
            {index > 0 && <Divider variant="inset" component="li" />}
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{getSentimentIcon(comment.rating)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                    <Typography component="span" variant="subtitle1" fontWeight="medium">
                      {comment.userName}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.secondary">
                      on {comment.productDetails?.name}
                    </Typography>
                    <Chip
                      label={sentimentLabel.text}
                      size="small"
                      sx={{
                        backgroundColor: `${sentimentLabel.color}20`,
                        color: sentimentLabel.color,
                        fontWeight: "medium",
                        ml: "auto",
                      }}
                    />
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body1" color="text.primary" sx={{ display: "block", my: 1 }}>
                      {comment.text}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      {comment.rating && <Rating value={comment.rating} readOnly size="small" sx={{ mr: 1 }} />}
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  </React.Fragment>
                }
              />
            </ListItem>
          </React.Fragment>
        )
      })}
    </List>
  )
}

export default CommentList

