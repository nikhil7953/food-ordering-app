import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Remove,
  LocalDining,
  LocationOn,
  Phone,
  Email,
  ShoppingCart,
  AccessTime,
} from '@mui/icons-material';
import { restaurantAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart } = useCart();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add to cart dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    fetchRestaurantDetails();
    fetchRestaurantMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const data = await restaurantAPI.getRestaurant(id);
      setRestaurant(data);
    } catch (err) {
      setError('Failed to load restaurant details.');
      console.error('Error fetching restaurant:', err);
    }
  };

  const fetchRestaurantMenu = async () => {
    try {
      setLoading(true);
      const data = await restaurantAPI.getRestaurantMenu(id);
      setMenuData(data);
    } catch (err) {
      setError('Failed to load menu.');
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menuItem) => {
    setSelectedItem(menuItem);
    setQuantity(1);
    setSpecialInstructions('');
    setDialogOpen(true);
  };

  const handleConfirmAddToCart = () => {
  if (selectedItem) {
    // Add restaurant ID to the menu item before adding to cart
    const itemWithRestaurant = {
      ...selectedItem,
      restaurant: parseInt(id), // Use the restaurant ID from URL params
    };
    addToCart(itemWithRestaurant, quantity, specialInstructions);
    setDialogOpen(false);
    setSelectedItem(null);
  }
};

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
    setQuantity(1);
    setSpecialInstructions('');
  };

  const getDefaultImage = () => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NZW51IEl0ZW0gSW1hZ2U8L3RleHQ+PC9zdmc+';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !restaurant) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Restaurant not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mt: 2 }}>
          Back to Restaurants
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/')} sx={{ mb: 2 }}>
        Back to Restaurants
      </Button>

      {/* Restaurant Header */}
      <Paper elevation={3} sx={{ mb: 4, overflow: 'hidden' }}>
        {restaurant.banner && (
          <Box
            component="img"
            src={restaurant.banner}
            alt={restaurant.name}
            sx={{
              width: '100%',
              height: 300,
              objectFit: 'cover',
            }}
          />
        )}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" gutterBottom>
                {restaurant.name}
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={restaurant.country === 'INDIA' ? 'India' : 'America'}
                  color="primary"
                  sx={{ mr: 1 }}
                />
                {restaurant.is_active ? (
                  <Chip label="Open" color="success" />
                ) : (
                  <Chip label="Closed" color="error" />
                )}
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                {restaurant.description}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{restaurant.address}</Typography>
                </Box>
                {restaurant.phone_number && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{restaurant.phone_number}</Typography>
                  </Box>
                )}
                {restaurant.email && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{restaurant.email}</Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={() => navigate('/cart')}
                disabled={cart.length === 0}
              >
                View Cart ({cart.length})
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Menu */}
      {menuData.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <LocalDining sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6">No menu items available</Typography>
        </Box>
      ) : (
        menuData.map((categoryData, index) => (
          <Box key={categoryData.category.id} sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              {categoryData.category.name}
            </Typography>
            {categoryData.category.description && (
              <Typography variant="body2" color="text.secondary" paragraph>
                {categoryData.category.description}
              </Typography>
            )}
            
            <Grid container spacing={3}>
              {categoryData.items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image || getDefaultImage()}
                      alt={item.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {item.name}
                      </Typography>
                      
                      <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {item.is_vegetarian && (
                          <Chip label="Vegetarian" size="small" color="success" variant="outlined" />
                        )}
                        {item.is_vegan && (
                          <Chip label="Vegan" size="small" color="success" variant="outlined" />
                        )}
                        {item.is_gluten_free && (
                          <Chip label="Gluten Free" size="small" color="info" variant="outlined" />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.description || 'Delicious food item'}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTime sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.preparation_time} mins
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                        <Typography variant="h6" color="primary">
                          ${parseFloat(item.price).toFixed(2)}
                        </Typography>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.is_available}
                        >
                          {item.is_available ? 'Add' : 'Unavailable'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {index < menuData.length - 1 && <Divider sx={{ my: 4 }} />}
          </Box>
        ))
      )}

      {/* Add to Cart Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add to Cart</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedItem.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                ${parseFloat(selectedItem.price).toFixed(2)} each
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Quantity:
                </Typography>
                <IconButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <Typography variant="h6" sx={{ mx: 2 }}>
                  {quantity}
                </Typography>
                <IconButton onClick={() => setQuantity(quantity + 1)}>
                  <Add />
                </IconButton>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Special Instructions (Optional)"
                placeholder="E.g., No onions, extra spicy..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />

              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="h6">
                  Total: ${(parseFloat(selectedItem.price) * quantity).toFixed(2)}
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmAddToCart}>
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RestaurantDetail;