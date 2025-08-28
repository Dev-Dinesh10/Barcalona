import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Switch, 
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

// ✅ FIXED: Configure notification handler - moved outside component
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // ✅ Changed from shouldShowAlert
    shouldShowList: true,    // ✅ Added this property
    shouldPlaySound: true,   // ✅ This stays the same
    shouldSetBadge: false,   // ✅ This stays the same
  }),
});


const TicketScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tickets, setTickets] = useState('1');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [snacks, setSnacks] = useState(false);
  const [seat, setSeat] = useState('Middle');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [opponent, setOpponent] = useState('Real Madrid');
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notificationPermission, setNotificationPermission] = useState('');

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  // Enhanced notification registration
  const registerForPushNotificationsAsync = async () => {
    try {
      // Check if device supports notifications
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        setNotificationPermission('device_not_supported');
        return;
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('tickets', {
            name: 'Barça Tickets',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#004d98',
            sound: 'default',
          });
        } catch (channelError) {
          console.log('Channel creation error:', channelError);
        }
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      setNotificationPermission(finalStatus);
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notifications!');
        return;
      }

      // Get Expo push token (with fallback)
      try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || 
                         Constants?.easConfig?.projectId ||
                         'your-project-id';
        
        if (projectId && projectId !== 'your-project-id') {
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          setExpoPushToken(tokenData.data);
          console.log('Push token obtained successfully');
        } else {
          console.log('Project ID not configured - using local notifications only');
          setExpoPushToken('local_only');
        }
      } catch (tokenError) {
        console.log('Token error (using local notifications):', tokenError);
        setExpoPushToken('local_only');
      }

    } catch (error) {
      console.error('Error registering for notifications:', error);
      setNotificationPermission('error');
    }
  };

  // ✅ FIXED: Enhanced notification function with proper trigger format
  const sendTicketPurchaseNotification = async (ticketDetails : any) => {
    try {
      // Only proceed if we have notification permission
      if (notificationPermission !== 'granted') {
        console.log('No notification permission, skipping notifications');
        return;
      }

      // Trigger haptic feedback
      try {
        if (Platform.OS === 'ios' && Haptics?.notificationAsync) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (Platform.OS === 'android' && Haptics?.impactAsync) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (hapticError) {
        console.log('Haptic feedback not available:', hapticError);
      }
      
      // Send immediate confirmation notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎫 ¡Ticket Confirmed!',
          body: `Your ticket for FC Barcelona vs ${ticketDetails.opponent} is confirmed! ¡Visça Barça!`,
          data: { 
            type: 'ticket_purchase',
            opponent: ticketDetails.opponent,
            section: ticketDetails.section,
            date: ticketDetails.date,
            tickets: ticketDetails.tickets
          },
          sound: 'default',
        },
        trigger: null, // Send immediately
      });

      // ✅ FIXED: Schedule match reminder (2 hours before) with proper trigger format
      const matchDateTime = new Date(ticketDetails.date);
      matchDateTime.setHours(15, 0, 0, 0); // 3 PM match time
      const reminderDate = new Date(matchDateTime.getTime() - (2 * 60 * 60 * 1000));
      
      if (reminderDate > new Date()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚽ Match Starting Soon!',
            body: `FC Barcelona vs ${ticketDetails.opponent} starts in 2 hours! Get ready, culé!`,
            data: { 
              type: 'match_reminder',
              opponent: ticketDetails.opponent 
            },
            sound: 'default',
          },
          // ✅ FIXED: Use proper trigger format with type
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
          },
        });
      }

      console.log('Notifications scheduled successfully');
    } catch (error) {
      console.error('Error sending notifications:', error);
      // Don't throw error - let the purchase continue even if notifications fail
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    if (!age.trim() || parseInt(age) < 1 || parseInt(age) > 120) {
      Alert.alert('Validation Error', 'Please enter a valid age');
      return false;
    }
    if (!tickets.trim() || parseInt(tickets) <= 0 || parseInt(tickets) > 10) {
      Alert.alert('Validation Error', 'Please enter a valid number of tickets (1-10)');
      return false;
    }
    return true;
  };

  const handleBuyTicket = async () => {
    if (!validateForm()) return;
    
    const ticketPrice = seat === 'Lower' ? 120 : seat === 'Middle' ? 80 : 50;
    const snackPrice = snacks ? 25 : 0;
    const totalPrice = (ticketPrice + snackPrice) * parseInt(tickets);

    const ticketDetails = {
      name,
      email,
      opponent,
      age,
      tickets: parseInt(tickets),
      section: seat,
      snacks,
      date: date.toISOString(),
      totalPrice,
      purchaseId: `BT${Date.now()}`,
      purchaseTime: new Date().toISOString()
    };

    try {
      // Send notifications (non-blocking)
      await sendTicketPurchaseNotification(ticketDetails);

      // Show success alert
      Alert.alert(
        '🎫 TICKET CONFIRMATION',
        `🔵🔴 FC BARCELONA vs ${opponent.toUpperCase()}\n\n` +
        `👤 ${name}\n` +
        `📧 ${email}\n` +
        `🎂 Age: ${age}\n` +
        `🎫 ${tickets} ticket(s) - ${seat} Section\n` +
        `🍿 Snacks: ${snacks ? "Included" : "Not included"}\n` +
        `📅 ${date.toDateString()}\n\n` +
        `💰 Total: €${totalPrice}\n` +
        `🆔 Purchase ID: ${ticketDetails.purchaseId}\n\n` +
        `${notificationPermission === 'granted' ? '✅ Notifications sent!' : '📱 Enable notifications for updates'}\n` +
        `¡Visça el Barça!`,
        [
          {
            text: '🎉 ¡Perfecte!',
            onPress: () => {
              console.log('Ticket purchased successfully!', ticketDetails);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in ticket purchase:', error);
      Alert.alert('Purchase Error', 'There was an issue processing your ticket. Please try again.');
    }
  };

  // ✅ FIXED: Test notification function with proper trigger format
  // const sendTestNotification = async () => {
  //   if (notificationPermission !== 'granted') {
  //     Alert.alert(
  //       'Notifications Disabled', 
  //       'Please enable notifications in your device settings to receive match updates.'
  //     );
  //     return;
  //   }

  //   try {
  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: '🧪 Test Notification',
  //         body: 'This is a test from your Barça app! Put the app in background to see it.',
  //         data: { type: 'test' },
  //         sound: 'default',
  //       },
  //       // ✅ FIXED: Use proper trigger format
  //       trigger: {
  //         type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
  //         seconds: 3,
  //       },
  //     });
      
  //     try {
  //       if (Haptics?.impactAsync) {
  //         await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  //       }
  //     } catch (hapticError) {
  //       console.log('Haptic not available');
  //     }
      
  //     Alert.alert('Test Scheduled', 'Notification will appear in 3 seconds! Put app in background to see it.');
  //   } catch (error : any) {
  //     console.error('Error sending test notification:', error);
  //     Alert.alert('Test Failed', 'Could not send test notification: ' + error.message);
  //   }
  // };

  const handleHome = () => {
    if (navigation?.navigate) {
      navigation.navigate('MainTabs', { screen: 'Dashboard' });
    }
  };

  const handleGoBack = () => {
    if (navigation?.goBack) {
      navigation.goBack();
    }
  };

  const getNotificationStatusText = () => {
    if (notificationPermission === 'granted') {
      return '📱 Notifications Ready';
    } else if (notificationPermission === 'denied') {
      return '📱 Notifications Disabled';
    } else if (notificationPermission === 'device_not_supported') {
      return '📱 Simulator Mode';
    } else {
      return '📱 Checking Notifications...';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#004d98" />
      
      {/* Header with proper positioning */}
      <LinearGradient
        colors={['#004d98', '#a50044']}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>FC BARCELONA</Text>
            <Text style={styles.headerSubtitle}>Official Ticket Booking</Text>
          </View>

          {/* {__DEV__ && (
            <TouchableOpacity 
              style={styles.testButton} 
              onPress={sendTestNotification}
            >
              <Text style={styles.testButtonText}>🧪</Text>
            </TouchableOpacity>
          )} */}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          {/* Match Info Card */}
          <View style={styles.matchCard}>
            <LinearGradient
              colors={['#004d98', '#0066cc']}
              style={styles.matchGradient}
            >
              <Text style={styles.matchTitle}>CAMP NOU</Text>
              <Text style={styles.matchVs}>FC Barcelona vs {opponent}</Text>
              <Text style={styles.matchDate}>{date.toDateString()}</Text>
              <Text style={styles.notificationStatus}>
                {getNotificationStatusText()}
              </Text>
            </LinearGradient>
          </View>

          {/* Rest of your form components - keeping them exactly the same */}
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Age *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  placeholderTextColor="#999"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={gender}
                    style={styles.picker}
                    onValueChange={(itemValue) => setGender(itemValue)}
                  >
                    <Picker.Item label="Male" value="Male" />
                    <Picker.Item label="Female" value="Female" />
                    <Picker.Item label="Other" value="Other" />
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {/* Match Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Opponent Team</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={opponent}
                  style={styles.picker}
                  onValueChange={(itemValue) => setOpponent(itemValue)}
                >
                  <Picker.Item label="Real Madrid" value="Real Madrid" />
                  <Picker.Item label="Atlético Madrid" value="Atlético Madrid" />
                  <Picker.Item label="Athletic Club" value="Athletic Club" />
                  <Picker.Item label="Real Sociedad" value="Real Sociedad" />
                  <Picker.Item label="Sevilla" value="Sevilla" />
                  <Picker.Item label="Valencia" value="Valencia" />
                  <Picker.Item label="Villarreal" value="Villarreal" />
                  <Picker.Item label="Real Betis" value="Real Betis" />
                  <Picker.Item label="Celta Vigo" value="Celta Vigo" />
                  <Picker.Item label="Getafe" value="Getafe" />
                  <Picker.Item label="Espanyol" value="Espanyol" />
                  <Picker.Item label="Girona" value="Girona" />
                  <Picker.Item label="Mallorca" value="Mallorca" />
                  <Picker.Item label="Osasuna" value="Osasuna" />
                  <Picker.Item label="Rayo Vallecano" value="Rayo Vallecano" />
                  <Picker.Item label="Alavés" value="Alavés" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Match Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDate(true)}
              >
                <Text style={styles.dateButtonText}>{date.toDateString()}</Text>
              </TouchableOpacity>
              {showDate && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDate(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </View>
          </View>

          {/* Ticket Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ticket Options</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Number of Tickets *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor="#999"
                  value={tickets}
                  onChangeText={setTickets}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>

              <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Seat Section</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={seat}
                    style={styles.picker}
                    onValueChange={(itemValue) => setSeat(itemValue)}
                  >
                    <Picker.Item label="Upper - €50" value="Upper" />
                    <Picker.Item label="Middle - €80" value="Middle" />
                    <Picker.Item label="Lower - €120" value="Lower" />
                  </Picker>
                </View>
              </View>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchTextContainer}>
                <Text style={styles.inputLabel}>Stadium Snacks Package</Text>
                <Text style={styles.switchSubtext}>Includes drinks & traditional Catalan snacks (+€25)</Text>
              </View>
              <Switch 
                value={snacks} 
                onValueChange={setSnacks}
                trackColor={{ false: "#767577", true: "#a50044" }}
                thumbColor={snacks ? "#004d98" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Price Summary */}
          <View style={styles.priceCard}>
            <Text style={styles.priceTitle}>Price Summary</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tickets ({tickets || '0'}x {seat})</Text>
              <Text style={styles.priceValue}>
                €{((seat === 'Lower' ? 120 : seat === 'Middle' ? 80 : 50) * parseInt(tickets || '0')).toFixed(2)}
              </Text>
            </View>
            {snacks && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Snacks Package</Text>
                <Text style={styles.priceValue}>€{(25 * parseInt(tickets || '0')).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.priceDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                €{(((seat === 'Lower' ? 120 : seat === 'Middle' ? 80 : 50) + (snacks ? 25 : 0)) * parseInt(tickets || '0')).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuyTicket}>
              <LinearGradient
                colors={['#a50044', '#cc0055']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buyButtonText}>🎫 PURCHASE TICKETS</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.homeButton} onPress={handleHome}>
              <Text style={styles.homeButtonText}>🏠 Go to Dashboard</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Official FC Barcelona Ticketing</Text>
            <Text style={styles.footerSubtext}>Més que un club</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Keep all your existing styles - they're perfect
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 50,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    marginTop: 2,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  matchCard: {
    margin: 20,
    marginTop: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  matchGradient: {
    padding: 25,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  matchVs: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  matchDate: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  notificationStatus: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d98',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#a50044',
    paddingBottom: 5,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
    minHeight: 50,
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 60,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  switchSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    lineHeight: 16,
  },
  dateButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  priceCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 15,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#a50044',
  },
  priceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004d98',
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004d98',
    flex: 1,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a50044',
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  buyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  homeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#004d98',
    borderRadius: 12,
  },
  homeButtonText: {
    fontSize: 16,
    color: '#004d98',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004d98',
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#a50044',
    fontStyle: 'italic',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default TicketScreen;
