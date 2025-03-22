import { Card, CardContent, CardHeader, CardActions, Typography, Button, Box } from "@mui/material";

const SafariOptions = ({ packages, onSelect }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography 
        variant="h6" 
        align="center" 
        sx={{ color: '#166534', fontWeight: 500 }}
      >
        Choose Your Safari Experience
      </Typography>
      
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(3, 1fr)'
          }, 
          gap: 2 
        }}
      >
        {packages.map((pkg) => (
          <Card 
            key={pkg.id} 
            sx={{ 
              overflow: 'hidden', 
              transition: 'box-shadow 0.3s', 
              '&:hover': { boxShadow: 3 },
              border: '1px solid #dcfce7'
            }}
          >
            <Box sx={{ position: 'relative', height: 160 }}>
              <img 
                src={pkg.image || "/placeholder.svg"} 
                alt={pkg.name} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover' 
                }} 
              />
            </Box>
            
            <CardHeader 
              title={
                <Typography variant="h6" sx={{ color: '#15803d', fontSize: '1.1rem' }}>
                  {pkg.name}
                </Typography>
              }
              subheader={
                <Typography variant="body2" sx={{ color: '#4b5563', fontSize: '0.875rem' }}>
                  {pkg.duration} • Starts at {pkg.startTime}
                </Typography>
              }
              sx={{ pb: 1 }}
            />
            
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.875rem' }}>
                {pkg.description}
              </Typography>
            </CardContent>
            
            <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#166534' }}>
                ${pkg.price.toFixed(2)}
              </Typography>
              <Button 
                onClick={() => onSelect(pkg)} 
                variant="contained"
                sx={{ 
                  bgcolor: '#16a34a', 
                  '&:hover': { bgcolor: '#15803d' },
                  color: 'white',
                  textTransform: 'none'
                }}
              >
                Select
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default SafariOptions;