import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    if (savedRestaurant) {
      try {
        setSelectedRestaurant(JSON.parse(savedRestaurant));
      } catch (error) {
        console.error('Error loading restaurant:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (selectedRestaurant) {
      localStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant));
    } else {
      localStorage.removeItem('selectedRestaurant');
    }
  }, [selectedRestaurant]);

  const addToCart = (menuItem, quantity = 1, specialInstructions = '') => {
    setCart((prevCart) => {
      // If cart is empty or restaurant changes, clear it
      if (prevCart.length > 0) {
        const firstItem = prevCart[0];
        const restaurantId = firstItem.menu_item?.category?.restaurant || firstItem.restaurant_id;
        
        // Get new restaurant ID and ensure it's a number
        let newRestaurantId = menuItem.category?.restaurant || menuItem.restaurant;
        if (typeof newRestaurantId === 'object' && newRestaurantId !== null) {
          newRestaurantId = newRestaurantId.id;
        }
        newRestaurantId = parseInt(newRestaurantId);
        
        if (restaurantId !== newRestaurantId) {
          // Different restaurant, clear cart and update restaurant
          const newCart = [{
            menu_item: menuItem,
            quantity,
            special_instructions: specialInstructions,
            price: parseFloat(menuItem.price),
            restaurant_id: newRestaurantId,
          }];
          return newCart;
        }
      }

      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(
        (item) => item.menu_item.id === menuItem.id
      );

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        if (specialInstructions) {
          updatedCart[existingItemIndex].special_instructions = specialInstructions;
        }
        return updatedCart;
      } else {
        // Add new item
        let restaurantId = menuItem.category?.restaurant || menuItem.restaurant;
        // Ensure it's always a number
        if (typeof restaurantId === 'object' && restaurantId !== null) {
          restaurantId = restaurantId.id;
        }
        restaurantId = parseInt(restaurantId);
        
        return [
          ...prevCart,
          {
            menu_item: menuItem,
            quantity,
            special_instructions: specialInstructions,
            price: parseFloat(menuItem.price),
            restaurant_id: restaurantId,
          },
        ];
      }
    });

    // Set restaurant if not already set
    if (!selectedRestaurant) {
      let restaurantId = menuItem.category?.restaurant || menuItem.restaurant;
      if (typeof restaurantId === 'object' && restaurantId !== null) {
        restaurantId = restaurantId.id;
      }
      restaurantId = parseInt(restaurantId);
      setSelectedRestaurant({ id: restaurantId });
    }
  };

  const removeFromCart = (menuItemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.menu_item.id !== menuItemId));
  };

  const updateCartItemQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.menu_item.id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedRestaurant(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('selectedRestaurant');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    selectedRestaurant,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    setSelectedRestaurant,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


