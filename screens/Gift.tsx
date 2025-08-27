import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TextInput,
  FlatList,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// ✅ ADD NOTIFICATION IMPORTS
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2;

// ✅ NOTIFICATION HANDLER CONFIGURATION
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Gift = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  
  // User form state
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  // ✅ NOTIFICATION STATE
  const [notificationPermission, setNotificationPermission] = useState('');

  useEffect(() => {
    registerForNotifications();
  }, []);

  // ✅ REGISTER FOR NOTIFICATIONS
  const registerForNotifications = async () => {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        setNotificationPermission('device_not_supported');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      setNotificationPermission(finalStatus);
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get notification permissions!');
        return;
      }

      console.log('Notification permissions granted');
    } catch (error) {
      console.error('Error registering for notifications:', error);
      setNotificationPermission('error');
    }
  };

  // ✅ SEND ORDER CONFIRMATION NOTIFICATIONS
  const sendOrderConfirmationNotification = async (orderDetails: any) => {
    try {
      if (notificationPermission !== 'granted') {
        console.log('No notification permission, skipping notifications');
        return;
      }

      // Trigger haptic feedback
      try {
        if (Haptics?.notificationAsync) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (hapticError) {
        console.log('Haptic feedback not available:', hapticError);
      }

      // Send immediate order confirmation notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Order Confirmed!',
          body: `Hi ${orderDetails.name}! Your Barcelona merchandise order for Rs. ${orderDetails.totalAmount.toLocaleString()} has been placed successfully.`,
          data: { 
            type: 'order_confirmation',
            orderId: orderDetails.orderId,
            amount: orderDetails.totalAmount,
          },
          sound: 'default',
        },
        trigger: null, // Send immediately
      });

      // Send delivery information notification (3 seconds later)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚚 Delivery Information',
          body: `Your order will be delivered to: ${orderDetails.address}, ${orderDetails.city} - ${orderDetails.pincode}. Confirmation sent to ${orderDetails.email}`,
          data: { 
            type: 'delivery_info',
            orderId: orderDetails.orderId,
          },
          sound: 'default',
        },
        trigger: { seconds: 3 }, // Send 3 seconds later
      });

      // Send order tracking notification (6 seconds later)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📦 Order Tracking',
          body: `Track your order ${orderDetails.orderId} in the app. Estimated delivery: 3-5 business days. ¡Visça Barça!`,
          data: { 
            type: 'order_tracking',
            orderId: orderDetails.orderId,
          },
          sound: 'default',
        },
        trigger: { seconds: 6 }, // Send 6 seconds later
      });

      console.log('Order confirmation notifications sent successfully');
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  // ✅ TEST NOTIFICATION FUNCTION (Optional - for development)
  const sendTestNotification = async () => {
    try {
      if (notificationPermission !== 'granted') {
        Alert.alert('Notifications Disabled', 'Please enable notifications to receive order updates.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'This is a test notification from your Barça store!',
          data: { type: 'test' },
          sound: 'default',
        },
        trigger: { seconds: 2 },
      });
      
      Alert.alert('Test Sent', 'Notification will appear in 2 seconds! Put app in background to see it.');
    } catch (error) {
      console.error('Test notification error:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const products = [
    {
      id: 1,
      name: 'FC Barcelona Official Cap',
      price: 3600,
      originalPrice: 4200,
      image: 'https://store.fcbarcelona.com/cdn/shop/files/75781_1.jpg?v=1748350225&width=1200',
      category: 'Accessories',
      isExclusive: false,
      inStock: true,
      discount: '15%',
    },
    {
      id: 2,
      name: 'Barcelona Champions Scarf',
      price: 5100,
      image: 'https://store.fcbarcelona.com/cdn/shop/files/75795_4.jpg?v=1754468874&width=1200',
      category: 'Accessories',
      isExclusive: false,
      inStock: true,
    },
    {
      id: 3,
      name: 'Barça Premium Wallet',
      price: 4400,
      originalPrice: 5500,
      image: 'https://store.fcbarcelona.com/cdn/shop/files/75770_2.jpg?v=1752050027&width=1200',
      category: 'Accessories',
      isExclusive: true,
      inStock: true,
      discount: '20%',
    },
    {
      id: 4,
      name: 'Club Elite Watch',
      price: 62700,
      image: 'https://store.fcbarcelona.com/cdn/shop/files/BLMP000877002_1_fd8ebd90-c552-40a3-8665-52386334745b.jpg?v=1701697002&width=1200',
      category: 'Premium',
      isExclusive: true,
      inStock: true,
    },
    {
      id: 5,
      name: 'FC Barcelona Keychain',
      price: 1900,
      image: 'https://store.fcbarcelona.com/cdn/shop/products/unnamed_1e64354a-b67b-4d59-97b8-c7c906c4fd87.jpg?v=1680014606&width=1200',
      category: 'Accessories',
      isExclusive: false,
      inStock: true,
      stock: 'Few items remaining',
    },
    {
      id: 6,
      name: 'Barça Champions Mug',
      price: 2600,
      image: 'https://store.fcbarcelona.com/cdn/shop/products/700x1060-74739-1.jpg?v=1680012213&width=1200',
      category: 'Home',
      isExclusive: false,
      inStock: false,
    },
    {
      id: 7,
      name: 'Premium Leather Bag',
      price: 25100,
      originalPrice: 28000,
      image: 'https://store.fcbarcelona.com/cdn/shop/files/75768_1.jpg?v=1752049945&width=1200',
      category: 'Premium',
      isExclusive: true,
      inStock: true,
      discount: '10%',
    },
    {
      id: 8,
      name: 'Barcelona Phone Case',
      price: 3200,
      image: 'https://store.fcbarcelona.com/cdn/shop/products/unnamed_3fc8adfc-6adc-4a5c-b558-d84adb340574.jpg?v=1680014613&width=1200',
      category: 'Accessories',
      isExclusive: false,
      inStock: true,
    },
  ];

  const filters = ['All', 'Accessories', 'Premium', 'Home'];

  const filteredProducts = products.filter(product => {
    const matchesFilter = selectedFilter === 'All' || product.category === selectedFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Cart functions
  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    Alert.alert('Success', `${product.name} added to cart!`);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: quantity }
          : item
      ));
    }
  };

  // Wishlist functions
  const toggleWishlist = (product: any) => {
    const isInWishlist = wishlist.some(item => item.id === product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlist.some(item => item.id === productId);
  };

  // Calculate totals
  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Helper function to get quantity of item in cart
  const getItemQuantityInCart = (productId: number) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Order placement
  const validateForm = () => {
    const { name, email, phone, address, city, pincode } = userDetails;
    if (!name || !email || !phone || !address || !city || !pincode) {
      Alert.alert('Error', 'Please fill all the required fields');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  // ✅ ENHANCED PLACE ORDER FUNCTION WITH NOTIFICATIONS
  const placeOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    if (validateForm()) {
      // Prepare order details for notification
      const orderDetails = {
        name: userDetails.name,
        email: userDetails.email,
        address: userDetails.address,
        city: userDetails.city,
        pincode: userDetails.pincode,
        totalAmount: getTotalAmount(),
        orderId: `FCB${Date.now()}`, // Generate unique order ID
        orderTime: new Date().toISOString(),
        items: cart.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      try {
        // ✅ SEND NOTIFICATIONS FIRST
        await sendOrderConfirmationNotification(orderDetails);

        // Then show enhanced success alert
        Alert.alert(
          '✅ Order Placed Successfully!', 
          `Thank you ${userDetails.name}!\n\nYour order of Rs. ${getTotalAmount().toLocaleString()} has been placed successfully.\n\nOrder ID: ${orderDetails.orderId}\n\nOrder will be delivered to:\n${userDetails.address}, ${userDetails.city} - ${userDetails.pincode}\n\nConfirmation will be sent to: ${userDetails.email}\n\n📱 Check your notifications for order updates!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setCart([]);
                setShowOrderForm(false);
                setShowCart(false);
                setUserDetails({
                  name: '',
                  email: '',
                  phone: '',
                  address: '',
                  city: '',
                  pincode: ''
                });
              }
            }
          ]
        );
      } catch (error) {
        console.error('Error in order placement:', error);
        Alert.alert('Order Error', 'There was an issue processing your order. Please try again.');
      }
    }
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        
        {/* Discount Badge */}
        {item.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.discount}</Text>
          </View>
        )}
        
        {/* Exclusive Badge */}
        {item.isExclusive && (
          <View style={styles.exclusiveBadge}>
            <MaterialIcons name="star" size={12} color="white" />
            <Text style={styles.exclusiveText}>EXCLUSIVE</Text>
          </View>
        )}
        
        {/* Premium Badge */}
        {item.category === 'Premium' && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}
        
        {/* Sold Out Overlay */}
        {!item.inStock && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        )}

        {/* Wishlist Button */}
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(item)}
        >
          <Ionicons 
            name={isInWishlist(item.id) ? "heart" : "heart-outline"} 
            size={20} 
            color={isInWishlist(item.id) ? "#DC143C" : "#666"} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>Rs. {item.price.toLocaleString()}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>Rs. {item.originalPrice.toLocaleString()}</Text>
          )}
        </View>
        
        {item.stock && (
          <View style={styles.stockIndicator}>
            <View style={styles.stockDot} />
            <Text style={styles.stockText}>{item.stock}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={[
          styles.addToCartButton, 
          !item.inStock && styles.disabledButton
        ]}
        activeOpacity={0.8}
        onPress={() => item.inStock && addToCart(item)}
        disabled={!item.inStock}
      >
        <Ionicons 
          name={item.inStock ? "bag-add" : "close-circle"} 
          size={16} 
          color={item.inStock ? "white" : "#666"} 
        />
        <Text style={[
          styles.addToCartText, 
          !item.inStock && styles.disabledText
        ]}>
          {!item.inStock 
            ? 'Sold Out' 
            : getItemQuantityInCart(item.id) > 0 
              ? `In Cart (${getItemQuantityInCart(item.id)})` 
              : 'Add to Cart'
          }
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>Rs. {item.price.toLocaleString()}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color="#004D98" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color="#004D98" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeFromCart(item.id)}
      >
        <Ionicons name="trash" size={20} color="#DC143C" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#004D98" />
      <SafeAreaView style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Official Store</Text>
            <Text style={styles.headerSubtitle}>Gifts & Accessories</Text>
          </View>
          
          <View style={styles.headerRight}>
            {/* ✅ ADD TEST NOTIFICATION BUTTON (only in development) */}
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={sendTestNotification}
              >
                <Ionicons name="notifications" size={22} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => setShowCart(true)}
            >
              <Ionicons name="bag-outline" size={22} color="white" />
              {getTotalItems() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Enhanced Hero Banner with Real Image */}
          <View style={styles.heroBanner}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80'
              }}
              style={styles.heroImage}
              onError={() => {
                console.log('Hero image failed to load');
              }}
            />
            <View style={styles.heroGradient}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Champions Collection</Text>
                <Text style={styles.heroSubtitle}>Celebrate our victories with exclusive merchandise</Text>
                <TouchableOpacity style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>Shop Now</Text>
                  <Ionicons name="arrow-forward" size={16} color="#004D98" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Enhanced Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Barcelona merchandise..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Enhanced Filter Tabs */}
          <View style={styles.filtersSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterTab,
                    selectedFilter === filter && styles.activeFilterTab,
                  ]}
                  onPress={() => setSelectedFilter(filter)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter && styles.activeFilterText,
                    ]}
                  >
                    {filter}
                  </Text>
                  {selectedFilter === filter && (
                    <View style={styles.filterIndicator} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Products Section */}
          <View style={styles.productsSection}>
            <View style={styles.productsSectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedFilter === 'All' ? 'All Products' : selectedFilter}
              </Text>
              <Text style={styles.resultsCount}>
                {filteredProducts.length} items
              </Text>
            </View>
            
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </ScrollView>

        {/* Cart Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showCart}
          onRequestClose={() => setShowCart(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCart(false)}>
                <Ionicons name="close" size={24} color="#004D98" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Shopping Cart</Text>
              <View style={styles.placeholder} />
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Ionicons name="bag-outline" size={80} color="#ccc" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <TouchableOpacity 
                  style={styles.continueShoppingButton}
                  onPress={() => setShowCart(false)}
                >
                  <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList
                  data={cart}
                  renderItem={renderCartItem}
                  keyExtractor={(item) => item.id.toString()}
                  style={styles.cartList}
                />
                
                <View style={styles.cartSummary}>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount:</Text>
                    <Text style={styles.totalAmount}>Rs. {getTotalAmount().toLocaleString()}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.checkoutButton}
                    onPress={() => setShowOrderForm(true)}
                  >
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </SafeAreaView>
        </Modal>

        {/* Order Form Modal */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={showOrderForm}
          onRequestClose={() => setShowOrderForm(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowOrderForm(false)}>
                <Ionicons name="arrow-back" size={24} color="#004D98" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Order Details</Text>
              <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.formTitle}>Shipping Information</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={userDetails.name}
                  onChangeText={(text) => setUserDetails({...userDetails, name: text})}
                  placeholder="Enter your full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  value={userDetails.email}
                  onChangeText={(text) => setUserDetails({...userDetails, email: text})}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={userDetails.phone}
                  onChangeText={(text) => setUserDetails({...userDetails, phone: text})}
                  placeholder="Enter 10-digit phone number"
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={userDetails.address}
                  onChangeText={(text) => setUserDetails({...userDetails, address: text})}
                  placeholder="Enter your complete address"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userDetails.city}
                    onChangeText={(text) => setUserDetails({...userDetails, city: text})}
                    placeholder="Enter city"
                  />
                </View>

                <View style={[styles.inputGroup, {flex: 1, marginLeft: 10}]}>
                  <Text style={styles.inputLabel}>Pin Code *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={userDetails.pincode}
                    onChangeText={(text) => setUserDetails({...userDetails, pincode: text})}
                    placeholder="Enter pin code"
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
              </View>

              <View style={styles.orderSummary}>
                <Text style={styles.orderSummaryTitle}>Order Summary</Text>
                {cart.map((item) => (
                  <View key={item.id} style={styles.orderItem}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <Text style={styles.orderItemDetails}>
                      {item.quantity} x Rs. {item.price.toLocaleString()}
                    </Text>
                    <Text style={styles.orderItemTotal}>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))}
                <View style={styles.orderTotalContainer}>
                  <Text style={styles.orderTotalLabel}>Total: Rs. {getTotalAmount().toLocaleString()}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.placeOrderButton}
                onPress={placeOrder}
              >
                <Text style={styles.placeOrderButtonText}>Place Order</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#004D98',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#DC143C',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroBanner: {
    position: 'relative',
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    padding: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'white',
    marginBottom: 12,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#004D98',
    fontWeight: 'bold',
    marginRight: 6,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filtersSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filtersContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  activeFilterTab: {
    backgroundColor: '#004D98',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filterIndicator: {
    height: 2,
    backgroundColor: '#FFD700',
    marginTop: 4,
    borderRadius: 2,
  },
  productsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#DC143C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  exclusiveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exclusiveText: {
    color: '#004D98',
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#8B4513',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  soldOutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  soldOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004D98',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
    marginRight: 6,
  },
  stockText: {
    fontSize: 11,
    color: '#FF6B6B',
    fontStyle: 'italic',
  },
  addToCartButton: {
    backgroundColor: '#004D98',
    margin: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  addToCartText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  disabledText: {
    color: '#666',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004D98',
  },
  placeholder: {
    width: 24,
  },

  // Cart Styles
  emptyCart: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyCartText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  continueShoppingButton: {
    backgroundColor: '#004D98',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#004D98',
    fontWeight: 'bold',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    padding: 8,
    alignSelf: 'center',
  },
  cartSummary: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004D98',
  },
  checkoutButton: {
    backgroundColor: '#004D98',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Form Styles
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004D98',
    marginVertical: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  orderSummary: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004D98',
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderItemName: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  orderItemDetails: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  orderItemTotal: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#004D98',
    textAlign: 'right',
  },
  orderTotalContainer: {
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  orderTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  placeOrderButton: {
    backgroundColor: '#004D98',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Gift;
