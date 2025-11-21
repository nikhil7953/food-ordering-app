import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import {
  Delete,
  Add,
  Remove,
  ShoppingCart,
  ArrowBack,
  ShoppingBag,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
  } = useCart();

  const handleQuantityChange = (menuItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(menuItemId);
    } else {
      updateCartItemQuantity(menuItemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add some delicious items to get started!
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Browse Restaurants
          </Button>
        </Paper>
      </Container>
    );
  }

  // Get restaurant info from first item
  const restaurantId = cart[0]?.restaurant_id || cart[0]?.menu_item?.category?.restaurant;
  const restaurantName = cart[0]?.menu_item?.restaurant_name || 'Restaurant';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Continue Shopping
      </Button>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">
                Shopping Cart
              </Typography>
              <Button
                color="error"
                onClick={clearCart}
                size="small"
              >
                Clear Cart
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Ordering from: <strong>{restaurantName}</strong>
            </Alert>

            <Divider sx={{ mb: 2 }} />

            {cart.map((item, index) => (
              <Box key={item.menu_item.id}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      {/* Item Image */}
                      <Grid item xs={3} sm={2}>
                        {item.menu_item.image ? (
                          <Box
                            component="img"
                            src={item.menu_item.image}
                            alt={item.menu_item.name}
                            sx={{
                              width: '100%',
                              height: 80,
                              objectFit: 'cover',
                              borderRadius: 1,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: '100%',
                              height: 80,
                              bgcolor: 'grey.200',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ShoppingBag sx={{ color: 'grey.400' }} />
                          </Box>
                        )}
                      </Grid>

                      {/* Item Details */}
                      <Grid item xs={9} sm={4}>
                        <Typography variant="h6" gutterBottom>
                          {item.menu_item.name}
                        </Typography>
                        {item.special_instructions && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Note: {item.special_instructions}
                          </Typography>
                        )}
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                          ${parseFloat(item.price).toFixed(2)} each
                        </Typography>
                      </Grid>

                      {/* Quantity Controls */}
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.menu_item.id, item.quantity - 1)}
                          >
                            <Remove />
                          </IconButton>
                          <Typography sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.menu_item.id, item.quantity + 1)}
                          >
                            <Add />
                          </IconButton>
                        </Box>
                      </Grid>

                      {/* Subtotal & Remove */}
                      <Grid item xs={6} sm={3} sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" gutterBottom>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeFromCart(item.menu_item.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Items ({cart.length})</Typography>
                <Typography variant="body1">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} total
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Subtotal</Typography>
                <Typography variant="body1">
                  ${getCartTotal().toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6" color="primary">
                ${getCartTotal().toFixed(2)}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleCheckout}
              sx={{ mb: 2 }}
            >
              Proceed to Checkout
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(`/restaurant/${restaurantId}`)}
            >
              Add More Items
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;