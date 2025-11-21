import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  Payment,
  LocationOn,
  CheckCircle,
} from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, paymentAPI } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal } = useCart();
  const { user } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [country, setCountry] = useState(user?.country || 'INDIA');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Add new payment method dialog
  const [addPaymentDialogOpen, setAddPaymentDialogOpen] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState('CASH_ON_DELIVERY');
  const [cardDetails, setCardDetails] = useState({
    card_last4: '',
    card_brand: '',
  });
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
    fetchPaymentMethods();
  }, [cart, navigate]);

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const data = await paymentAPI.getPaymentMethods();
      setPaymentMethods(data);
      
      // Auto-select default payment method
      const defaultMethod = data.find((method) => method.is_default);
      if (defaultMethod) {
        setSelectedPaymentMethod(defaultMethod.id.toString());
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      const paymentData = {
        payment_type: newPaymentType,
        is_default: paymentMethods.length === 0,
      };

      if (newPaymentType === 'CREDIT_CARD' || newPaymentType === 'DEBIT_CARD') {
        if (!cardDetails.card_last4 || !cardDetails.card_brand) {
          setError('Please enter card details');
          return;
        }
        paymentData.card_last4 = cardDetails.card_last4;
        paymentData.card_brand = cardDetails.card_brand;
      } else if (newPaymentType === 'UPI') {
        if (!upiId) {
          setError('Please enter UPI ID');
          return;
        }
        paymentData.upi_id = upiId;
      }

      const newMethod = await paymentAPI.createPaymentMethod(paymentData);
      setPaymentMethods([...paymentMethods, newMethod]);
      setSelectedPaymentMethod(newMethod.id.toString());
      setAddPaymentDialogOpen(false);
      
      // Reset form
      setNewPaymentType('CASH_ON_DELIVERY');
      setCardDetails({ card_last4: '', card_brand: '' });
      setUpiId('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add payment method');
    }
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }

    if (!country) {
      setError('Please select a country');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare order data
      let restaurantId = cart[0].restaurant_id || cart[0].menu_item?.category?.restaurant;
      
      // Ensure restaurantId is a number, not an array or object
      if (Array.isArray(restaurantId)) {
        restaurantId = restaurantId[0];
      } else if (typeof restaurantId === 'object' && restaurantId !== null) {
        restaurantId = restaurantId.id || restaurantId;
      }
      restaurantId = parseInt(restaurantId);
      
      const orderData = {
        restaurant: restaurantId,
        country: country,
        delivery_address: deliveryAddress,
        payment_method: parseInt(selectedPaymentMethod),
        special_instructions: specialInstructions,
        items: cart.map((item) => ({
          menu_item: item.menu_item.id,
          quantity: item.quantity,
          special_instructions: item.special_instructions || '',
        })),
      };
      console.log('🔍 Order data being sent:', orderData);
      console.log('🔍 Restaurant ID type:', typeof orderData.restaurant, orderData.restaurant);

      const order = await orderAPI.createOrder(orderData);
      setOrderId(order.id);
      setOrderSuccess(true);
      clearCart();
    } catch (err) {
      console.error('Order error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
        'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Success Dialog
  if (orderSuccess) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your order #{orderId} has been placed and is being prepared.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/orders')}
              sx={{ mr: 2 }}
            >
              View Orders
            </Button>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/cart')} sx={{ mb: 2 }}>
        Back to Cart
      </Button>

      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Checkout Form */}
        <Grid item xs={12} md={8}>
          {/* Delivery Information */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h5">Delivery Information</Typography>
            </Box>

            <TextField
              fullWidth
              label="Country"
              select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              sx={{ mb: 2 }}
              required
            >
              <MenuItem value="INDIA">India</MenuItem>
              <MenuItem value="AMERICA">America</MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Delivery Address"
              placeholder="Enter your complete delivery address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Special Instructions (Optional)"
              placeholder="Any special delivery instructions..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </Paper>

          {/* Payment Method */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h5">Payment Method</Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setAddPaymentDialogOpen(true)}
              >
                Add New
              </Button>
            </Box>

            {loadingPaymentMethods ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress />
              </Box>
            ) : paymentMethods.length === 0 ? (
              <Alert severity="info">
                No payment methods found. Please add a payment method to continue.
              </Alert>
            ) : (
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  {paymentMethods.map((method) => (
                    <Card key={method.id} variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <FormControlLabel
                          value={method.id.toString()}
                          control={<Radio />}
                          label={
                            <Box>
                              <Typography variant="body1">
                                {method.payment_type_display}
                                {method.is_default && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{ ml: 1, color: 'primary.main' }}
                                  >
                                    (Default)
                                  </Typography>
                                )}
                              </Typography>
                              {method.card_last4 && (
                                <Typography variant="caption" color="text.secondary">
                                  {method.card_brand} •••• {method.card_last4}
                                </Typography>
                              )}
                              {method.upi_id && (
                                <Typography variant="caption" color="text.secondary">
                                  {method.upi_id}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </FormControl>
            )}
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 80 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />

            {cart.map((item) => (
              <Box key={item.menu_item.id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {item.menu_item.name} x{item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}

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
              onClick={handlePlaceOrder}
              disabled={loading || paymentMethods.length === 0}
            >
              {loading ? <CircularProgress size={24} /> : 'Place Order'}
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Payment Method Dialog */}
      <Dialog
        open={addPaymentDialogOpen}
        onClose={() => setAddPaymentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Payment Method</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Payment Type"
            value={newPaymentType}
            onChange={(e) => setNewPaymentType(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          >
            <MenuItem value="CASH_ON_DELIVERY">Cash on Delivery</MenuItem>
            <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
            <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="NET_BANKING">Net Banking</MenuItem>
            <MenuItem value="WALLET">Wallet</MenuItem>
          </TextField>

          {(newPaymentType === 'CREDIT_CARD' || newPaymentType === 'DEBIT_CARD') && (
            <>
              <TextField
                fullWidth
                label="Card Brand"
                placeholder="e.g., Visa, Mastercard"
                value={cardDetails.card_brand}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, card_brand: e.target.value })
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Last 4 Digits"
                placeholder="1234"
                value={cardDetails.card_last4}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, card_last4: e.target.value })
                }
                inputProps={{ maxLength: 4 }}
              />
            </>
          )}

          {newPaymentType === 'UPI' && (
            <TextField
              fullWidth
              label="UPI ID"
              placeholder="user@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPaymentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPaymentMethod}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Checkout;