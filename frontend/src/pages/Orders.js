import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Receipt,
  Restaurant,
  Schedule,
  LocalShipping,
  CheckCircle,
  Cancel as CancelIcon,
  Visibility,
} from '@mui/icons-material';
import { orderAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Admins should see ALL orders, others see only their own
      let data;
      if (user?.role === 'admin') {
        // Admin: Get all orders from all users
        data = await orderAPI.getOrders();
      } else {
        // Manager/Member: Get only their orders
        data = await orderAPI.getMyOrders();
      }
      
      // Handle both paginated and direct array responses
      if (data.results) {
        setOrders(data.results);
      } else if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
      
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]); // ✅ Always set to empty array on error
      
      // Better error messages based on status code
      if (err.response?.status === 403) {
        setError('You do not have permission to view orders. Only Admins and Managers can place and view orders.');
      } else if (err.response?.status === 401) {
        setError('Please log in to view your orders.');
      } else {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <Schedule />,
      CONFIRMED: <CheckCircle />,
      PREPARING: <Restaurant />,
      OUT_FOR_DELIVERY: <LocalShipping />,
      DELIVERED: <CheckCircle />,
      CANCELLED: <CancelIcon />,
    };
    return icons[status] || <Receipt />;
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {user?.role === 'admin' ? 'All Orders' : 'My Orders'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user?.role === 'admin' 
            ? 'View and manage all orders from all users'
            : 'View and track your order history'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && orders.length === 0 && (
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center' }}>
          <Receipt sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start ordering delicious food from your favorite restaurants!
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Browse Restaurants
          </Button>
        </Paper>
      )}

      {!loading && orders.length > 0 && (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card elevation={3}>
                <CardContent>
                  <Grid container spacing={2}>
                    {/* Order Header */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="overline" color="text.secondary">
                        Order ID
                      </Typography>
                      <Typography variant="h6">#{order.id}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(order.created_at)}
                      </Typography>
                      {user?.role === 'admin' && (
                        <Typography variant="caption" display="block" color="primary">
                          User: {order.user_name || order.user}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="overline" color="text.secondary">
                        Restaurant
                      </Typography>
                      <Typography variant="body1">
                        {order.restaurant_name}
                      </Typography>
                      <Chip
                        label={order.country === 'INDIA' ? 'India' : 'America'}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="overline" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <Typography variant="overline" color="text.secondary">
                        Status
                      </Typography>
                      <Box>
                        <Chip
                          icon={getStatusIcon(order.status)}
                          label={order.status_display}
                          color={getStatusColor(order.status)}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} md={2} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  {/* Order Items Summary */}
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Items ({order.items?.length || 0})
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {order.items && order.items.slice(0, 3).map((item, index) => (
                        <Typography key={index} variant="body2" color="text.secondary">
                          • {item.menu_item_name} x{item.quantity}
                        </Typography>
                      ))}
                      {order.items && order.items.length > 3 && (
                        <Typography variant="body2" color="text.secondary">
                          ... and {order.items.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {/* Delivery Address */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="overline" color="text.secondary">
                      Delivery Address
                    </Typography>
                    <Typography variant="body2">
                      {order.delivery_address}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Orders;