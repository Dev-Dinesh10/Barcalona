import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const isTablet = width > 768;

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const Register = ({ navigation }: Props) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Barcelona theme colors
  const theme = {
    primary: '#A50044',
    secondary: '#004D98', 
    gold: '#FFD700',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    error: '#EF4444',
  };

  const validateForm = () => {
    // Basic validation
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Last name is required'); 
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    // Terms agreement
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please accept the Terms of Service');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call to create account
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success! Account created
      setIsLoading(false);
      
      Alert.alert(
        'Account Created! 🎉',
        `Welcome to Barcelona, ${formData.firstName}!\n\nYour account has been successfully created. You can now sign in with your credentials.`,
        [
          {
            text: 'Sign In Now',
            onPress: () => {
              // Navigate to Login screen and pass the email for convenience
              navigation.replace('Login');
            }
          }
        ]
      );
      
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <LinearGradient
        colors={["#A50044", "#7A0033", "#004D98"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              contentContainerStyle={styles.scrollContainer} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.header}>
                <Image 
                  source={{ uri: 'https://logos-world.net/wp-content/uploads/2020/06/Barcelona-Logo.png' }}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.brandText}>Join FC Barcelona</Text>
                <Text style={styles.brandSubtext}>Become part of the Culé family</Text>
              </View>

              {/* Registration Form */}
              <LinearGradient
                colors={["#FFFFFF", "#F8F9FA"]}
                style={styles.formContainer}
              >
                <View style={styles.formInner}>
                  <Text style={styles.formTitle}>Create Your Account</Text>
                  <Text style={styles.formSubtitle}>
                    Join millions of Barcelona fans worldwide
                  </Text>

                  {/* Name Fields */}
                  <View style={styles.inputRow}>
                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>First Name *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Your first name"
                        value={formData.firstName}
                        onChangeText={(value) => updateField('firstName', value)}
                        autoCapitalize="words"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>

                    <View style={styles.inputGroupHalf}>
                      <Text style={styles.inputLabel}>Last Name *</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Your last name"
                        value={formData.lastName}
                        onChangeText={(value) => updateField('lastName', value)}
                        autoCapitalize="words"
                        placeholderTextColor={theme.textMuted}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChangeText={(value) => updateField('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>

                  {/* Phone (Optional) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChangeText={(value) => updateField('phone', value)}
                      keyboardType="phone-pad"
                      placeholderTextColor={theme.textMuted}
                    />
                  </View>

                  {/* Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password *</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Create a password"
                        value={formData.password}
                        onChangeText={(value) => updateField('password', value)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        placeholderTextColor={theme.textMuted}
                      />
                      <TouchableOpacity 
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Text style={styles.passwordToggleText}>
                          {showPassword ? '🙈' : '👁️'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm Password *</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChangeText={(value) => updateField('confirmPassword', value)}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        placeholderTextColor={theme.textMuted}
                      />
                      <TouchableOpacity 
                        style={styles.passwordToggle}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Text style={styles.passwordToggleText}>
                          {showConfirmPassword ? '🙈' : '👁️'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Terms Agreement */}
                  <TouchableOpacity 
                    style={styles.checkboxContainer}
                    onPress={() => setAgreeToTerms(!agreeToTerms)}
                  >
                    <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                      {agreeToTerms && <Text style={styles.checkboxText}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      I agree to the Terms of Service and Privacy Policy
                    </Text>
                  </TouchableOpacity>

                  {/* Register Button */}
                  <TouchableOpacity 
                    style={[styles.registerButton, isLoading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#FFD700", "#FFED02", "#FDB913"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.registerButtonInner}
                    >
                      {isLoading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color={theme.text} />
                          <Text style={styles.registerButtonText}>Creating Account...</Text>
                        </View>
                      ) : (
                        <Text style={styles.registerButtonText}>Join Barcelona Family</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Login Link */}
                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Welcome to the Barcelona family! 🔴🔵⚽
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
    marginBottom: 20,
  },
  logo: {
    width: isTablet ? 100 : 80,
    height: isTablet ? 100 : 80,
    marginBottom: 20,
  },
  brandText: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 5,
    letterSpacing: 1,
    textAlign: 'center',
  },
  brandSubtext: {
    fontSize: isTablet ? 16 : 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    marginHorizontal: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    overflow: 'hidden',
  },
  formInner: {
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  formTitle: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  input: {
    height: 52,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 52,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordToggleText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#A50044',
    borderColor: '#A50044',
  },
  checkboxText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  registerButton: {
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#A50044',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  registerButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    color: '#A50044',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Register;
