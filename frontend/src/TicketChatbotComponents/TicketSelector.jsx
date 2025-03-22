import { Button } from "@mui/material";
import { Card, CardContent, CardHeader, CardActions, Typography, Box, IconButton } from "@mui/material";
import { Remove as MinusCircle, Add as PlusCircle } from "@mui/icons-material";

const TicketSelector = ({ ticketTypes, selectedTickets, setSelectedTickets, basePrice, totalPrice, onConfirm }) => {
  const updateTicketCount = (typeId, increment) => {
    setSelectedTickets((prev) => {
      const newCount = increment ? (prev[typeId] || 0) + 1 : Math.max(0, (prev[typeId] || 0) - 1);
      return {
        ...prev,
        [typeId]: newCount,
      };
    });
  };

  const totalTickets = Object.values(selectedTickets).reduce((sum, count) => sum + count, 0);
  const isConfirmDisabled = totalTickets === 0;

  return (
    <Card>
      <CardHeader title="Select Tickets" />
      <CardContent>
        {ticketTypes.map((type) => {
          const ticketPrice = basePrice * type.priceMultiplier;
          return (
            <Box key={type.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <Box>
                <Typography variant="h6">{type.name}</Typography>
                <Typography variant="body2" color="text.secondary">{type.description}</Typography>
                <Typography variant="subtitle1">${ticketPrice.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={() => updateTicketCount(type.id, false)}
                  disabled={!selectedTickets[type.id]}
                  color="primary"
                >
                  <MinusCircle />
                </IconButton>
                <Typography sx={{ mx: 2 }}>{selectedTickets[type.id] || 0}</Typography>
                <IconButton 
                  onClick={() => updateTicketCount(type.id, true)}
                  color="primary"
                >
                  <PlusCircle />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Typography variant="h6">
          Total: ${totalPrice.toFixed(2)}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          disabled={isConfirmDisabled}
          onClick={onConfirm}
        >
          Confirm Selection
        </Button>
      </CardActions>
    </Card>
  );
};

export default TicketSelector;