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
  Dimensions
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Responsive breakpoints
const isTablet = width > 768;
const isLargeScreen = width > 1024;

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Dashboard: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const Login = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Enhanced Barcelona theme
  const theme = {
    primary: '#A50044',
    secondary: '#004D98',
    tertiary: '#FFED02',
    gold: '#FFD700',
    darkBlue: '#0B1F48',
    lightBlue: '#1976D2',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceElevated: '#F8F9FA',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gradient: {
      primary: ['#A50044', '#7A0033', '#004D98'],
      secondary: ['#FFED02', '#FFD700', '#FDB913'],
      surface: ['#FFFFFF', '#F8F9FA'],
      input: ['#F8F9FA', '#FFFFFF'],
      button: ['#FFD700', '#FFED02', '#FDB913'],
    }
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Authentication Required', 'Please enter both email and password to continue.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call with realistic delay
    setTimeout(() => {
      setIsLoading(false);
      
      if (email === 'test@example.com' && password === 'password123') {
        navigation.replace('Main');
      } else {
        Alert.alert(
          'Authentication Failed', 
          'Invalid credentials. Please check your email and password.',
          [{ text: 'Try Again', style: 'default' }]
        );
      }
    }, 1500); 
  };

  const fillDemoCredentials = () => {
    setEmail('test@example.com');
    setPassword('password123');
  };

  const socialProviders = [
    { name: 'Google', icon: '🌐', color: '#4285F4' },
    { name: 'Facebook', icon: '📘', color: '#1877F2' },
    { name: 'Apple', icon: '🍎', color: '#000000' },
  ];

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
      justifyContent: 'center',
      paddingVertical: 20,
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: isTablet ? 60 : 30,
      paddingVertical: isTablet ? 60 : 40,
      marginBottom: 20,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    logo: {
      width: isTablet ? 120 : 100,
      height: isTablet ? 120 : 100,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    brandContainer: {
      alignItems: 'center',
    },
    brandText: {
      fontSize: isTablet ? 32 : 28,
      fontWeight: '800',
      color: theme.gold,
      marginBottom: 8,
      letterSpacing: 1,
      textAlign: 'center',
    },
    brandSubtext: {
      fontSize: isTablet ? 18 : 16,
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '500',
      textAlign: 'center',
    },
    tagline: {
      fontSize: isTablet ? 16 : 14,
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
    formContainer: {
      marginHorizontal: isTablet ? 60 : 20,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
      overflow: 'hidden',
    },
    formInner: {
      paddingHorizontal: isTablet ? 40 : 24,
      paddingVertical: isTablet ? 40 : 30,
    },
    formTitle: {
      fontSize: isTablet ? 28 : 24,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    formSubtitle: {
      fontSize: isTablet ? 16 : 14,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 32,
      lineHeight: 20,
    },
    inputGroup: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    inputWrapper: {
      position: 'relative',
    },
    input: {
      height: isTablet ? 56 : 52,
      borderWidth: 2,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingRight: 50,
      fontSize: isTablet ? 16 : 15,
      color: theme.text,
      fontWeight: '500',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    inputFocused: {
      borderColor: theme.primary,
      shadowColor: theme.primary,
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    inputIcon: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: [{ translateY: -10 }],
    },
    inputIconText: {
      fontSize: 20,
      color: theme.textMuted,
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
      color: theme.textMuted,
    },
    optionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    rememberMeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.border,
      marginRight: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    checkboxText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    rememberMeText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    forgotPasswordButton: {
      padding: 4,
    },
    forgotPasswordText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    loginButton: {
      height: isTablet ? 56 : 52,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 24,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    loginButtonInner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    loginButtonDisabled: {
      opacity: 0.6,
    },
    loginButtonText: {
      color: theme.text,
      fontSize: isTablet ? 18 : 16,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginLeft: 8,
    },
    loadingIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    demoContainer: {
      borderRadius: 16,
      padding: isTablet ? 24 : 20,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: 'rgba(0, 77, 152, 0.2)',
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    demoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    demoIcon: {
      fontSize: 20,
      marginRight: 8,
    },
    demoTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.secondary,
      letterSpacing: 0.3,
    },
    demoCredentials: {
      marginBottom: 16,
    },
    demoText: {
      fontSize: 13,
      color: theme.textSecondary,
      marginBottom: 4,
      fontFamily: 'monospace',
      fontWeight: '500',
    },
    quickFillButton: {
      backgroundColor: theme.secondary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignSelf: 'flex-start',
      shadowColor: theme.secondary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    quickFillText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: theme.textMuted,
      fontWeight: '500',
    },
    socialContainer: {
      marginBottom: 24,
    },
    socialButtons: {
      gap: 12,
    },
    socialButton: {
      height: isTablet ? 52 : 48,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    socialButtonIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    socialButtonText: {
      fontSize: isTablet ? 16 : 14,
      fontWeight: '600',
      color: theme.text,
      letterSpacing: 0.3,
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    signupText: {
      color: theme.textSecondary,
      fontSize: 14,
      fontWeight: '500',
    },
    signupLink: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    footer: {
      paddingHorizontal: isTablet ? 60 : 30,
      paddingVertical: 24,
      alignItems: 'center',
    },
    footerContent: {
      alignItems: 'center',
      marginBottom: 16,
    },
    footerText: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.7)',
      textAlign: 'center',
      lineHeight: 18,
      fontWeight: '400',
    },
    securityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 8,
    },
    securityIcon: {
      fontSize: 14,
      marginRight: 6,
    },
    securityText: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
    },
    floatingElements: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
    },
    floatingCircle1: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: 'rgba(255, 237, 2, 0.1)',
      top: '15%',
      right: '10%',
    },
    floatingCircle2: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      bottom: '20%',
      left: '8%',
    },
    errorContainer: {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.3)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    errorIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    errorText: {
      flex: 1,
      fontSize: 14,
      color: theme.error,
      fontWeight: '500',
    },
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <LinearGradient
        colors={["#A50044", "#7A0033", "#004D98"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      >
        {/* Floating Background Elements */}
        <View style={styles.floatingElements}>
          <View style={styles.floatingCircle1} />
          <View style={styles.floatingCircle2} />
        </View>

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
              {/* Enhanced Header */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image 
                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' }}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                
                <View style={styles.brandContainer}>
                  <Text style={styles.brandText}>FC Barcelona</Text>
                  <Text style={styles.brandSubtext}>Welcome to Camp Nou</Text>
                  <Text style={styles.tagline}>Més que un club</Text>
                </View>
              </View>

              {/* Enhanced Login Form */}
              <LinearGradient
                colors={["#FFFFFF", "#F8F9FA"]}
                style={styles.formContainer}
              >
                <View style={styles.formInner}>
                  <Text style={styles.formTitle}>Sign In</Text>
                  <Text style={styles.formSubtitle}>
                    Access your Barcelona experience and join millions of Culés worldwide
                  </Text>

                  {/* Email Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputWrapper}>
                      <LinearGradient
                        colors={["#F8F9FA", "#FFFFFF"]}
                        style={styles.input}
                      >
                        <TextInput
                          style={{ 
                            flex: 1, 
                            fontSize: isTablet ? 16 : 15,
                            color: theme.text,
                            fontWeight: '500'
                          }}
                          placeholder="Enter your email address"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          placeholderTextColor={theme.textMuted}
                        />
                      </LinearGradient>
                      <View style={styles.inputIcon}>
                        <Text style={styles.inputIconText}>📧</Text>
                      </View>
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <LinearGradient
                        colors={["#F8F9FA", "#FFFFFF"]}
                        style={styles.input}
                      >
                        <TextInput
                          style={{ 
                            flex: 1, 
                            fontSize: isTablet ? 16 : 15,
                            color: theme.text,
                            fontWeight: '500'
                          }}
                          placeholder="Enter your password"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoComplete="password"
                          placeholderTextColor={theme.textMuted}
                        />
                      </LinearGradient>
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

                  {/* Options Row */}
                  <View style={styles.optionsRow}>
                    <TouchableOpacity 
                      style={styles.rememberMeContainer}
                      onPress={() => setRememberMe(!rememberMe)}
                    >
                      <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                        {rememberMe && <Text style={styles.checkboxText}>✓</Text>}
                      </View>
                      <Text style={styles.rememberMeText}>Remember me</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.forgotPasswordButton}>
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Enhanced Login Button */}
                  <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={["#FFD700", "#FFED02", "#FDB913"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.loginButtonInner, isLoading && styles.loginButtonDisabled]}
                    >
                      {isLoading && <Text style={styles.loadingIcon}>⏳</Text>}
                      <Text style={styles.loginButtonText}>
                        {isLoading ? 'Signing In...' : 'Sign In to Barcelona'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Enhanced Demo Credentials */}
                  <LinearGradient
                    colors={['rgba(0, 77, 152, 0.05)', 'rgba(0, 77, 152, 0.1)']}
                    style={styles.demoContainer}
                  >
                    <View style={styles.demoHeader}>
                      <Text style={styles.demoIcon}>🚀</Text>
                      <Text style={styles.demoTitle}>Quick Demo Access</Text>
                    </View>
                    <View style={styles.demoCredentials}>
                      <Text style={styles.demoText}>📧 test@example.com</Text>
                      <Text style={styles.demoText}>🔐 password123</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.quickFillButton}
                      onPress={fillDemoCredentials}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.quickFillText}>Auto-Fill Credentials</Text>
                    </TouchableOpacity>
                  </LinearGradient>

                  {/* Divider */}
                  <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Enhanced Social Login */}
                  <View style={styles.socialContainer}>
                    <View style={styles.socialButtons}>
                      {socialProviders.map((provider, index) => (
                        <TouchableOpacity 
                          key={index}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={["#FFFFFF", "#F8F9FA"]}
                            style={styles.socialButton}
                          >
                            <Text style={styles.socialButtonIcon}>{provider.icon}</Text>
                            <Text style={styles.socialButtonText}>
                              Continue with {provider.name}
                            </Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Sign Up Link */}
                  <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>New to Barcelona? </Text>
                    <TouchableOpacity>
                      <Text style={styles.signupLink}>Create Account</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>

              {/* Enhanced Footer */}
              <View style={styles.footer}>
                <View style={styles.footerContent}>
                  <Text style={styles.footerText}>
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                    {'\n'}Your data is protected with enterprise-grade security.
                  </Text>
                  <View style={styles.securityBadge}>
                    <Text style={styles.securityIcon}>🔒</Text>
                    <Text style={styles.securityText}>SSL Secured</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
};

export default Login;