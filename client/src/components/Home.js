import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Box,
  Icon
} from '@mui/material';
import {
  Storage as StorageIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  RateReview as RateReviewIcon,
  Favorite as FavoriteIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

const schemas = [
  { name: 'Product', description: 'Product information and details', icon: <ShoppingCartIcon sx={{ fontSize: 40 }} /> },
  { name: 'User', description: 'User account information', icon: <PersonIcon sx={{ fontSize: 40 }} /> },
  { name: 'Order', description: 'Order details and status', icon: <StorageIcon sx={{ fontSize: 40 }} /> },
  { name: 'Review', description: 'Product reviews and ratings', icon: <RateReviewIcon sx={{ fontSize: 40 }} /> },
  { name: 'Wishlist', description: 'User wishlist items', icon: <FavoriteIcon sx={{ fontSize: 40 }} /> },
  { name: 'Payment', description: 'Payment information and transactions', icon: <PaymentIcon sx={{ fontSize: 40 }} /> },
];

function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f4f6f8',
      py: 8
    }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
          E-commerce Database Schemas
        </Typography>
        <Typography variant="h6" gutterBottom align="center" color="text.secondary" sx={{ mb: 6 }}>
          Explore and manage your data for each schema
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
          {schemas.map((schema) => (
            <Grid item xs={12} sm={6} md={4} key={schema.name}>
              <Card sx={{ minHeight: 180, display: 'flex', flexDirection: 'column' }}>
                <CardActionArea
                  onClick={() => navigate(`/schema/${schema.name.toLowerCase()}`)}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3 }}
                >
                  <Box sx={{ color: 'primary.main', mb: 1 }}>
                    {schema.icon}
                  </Box>
                  <Typography variant="h5" component="h2" gutterBottom align="center">
                    {schema.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center">
                    {schema.description}
                  </Typography>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home; 