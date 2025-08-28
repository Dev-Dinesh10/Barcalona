import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  Animated, 
  Dimensions,
  StatusBar 
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onLoad }: { onLoad: () => void }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequential animations for a premium feel
    const startAnimations = () => {
      // Logo scale and fade in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous logo pulse animation
      const pulseLoop = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => pulseLoop());
      };
      setTimeout(pulseLoop, 500);

      // Progress bar animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: false,
      }).start();

      // Rotate animation for decorative elements
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();
    };

    startAnimations();

    // Simulate loading delay, then call onLoad
    const timer = setTimeout(onLoad, 2500);
    return () => clearTimeout(timer);
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.7],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1a0028" />
      <View style={styles.container}>
        {/* Background Gradient Effect */}
        <View style={styles.backgroundGradient} />
        
        {/* Floating Decorative Elements */}
        <Animated.View 
          style={[
            styles.decorativeCircle1,
            { transform: [{ rotate: rotateInterpolate }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle2,
            { transform: [{ rotate: rotateInterpolate }] }
          ]} 
        />
        <Animated.View 
          style={[
            styles.decorativeCircle3,
            { transform: [{ rotate: rotateInterpolate }] }
          ]} 
        />

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Logo Container with Glow Effect */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: Animated.multiply(scaleAnim, pulseAnim) },
                  { translateY: slideAnim }
                ]
              }
            ]}
          >
            <View style={styles.logoGlow} />
            <Image
              source={{ 
                uri: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' 
              }}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* App Title with Subtitle */}
          <Animated.View 
            style={[
              styles.titleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.appTitle}>FC BARCELONA</Text>
            <Text style={styles.subtitle}>Official Squad Manager</Text>
            <View style={styles.titleUnderline} />
          </Animated.View>

          {/* Premium Features List */}
          <Animated.View 
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.featureItem}>⚽ Player Statistics</Text>
            <Text style={styles.featureItem}>🏆 Trophy Gallery</Text>
            <Text style={styles.featureItem}>📊 Performance Analytics</Text>
          </Animated.View>

          {/* Progress Bar */}
          <Animated.View 
            style={[
              styles.progressContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: progressWidth }
                ]}
              />
            </View>
            <Text style={styles.loadingText}>Preparing your experience...</Text>
          </Animated.View>

          {/* Loading Indicator */}
          <Animated.View 
            style={[
              styles.loadingContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <ActivityIndicator size="large" color="#FFD700" />
          </Animated.View>
        </View>

        {/* Bottom Branding */}
        <Animated.View 
          style={[
            styles.bottomBranding,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.brandingText}>Powered by Barcelona Digital</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a0028',
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // background : 'radial-gradient(circle at 30% 20%, rgba(165, 0, 68, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0, 77, 152, 0.2) 0%, transparent 50%)',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: height * 0.1,
    right: width * 0.1,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.2)',
    backgroundColor: 'rgba(165, 0, 68, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: height * 0.2,
    left: width * 0.05,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 77, 152, 0.3)',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.15,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: 'rgba(165, 0, 68, 0.05)',
  },
  mainContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    width: 140,
    height: 140,
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 3,
    textShadowColor: 'rgba(165, 0, 68, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
    letterSpacing: 1,
    textAlign: 'center',
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#FFD700',
    marginTop: 10,
    borderRadius: 2,
  },
  featuresContainer: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featureItem: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 25,
    width: '100%',
  },
  progressBarBackground: {
    width: width * 0.7,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    marginTop: 10,
  },
  bottomBranding: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  brandingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 5,
  },
  versionText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '300',
  },
});

export default SplashScreen;