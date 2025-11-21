import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  ArrowBack,
  Restaurant,
  CheckCircle,
  Cancel as CancelIcon,
  LocationOn,
  Payment,
  Receipt,
  AccessTime,
} from '@mui/icons-material';
import { orderAPI } from '../services/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getOrder(id);
      setOrder(data);
      setError('');
    } catch (err) {
      setError('Failed to load order details. Please try again.');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setCanceling(true);
      setCancelError('');
      await orderAPI.cancelOrder(id);
      
      // Refresh order details
      await fetchOrderDetails();
      
      alert('Order cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling order:', err);
      setCancelError(
        err.response?.status === 403
          ? 'You do not have permission to cancel this order. Only Admins and Managers can cancel orders.'
          : err.response?.data?.error || 'Failed to cancel order. Please try again.'
      );
    } finally {
      setCanceling(false);
    }
  };

  const canCancelOrder = () => {
    if (!order) return false;
    return ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      PREPARING: 'primary',
      OUT_FOR_DELIVERY: 'secondary',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return statusColors[status] || 'default';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderSteps = () => {
    return [
      { label: 'Pending', status: 'PENDING' },
      { label: 'Confirmed', status: 'CONFIRMED' },
      { label: 'Preparing', status: 'PREPARING' },
      { label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY' },
      { label: 'Delivered', status: 'DELIVERED' },
    ];
  };

  const getActiveStep = (status) => {
    if (status === 'CANCELLED') return -1;
    
    const steps = getOrderSteps();
    const stepIndex = steps.findIndex((step) => step.status === status);
    return stepIndex;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Order not found'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/orders')} sx={{ mt: 2 }}>
          Back to Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Back Button */}
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/orders')} sx={{ mb: 2 }}>
        Back to Orders
      </Button>

      {/* Order Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Order #{order.id}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                label={order.status_display}
                color={getStatusColor(order.status)}
                icon={order.status === 'CANCELLED' ? <CancelIcon /> : <CheckCircle />}
              />
              <Chip
                label={order.country === 'INDIA' ? 'India' : 'America'}
                size="small"
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              <AccessTime sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
              Ordered on {formatDate(order.created_at)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Total: ${parseFloat(order.total_amount).toFixed(2)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Order Status Tracker */}
      {order.status !== 'CANCELLED' && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Status
          </Typography>
          <Stepper activeStep={getActiveStep(order.status)} alternativeLabel sx={{ mt: 3 }}>
            {getOrderSteps().map((step) => (
              <Step key={step.status}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {order.status === 'CANCELLED' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          This order has been cancelled.
        </Alert>
      )}

      {/* Cancel Order Error */}
      {cancelError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {cancelError}
        </Alert>
      )}

      {/* Cancel Order Button */}
      {canCancelOrder() && (
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<CancelIcon />}
            onClick={handleCancelOrder}
            disabled={canceling}
            sx={{ minWidth: 200 }}
          >
            {canceling ? 'Cancelling...' : 'CANCEL ORDER'}
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Order Items */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Receipt sx={{ verticalAlign: 'middle', mr: 1 }} />
              Order Items
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items && order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography variant="body1">
                          {item.menu_item_name}
                        </Typography>
                        {item.special_instructions && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Note: {item.special_instructions}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">
                        ${parseFloat(item.price).toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${parseFloat(item.subtotal).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} align="right">
                      <Typography variant="h6">Total:</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" color="primary">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Order Details */}
        <Grid item xs={12} md={4}>
          {/* Restaurant Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Restaurant sx={{ verticalAlign: 'middle', mr: 1 }} />
                Restaurant
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body1" gutterBottom>
                {order.restaurant_name}
              </Typography>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <LocationOn sx={{ verticalAlign: 'middle', mr: 1 }} />
                Delivery Address
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2">
                {order.delivery_address}
              </Typography>
            </CardContent>
          </Card>

          {/* Payment Method */}
          {order.payment_method && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Payment sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Payment Method
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  Payment Method ID: {order.payment_method}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Special Instructions */}
          {order.special_instructions && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Special Instructions
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  {order.special_instructions}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Order Again Button */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate(`/restaurant/${order.restaurant}`)}
        >
          Order Again from {order.restaurant_name}
        </Button>
      </Box>
    </Container>
  );
};

export default OrderDetail;