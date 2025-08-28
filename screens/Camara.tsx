import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Animated,
  Platform,
  BackHandler,
  Vibration,
  Linking,
  Modal,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Video } from "expo-av";
import { Audio } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import * as Sharing from "expo-sharing";

const { width, height } = Dimensions.get("window");

interface Memory {
  id: string;
  uri: string;
  caption: string;
  date: string;
  matchInfo: string;
  type: 'photo' | 'video';
  duration?: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  };
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string; 
  region?: string;
  postalCode?: string;
}

interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  gradient: string[];
  platform: string | null;
}

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions();
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const cameraRef = useRef<CameraView | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [caption, setCaption] = useState("");
  const [matchInfo, setMatchInfo] = useState("");
  const [currentView, setCurrentView] = useState<"camera" | "memories">("camera");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasShownCameraReadyAlert, setHasShownCameraReadyAlert] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Video/Photo mode and recording
  const [captureMode, setCaptureMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [audioPermission, setAudioPermission] = useState<boolean>(false);
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shareModalAnim = useRef(new Animated.Value(0)).current;
  const shareModalScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle back button on Android
    const backAction = () => {
      if (showShareModal) {
        closeShareModal();
        return true;
      }
      if (photo || videoUri) {
        setPhoto(null);
        setVideoUri(null);
        setCurrentLocation(null);
        return true;
      }
      return false;
    };

    // Check audio permission
    const checkAudioPermission = async () => {
      const { status } = await Audio.getPermissionsAsync();
      setAudioPermission(status === 'granted');
    };
    
    checkAudioPermission();

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    requestLocationPermissions();

    return () => {
      backHandler.remove();
    };
  }, [fadeAnim, scaleAnim, photo, videoUri, showShareModal]);

  // Share Modal Animation
  const openShareModal = () => {
    setShowShareModal(true);
    Animated.parallel([
      Animated.timing(shareModalAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(shareModalScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeShareModal = () => {
    Animated.parallel([
      Animated.timing(shareModalAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(shareModalScale, {
        toValue: 0.8,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowShareModal(false);
      shareModalAnim.setValue(0);
      shareModalScale.setValue(0.8);
    });
  };

  // Toggle between photo and video mode
  const toggleCaptureMode = async () => {
    await triggerHapticFeedback("light");
    setCaptureMode(mode => mode === 'photo' ? 'video' : 'photo');
  };

  // Start video recording
  const startVideoRecording = async () => {
    if (!cameraRef.current || !isCameraReady || isRecording) return;
    
    // Check audio permission before recording
    if (!audioPermission) {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Audio Permission Required", 
          "Please enable microphone permission to record videos with sound.",
          [{ text: "OK" }]
        );
        return;
      }
      setAudioPermission(true);
    }

    setIsRecording(true);
    setRecordingDuration(0);

    // Timer
    recordingTimer.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);

    try {
      const video = await cameraRef.current.recordAsync({
        quality: '720p',
        maxDuration: 60,
        mute: false,
        videoBitrate: 5000000,
      });
      
      if (video?.uri) {
        setVideoUri(video.uri);
        const locationData = await getCurrentLocation();
        setCurrentLocation(locationData);
        if (mediaLibraryPermission?.granted) {
          await MediaLibrary.createAssetAsync(video.uri);
        }
        setTimeout(() => {
          Alert.alert("Perfect Video!", "Your Barça video memory is captured!");
        }, 100);
      }
    } catch (e) {
      console.error("Video recording error:", e);
      Alert.alert("Recording Error", "Failed to record video. Please try again.");
    } finally {
      setIsRecording(false);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
    }
  };

  // Stop video recording
  const stopVideoRecording = async () => {
    if (!cameraRef.current || !isRecording) return;
    
    // Ensure minimum recording duration (1 second)
    if (recordingDuration < 1) {
      Alert.alert("Recording Too Short", "Please record for at least 1 second.");
      return;
    }
    
    try {
      await cameraRef.current.stopRecording();
    } catch (e) {
      console.error("Stop recording error:", e);
    }
  };

  // Format timer
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const requestLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Location access is needed to add location information to your Barça memories. You can still use the camera without location services.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("Location permission error:", error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      await triggerHapticFeedback("light");

      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        Alert.alert(
          "Location Services Disabled",
          "Please enable location services in your device settings to add location to your memories.",
          [{ text: "OK" }]
        );
        return null;
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        const permissionResult = await Location.requestForegroundPermissionsAsync();
        if (permissionResult.status !== "granted") {
          Alert.alert(
            "Location Permission Denied",
            "Location permission is needed to add location information to your memories.",
            [{ text: "OK" }]
          );
          return null;
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      try {
        const addressInfo = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (addressInfo && addressInfo.length > 0) {
          const address = addressInfo[0];
          return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            address: `${address.street || ""} ${address.streetNumber || ""}`.trim(),
            city: address.city || address.district || address.subregion,
            country: address.country,
            region: address.region,
            postalCode: address.postalCode,
          };
        }
      } catch (reverseGeocodeError) {
        console.log("Reverse geocoding failed:", reverseGeocodeError);
        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      }

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error: any) {
      console.log("Location error:", error);
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please check your location settings and try again.",
        [{ text: "OK" }]
      );
      return null;
    } finally {
      setIsGettingLocation(false);
    }
  };

  const formatLocationString = (location: any) => {
    if (!location) return "Location unavailable";

    const parts = [];
    if (location.address && location.address.trim()) parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);

    if (parts.length === 0) {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }

    return parts.join(", ");
  };

  const getLocationDisplayName = (location: any) => {
    if (!location) return "Unknown Location";

    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    } else if (location.city) {
      return `${location.city}`;
    } else if (location.country) {
      return `${location.country}`;
    } else {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    }
  };

  const triggerHapticFeedback = async (
    type: "light" | "medium" | "heavy" | "success" | "error" = "medium"
  ) => {
    try {
      switch (type) {
        case "light":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "medium":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "heavy":
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case "success":
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case "error":
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log("Haptic feedback not available:", error);
      if (Platform.OS === "android") {
        Vibration.vibrate(type === "heavy" ? 200 : type === "success" ? [100, 50, 100] : 100);
      }
    }
  };

  const requestPermissions = async () => {
    try {
      await triggerHapticFeedback("light");

      const cameraResult = await requestCameraPermission();
      const mediaResult = await requestMediaLibraryPermission();
      const audioResult = await Audio.requestPermissionsAsync();

      if (!cameraResult?.granted) {
        await triggerHapticFeedback("error");
        Alert.alert(
          "Camera Permission Required",
          "Please go to Settings and enable camera permission for this app to capture photos and videos.",
          [{ text: "OK" }]
        );
      } else {
        await triggerHapticFeedback("success");
      }

      if (!mediaResult?.granted) {
        Alert.alert(
          "Media Library Permission",
          "Media library permission is needed to save photos and videos to your gallery.",
          [{ text: "OK" }]
        );
      }

      if (!audioResult?.granted) {
        Alert.alert(
          "Audio Permission Required",
          "Audio permission is needed to record videos with sound.",
          [{ text: "OK" }]
        );
      } else {
        setAudioPermission(true);
      }

    } catch (error) {
      console.error("Error requesting permissions:", error);
      await triggerHapticFeedback("error");
      Alert.alert("Error", "Failed to request permissions. Please restart the app.");
    }
  };

  const onCameraReady = async () => {
    console.log("Camera is ready");
    setIsCameraReady(true);
    await triggerHapticFeedback("success");

    if (!hasShownCameraReadyAlert) {
      setTimeout(() => {
        Alert.alert("Camera Ready", "Camera is now ready to capture photos and videos with location!");
        setHasShownCameraReadyAlert(true);
      }, 500);
    }
  };

  // Updated takePicture function to handle both photo and video
  const takePicture = async () => {
    if (captureMode === 'video') {
      return isRecording ? await stopVideoRecording() : await startVideoRecording();
    }

    if (!cameraRef.current || !isCameraReady || isCapturing) {
      console.log("Camera not ready or already capturing");
      await triggerHapticFeedback("error");
      return;
    }

    try {
      setIsCapturing(true);
      console.log("Taking picture...");
      await triggerHapticFeedback("heavy");

      if (Platform.OS === "android") {
        Vibration.vibrate([0, 100, 50, 100]);
      } else {
        setTimeout(async () => {
          await triggerHapticFeedback("light");
        }, 100);
      }

      const locationPromise = getCurrentLocation();

      const data = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        exif: false,
      });

      if (data && data.uri ) {
        console.log("Picture taken successfully:", data.uri);
        setPhoto(data.uri);

        const locationData = await locationPromise;
        setCurrentLocation(locationData);
        await triggerHapticFeedback("success");

        if (mediaLibraryPermission?.granted) {
          try {
            const asset = await MediaLibrary.createAssetAsync(data.uri);
            console.log("Photo saved to gallery:", asset.uri);
          } catch (saveError) {
            console.log("Failed to save to gallery:", saveError);
          }
        }

        setTimeout(() => {
          const locationText = locationData ? ` at ${locationData.city || "your location"}` : "";
          Alert.alert("Perfect Shot!", `Your Barça memory is captured${locationText}!`);
        }, 100);
      } else {
        throw new Error("No photo data received");
      }
    } catch (error: any) {
      console.error("Error taking picture:", error);
      await triggerHapticFeedback("error");
      Alert.alert(
        "Camera Error",
        `Failed to capture photo: ${error.message || "Unknown error"}. Please try again.`
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const toggleCameraType = async () => {
    await triggerHapticFeedback("light");
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const toggleFlash = async () => {
    await triggerHapticFeedback("light");
    setFlashMode((current) => (current === "off" ? "on" : "off"));
  };

  // Updated saveMemory function
  const saveMemory = async () => {
    const mediaUri = photo || videoUri;
    if (!mediaUri) return;

    await triggerHapticFeedback("success");

    const isPhoto = !!photo;
    const newMemory: Memory = {
      id: Date.now().toString(),
      uri: mediaUri,
      caption: caption || "Visça Barça! Amazing moment!",
      date: new Date().toLocaleDateString(),
      matchInfo: matchInfo || "FC Barcelona Match",
      type: isPhoto ? 'photo' : 'video',
      duration: !isPhoto ? recordingDuration : undefined,
      location: currentLocation || undefined,
    };

    setMemories(prev => [newMemory, ...prev]);
    setPhoto(null);
    setVideoUri(null);
    setCurrentLocation(null);
    setCaption("");
    setMatchInfo("");
    setRecordingDuration(0);

    Alert.alert("Perfecte!", `Your Barça ${isPhoto ? 'photo' : 'video'} memory has been saved!`);
  };

  // Enhanced Share Function
  const shareMemory = async (memory: Memory) => {
    await triggerHapticFeedback("light");
    await shareToSocialMedia(memory);
  };
  
  const shareToSocialMedia = async (memory: Memory, platform?: string) => {
    try {
      await triggerHapticFeedback("success");
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(memory.uri, {
          dialogTitle: `${memory.matchInfo} - Barça Memory`,
          mimeType: memory.type === 'video' ? 'video/mp4' : 'image/jpeg',
        });
        
        setShowShareModal(false);
        
        setTimeout(() => {
          Alert.alert("Shared!", "Memory shared with the Barça family! 🎉");
        }, 500);
      } else {
        Alert.alert("Share Error", "Sharing is not available on this device.");
      }
      
    } catch (error: any) {
      await triggerHapticFeedback("error");
      if (error.message !== 'User cancelled sharing' && error.message !== 'User did not share') {
        Alert.alert("Share Error", "Unable to share at this time. Please try again.");
      }
    }
  };

  const deleteMemory = async (id: string) => {
    await triggerHapticFeedback("light");
    const memoryToDelete = memories.find((memory) => memory.id === id);
    const memoryTitle = memoryToDelete ? memoryToDelete.caption : "this memory";

    Alert.alert(
      "Delete Barça Memory",
      `Are you sure you want to delete "${memoryTitle}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await triggerHapticFeedback("success");
            setMemories((prevMemories) => {
              const updatedMemories = prevMemories.filter((memory) => memory.id !== id);
              Alert.alert("Deleted", "Barça memory has been removed from your collection.", [{ text: "OK" }]);
              return updatedMemories;
            });
          },
        },
      ]
    );
  };

  const openLocationInMaps = async (location: any) => {
    if (!location || !location.latitude || !location.longitude) {
      Alert.alert("Error", "Location data is not available.");
      return;
    }

    await triggerHapticFeedback("light");

    const lat = location.latitude;
    const lng = location.longitude;
    const label = location.city
      ? encodeURIComponent(`${location.city} - Barça Memory`)
      : encodeURIComponent("Barça Memory Location");

    let url: string;

    if (Platform.OS === "ios") {
      url = `maps:0,0?q=${label}@${lat},${lng}`;
    } else {
      url = `geo:0,0?q=${lat},${lng}(${label})`;
    }

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        await triggerHapticFeedback("success");
      } else {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        const webSupported = await Linking.canOpenURL(webUrl);

        if (webSupported) {
          await Linking.openURL(webUrl);
          await triggerHapticFeedback("success");
        } else {
          await triggerHapticFeedback("error");
          Alert.alert("Cannot Open Maps", "No map application is available on this device.", [{ text: "OK" }]);
        }
      }
    } catch (error) {
      console.error("Error opening maps:", error);
      await triggerHapticFeedback("error");
      Alert.alert("Maps Error", "Unable to open the map application. Please try again.", [{ text: "OK" }]);
    }
  };

  const switchTab = async (tab: "camera" | "memories") => {
    await triggerHapticFeedback("light");
    setCurrentView(tab);
  };

  // Beautiful Enhanced Share Modal Component
  const ShareModal = () => {
    if (!selectedMemory) return null;

    const socialPlatforms: SocialPlatform[] = [
      {
        name: 'Instagram',
        icon: '📸',
        color: '#E4405F',
        gradient: ['#833AB4', '#C13584', '#E4405F', '#F56040', '#FCAF45'],
        platform: 'instagram'
      },
      {
        name: 'WhatsApp',
        icon: '💬',
        color: '#25D366',
        gradient: ['#128C7E', '#25D366', '#DCF8C6'],
        platform: 'whatsapp'
      },
      {
        name: 'Facebook',
        icon: '👥',
        color: '#1877F2',
        gradient: ['#1877F2', '#42A5F5', '#66BB6A'],
        platform: 'facebook'
      },
      {
        name: 'Twitter',
        icon: '🐦',
        color: '#1DA1F2',
        gradient: ['#1DA1F2', '#42A5F5', '#81C784'],
        platform: 'twitter'
      },
      {
        name: 'TikTok',
        icon: '🎵',
        color: '#000000',
        gradient: ['#000000', '#FF0050', '#00F2EA'],
        platform: 'tiktok'
      },
      {
        name: 'More',
        icon: '✨',
        color: '#FF6B35',
        gradient: ['#FF6B35', '#F7931E', '#FFD23F'],
        platform: null
      },
    ];

    return (
      <Modal
        visible={showShareModal}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeShareModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay, 
            { 
              opacity: shareModalAnim,
              backgroundColor: shareModalAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']
              })
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.shareModal, 
              { 
                opacity: shareModalAnim,
                transform: [
                  { scale: shareModalScale },
                  {
                    translateY: shareModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['#A50044', '#004D98', '#003366']}
              style={styles.shareModalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Animated Header */}
              <View style={styles.shareModalHeader}>
                <LinearGradient
                  colors={['rgba(255,203,5,0.3)', 'rgba(255,203,5,0.1)', 'transparent']}
                  style={styles.headerGradient}
                />
                <View style={styles.headerContent}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.shareModalTitle}>Share Barça Memory</Text>
                    <Text style={styles.shareModalSubtitle}>Spread the passion! ⚽</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      triggerHapticFeedback("light");
                      closeShareModal();
                    }}
                    style={styles.shareModalClose}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                      style={styles.closeButtonGradient}
                    >
                      <Text style={styles.shareModalCloseText}>✕</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Enhanced Memory Preview */}
              <View style={styles.sharePreviewContainer}>
                <View style={styles.sharePreview}>
                  {selectedMemory.type === 'photo' ? (
                    <Image
                      source={{ uri: selectedMemory.uri }}
                      style={styles.sharePreviewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Video
                      source={{ uri: selectedMemory.uri }}
                      style={styles.sharePreviewImage}
                      resizeMode="cover"
                      shouldPlay={false}
                      useNativeControls={false}
                    />
                  )}
                  <LinearGradient
                    colors={['transparent', 'transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.sharePreviewOverlay}
                  >
                    <View style={styles.previewContent}>
                      <Text style={styles.sharePreviewTitle} numberOfLines={1}>
                        {selectedMemory.matchInfo}
                      </Text>
                      <Text style={styles.sharePreviewCaption} numberOfLines={2}>
                        {selectedMemory.caption}
                      </Text>
                      {selectedMemory.type === 'video' && selectedMemory.duration && (
                        <View style={styles.videoBadge}>
                          <Text style={styles.videoBadgeText}>
                            🎥 {formatDuration(selectedMemory.duration)}
                          </Text>
                        </View>
                      )}
                      {selectedMemory.location && (
                        <View style={styles.locationBadge}>
                          <Text style={styles.sharePreviewLocation}>
                            📍 {getLocationDisplayName(selectedMemory.location)}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.sharePreviewDate}>{selectedMemory.date}</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.previewBorder} />
                </View>
              </View>

              {/* Enhanced Social Platform Options */}
              <View style={styles.socialPlatformsContainer}>
                <Text style={styles.socialPlatformsTitle}>Share with Fellow Culés</Text>
                <View style={styles.socialPlatformsGrid}>
                  {socialPlatforms.map((platform, index) => (
                    <Animated.View
                      key={index}
                      style={[
                        styles.socialPlatformWrapper,
                        {
                          transform: [{
                            scale: shareModalAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.8, 1]
                            })
                          }],
                          opacity: shareModalAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 0, 1]
                          })
                        }
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.socialPlatformButton}
                        onPress={() => shareToSocialMedia(selectedMemory, platform.platform || '')}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={platform.gradient}
                          style={styles.socialPlatformGradient}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <View style={styles.socialPlatformContent}>
                            <Text style={styles.socialPlatformIcon}>
                              {platform.icon}
                            </Text>
                            <Text style={styles.socialPlatformName}>
                              {platform.name}
                            </Text>
                          </View>
                          <View style={styles.platformShine} />
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </View>
              </View>

              {/* Enhanced Footer */}
              <LinearGradient
                colors={['transparent', 'rgba(255,203,5,0.1)']}
                style={styles.shareModalFooter}
              >
                <View style={styles.footerContent}>
                  <Text style={styles.shareModalFooterText}>
                    #ViscaBarça • Més que un club
                  </Text>
                  <View style={styles.footerDivider} />
                  <Text style={styles.footerSubText}>
                    Share your passion with the world! 🔴🔵
                  </Text>
                </View>
              </LinearGradient>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  };

  // Loading state
  if (cameraPermission === null) {
    return (
      <LinearGradient
        colors={["#004d98", "#a50044", "#ffcb05"]}
        style={styles.loadingContainer}
      >
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <Text style={styles.loadingText}>Loading Barça Memories...</Text>
          <View style={styles.loadingIndicator} />
        </Animated.View>
      </LinearGradient>
    );
  }

  // Permission denied state
  if (!cameraPermission?.granted) {
    return (
      <LinearGradient
        colors={["#004d98", "#a50044"]}
        style={styles.permissionContainer}
      >
        <StatusBar barStyle="light-content" />
        <Animated.View
          style={[
            styles.permissionContent,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
            style={styles.permissionCard}
          >
            <Text style={styles.permissionTitle}>FC BARCELONA</Text>
            <Text style={styles.permissionSubtitle}>BARÇA MEMORIES</Text>
            <View style={styles.divider} />
            <Text style={styles.permissionMessage}>
              Capture your most treasured Barça moments with location
              information and share them with the world. From
              Camp Nou to your living room, every memory matters.
            </Text>
            <Text style={styles.permissionSubMessage}>
              Més que un club! More than a club!
            </Text>

            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermissions}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ffcb05", "#ffd700", "#ffcb05"]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.permissionButtonText}>
                  ENABLE CAMERA ACCESS
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </LinearGradient>
    );
  }

  // Preview state for captured photo or video
  if (photo || videoUri) {
    return (
      <LinearGradient colors={["#004d98", "#a50044"]} style={styles.container}>
        <StatusBar barStyle="light-content" />

        <LinearGradient
          colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={async () => {
              await triggerHapticFeedback("light");
              setPhoto(null);
              setVideoUri(null);
              setCurrentLocation(null);
            }}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#ffcb05", "#ffd700"]}
              style={styles.backButtonGradient}
            >
              <Text style={styles.backButtonText}>← BACK</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            ADD BARÇA {photo ? 'PHOTO' : 'VIDEO'} MEMORY
          </Text>
        </LinearGradient>

        <ScrollView
          style={styles.previewContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
            <View style={styles.imageFrame}>
              {photo ? (
                <Image
                  source={{ uri: photo }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <Video
                  source={{ uri: videoUri! }}
                  style={styles.previewImage}
                  useNativeControls
                  resizeMode="cover"
                  shouldPlay={false}
                />
              )}
              
              {/* Video Duration Badge */}
              {videoUri && recordingDuration > 0 && (
                <View style={styles.videoDurationBadge}>
                  <LinearGradient
                    colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
                    style={styles.durationTag}
                  >
                    <Text style={styles.durationText}>
                      🎥 {formatDuration(recordingDuration)}
                    </Text>
                  </LinearGradient>
                </View>
              )}

              <LinearGradient
                colors={["transparent", "rgba(0,77,152,0.3)"]}
                style={styles.imageOverlay}
              />
              {currentLocation && (
                <View style={styles.locationOverlay}>
                  <LinearGradient
                    colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
                    style={styles.locationTag}
                  >
                    <Text style={styles.locationTagText}>
                      {getLocationDisplayName(currentLocation)}
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          </Animated.View>

          <View style={styles.formContainer}>
            {currentLocation && (
              <LinearGradient
                colors={["rgba(255,203,5,0.15)", "rgba(255,203,5,0.05)"]}
                style={styles.locationCard}
              >
                <Text style={styles.locationCardTitle}>LOCATION CAPTURED</Text>
                <Text style={styles.locationCardText}>
                  {formatLocationString(currentLocation)}
                </Text>
                <TouchableOpacity
                  style={styles.viewLocationButton}
                  onPress={() => openLocationInMaps(currentLocation)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.viewLocationButtonText}>
                    View in Maps
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            )}

            {isGettingLocation && (
              <LinearGradient
                colors={["rgba(255,203,5,0.15)", "rgba(255,203,5,0.05)"]}
                style={styles.locationCard}
              >
                <Text style={styles.locationCardTitle}>
                  GETTING LOCATION...
                </Text>
                <Text style={styles.locationCardText}>
                  Adding location information to your memory...
                </Text>
              </LinearGradient>
            )}

            <LinearGradient
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
              style={styles.inputCard}
            >
              <Text style={styles.inputLabel}>MATCH INFORMATION</Text>
              <TextInput
                style={styles.textInput}
                placeholder="FC Barcelona vs Real Madrid"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={matchInfo}
                onChangeText={setMatchInfo}
                maxLength={50}
              />
            </LinearGradient>

            <LinearGradient
              colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
              style={styles.inputCard}
            >
              <Text style={styles.inputLabel}>YOUR BARÇA STORY</Text>
              <TextInput
                style={[styles.textInput, styles.captionInput]}
                placeholder="Share your thoughts about this magical Barça moment..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={caption}
                onChangeText={setCaption}
                multiline
                maxLength={150}
              />
            </LinearGradient>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveMemory}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ffcb05", "#ffd700", "#ffcb05"]}
                style={styles.saveButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.saveButtonText}>
                  SAVE TO BARÇA COLLECTION
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header */}
      <LinearGradient
        colors={["#004d98", "#a50044", "#004d98"]}
        style={styles.appHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerTop}>
          <Text style={styles.appSubtitle}>BARÇA MEMORIES</Text>
        </View>

        <LinearGradient
          colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
          style={styles.tabContainer}
        >
          <TouchableOpacity
            style={[styles.tab, currentView === "camera" && styles.activeTab]}
            onPress={() => switchTab("camera")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                currentView === "camera"
                  ? ["#ffcb05", "#ffd700"]
                  : ["transparent", "transparent"]
              }
              style={styles.tabGradient}
            >
              <Text
                style={[
                  styles.tabText,
                  currentView === "camera" && styles.activeTabText,
                ]}
              >
                CAMERA
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, currentView === "memories" && styles.activeTab]}
            onPress={() => switchTab("memories")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                currentView === "memories"
                  ? ["#ffcb05", "#ffd700"]
                  : ["transparent", "transparent"]
              }
              style={styles.tabGradient}
            >
              <Text
                style={[
                  styles.tabText,
                  currentView === "memories" && styles.activeTabText,
                ]}
              >
                MEMORIES ({memories.length})
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </LinearGradient>

      {currentView === "camera" ? (
        <View style={styles.cameraContainer}>
          {cameraPermission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              flash={flashMode}
              mode={captureMode}  // CRITICAL: Add this line
              onCameraReady={onCameraReady}
            >
              {/* Recording indicator */}
              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <LinearGradient
                    colors={['rgba(220,53,69,0.9)', 'rgba(220,53,69,0.7)']}
                    style={styles.recordingBadge}
                  >
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>REC {formatDuration(recordingDuration)}</Text>
                  </LinearGradient>
                </View>
              )}

              {/* Enhanced Camera Controls */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.cameraControls}
              >
                {/* Mode Toggle */}
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleCaptureMode}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      captureMode === 'photo'
                        ? ["#ffcb05", "#ffd700"]
                        : ["#dc3545", "#a50044"]
                    }
                    style={styles.controlButtonGradient}
                  >
                    <Text style={styles.controlButtonText}>
                      {captureMode === 'photo' ? "PHOTO" : "VIDEO"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.captureButton,
                    (!isCameraReady || isCapturing) &&
                      styles.captureButtonDisabled,
                    captureMode === 'video' && isRecording && styles.recordingButton,
                  ]}
                  onPress={takePicture}
                  disabled={!isCameraReady || isCapturing}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      captureMode === 'video' && isRecording
                        ? ["#dc3545", "#c82333", "#dc3545"]
                        : isCameraReady && !isCapturing
                        ? ["#ffcb05", "#ffd700", "#ffcb05"]
                        : ["#666", "#555", "#666"]
                    }
                    style={styles.captureButtonGradient}
                  >
                    <View style={styles.captureButtonInner}>
                      <LinearGradient
                        colors={
                          captureMode === 'video' && isRecording
                            ? ["#fff", "#f8f9fa"]
                            : isCameraReady && !isCapturing
                            ? ["#004d98", "#a50044"]
                            : ["#333", "#222"]
                        }
                        style={[
                          styles.captureButtonCenter,
                          captureMode === 'video' && isRecording && styles.recordingCenter,
                        ]}
                      />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleFlash}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                    style={styles.controlButtonGradient}
                  >
                    <Text style={styles.controlButtonText}>
                      {flashMode === "off" ? "FLASH" : "FLASH"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </CameraView>
          ) : (
            <View style={styles.cameraErrorContainer}>
              <LinearGradient
                colors={["#004d98", "#a50044"]}
                style={styles.errorGradient}
              >
                <Text style={styles.errorTitle}>Camera Access Needed</Text>
                <Text style={styles.errorMessage}>
                  Please enable camera permission in your device settings to
                  continue.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={requestPermissions}
                  activeOpacity={0.8}
                >
                  <Text style={styles.retryButtonText}>Retry Permissions</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </View>
      ) : (
        <LinearGradient
          colors={["#f8f9fa", "#e9ecef"]}
          style={styles.memoriesContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {memories.length === 0 ? (
              <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
                <LinearGradient
                  colors={["rgba(0,77,152,0.1)", "rgba(165,0,68,0.1)"]}
                  style={styles.emptyStateCard}
                >
                  <Text style={styles.emptyStateIcon}>⚽</Text>
                  <Text style={styles.emptyStateTitle}>
                    NO BARÇA MEMORIES YET
                  </Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Start capturing your magical Barça moments with photos & videos and
                    build your collection!
                  </Text>
                  <View style={styles.emptyStateDivider} />
                  <Text style={styles.emptyStateQuote}>"Més que un club"</Text>
                </LinearGradient>
              </Animated.View>
            ) : (
              <View style={styles.memoriesGrid}>
                <LinearGradient
                  colors={["rgba(0,77,152,0.05)", "rgba(165,0,68,0.05)"]}
                  style={styles.memoriesHeader}
                >
                  <Text style={styles.memoriesTitle}>
                    YOUR BARÇA COLLECTION
                  </Text>
                  <Text style={styles.memoriesCount}>
                    {memories.length} Memories
                  </Text>
                </LinearGradient>

                {memories.map((memory) => (
                  <Animated.View
                    key={memory.id}
                    style={[
                      styles.memoryCard,
                      {
                        opacity: fadeAnim,
                        transform: [
                          {
                            translateY: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [50, 0],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={["rgba(255,255,255,1)", "rgba(248,249,250,1)"]}
                      style={styles.memoryCardGradient}
                    >
                      <View style={styles.memoryImageContainer}>
                        {memory.type === 'photo' ? (
                          <Image
                            source={{ uri: memory.uri }}
                            style={styles.memoryImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <>
                            <Video
                              source={{ uri: memory.uri }}
                              style={styles.memoryImage}
                              resizeMode="cover"
                              shouldPlay={false}
                              useNativeControls={false}
                            />
                            <View style={styles.videoPlayOverlay}>
                              <LinearGradient
                                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)']}
                                style={styles.playButton}
                              >
                                <Text style={styles.playIcon}>▶️</Text>
                              </LinearGradient>
                            </View>
                            {memory.duration && (
                              <View style={styles.videoDurationOverlay}>
                                <Text style={styles.videoDurationText}>
                                  🎥 {formatDuration(memory.duration)}
                                </Text>
                              </View>
                            )}
                          </>
                        )}
                        <LinearGradient
                          colors={[
                            "transparent",
                            "rgba(0,77,152,0.8)",
                            "rgba(165,0,68,0.9)",
                          ]}
                          style={styles.memoryOverlay}
                        >
                          <View style={styles.memoryInfo}>
                            <Text style={styles.memoryMatch}>
                              {memory.matchInfo}
                            </Text>
                            <Text style={styles.memoryCaption}>
                              {memory.caption}
                            </Text>
                            <Text style={styles.memoryDate}>{memory.date}</Text>
                            {memory.location && (
                              <TouchableOpacity
                                onPress={() =>
                                  openLocationInMaps(memory.location)
                                }
                                style={styles.memoryLocationButton}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.memoryLocation}>
                                  {getLocationDisplayName(memory.location)}
                                </Text>
                              </TouchableOpacity>
                            )}
                          </View>
                          <View style={styles.memoryActions}>
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => shareMemory(memory)}
                              activeOpacity={0.7}
                            >
                              <LinearGradient
                                colors={[
                                  "rgba(255,203,5,0.9)",
                                  "rgba(255,215,0,0.9)",
                                ]}
                                style={styles.actionButtonGradient}
                              >
                                <Text style={styles.actionButtonText}>
                                  SHARE
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                            {memory.location && (
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() =>
                                  openLocationInMaps(memory.location)
                                }
                                activeOpacity={0.7}
                              >
                                <LinearGradient
                                  colors={[
                                    "rgba(52,144,220,0.9)",
                                    "rgba(52,144,220,0.7)",
                                  ]}
                                  style={styles.actionButtonGradient}
                                >
                                  <Text style={styles.actionButtonText}>
                                    MAP
                                  </Text>
                                </LinearGradient>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => deleteMemory(memory.id)}
                              activeOpacity={0.7}
                            >
                              <LinearGradient
                                colors={[
                                  "rgba(220,53,69,0.9)",
                                  "rgba(220,53,69,0.7)",
                                ]}
                                style={styles.actionButtonGradient}
                              >
                                <Text style={styles.actionButtonText}>
                                  DELETE
                                </Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>
                        </LinearGradient>
                      </View>

                      <LinearGradient
                        colors={["rgba(0,77,152,0.05)", "rgba(165,0,68,0.05)"]}
                        style={styles.memoryCardFooter}
                      >
                        <Text style={styles.barcaWatermark}>
                          BARÇA {memory.type.toUpperCase()} MEMORY
                        </Text>
                        {memory.location && (
                          <Text style={styles.memoryCardLocation}>
                            {memory.location.city || "Location"},{" "}
                            {memory.location.country || "Earth"}
                          </Text>
                        )}
                      </LinearGradient>
                    </LinearGradient>
                  </Animated.View>
                ))}
              </View>
            )}
          </ScrollView>
        </LinearGradient>
      )}

      {/* Beautiful Enhanced Share Modal */}
      <ShareModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
  },
  loadingIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ffcb05",
    borderRadius: 2,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  permissionContent: {
    width: "100%",
    maxWidth: 400,
  },
  permissionCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 2,
  },
  permissionSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffcb05",
    marginBottom: 20,
    letterSpacing: 1,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: "#ffcb05",
    borderRadius: 2,
    marginBottom: 25,
  },
  permissionMessage: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 15,
  },
  permissionSubMessage: {
    fontSize: 14,
    color: "#ffcb05",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 30,
  },
  permissionButton: {
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#ffcb05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 18,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "#004d98",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  appHeader: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerTop: {
    alignItems: "center",
    marginBottom: 25,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
    textAlign: "center",
  },
  appSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffcb05",
    marginTop: 5,
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 30,
    padding: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  tab: {
    flex: 1,
    borderRadius: 25,
    overflow: "hidden",
  },
  tabGradient: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  activeTab: {},
  tabText: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: "#004d98",
    fontWeight: "800",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
    borderRadius: 20,
    overflow: "hidden",
  },
  backButtonGradient: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  backButtonText: {
    color: "#004d98",
    fontSize: 14,
    fontWeight: "700",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    zIndex: 10,
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  recordingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    paddingTop: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 50,
  },
  controlButton: {
    borderRadius: 30,
    overflow: "hidden",
  },
  controlButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  controlButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  captureButton: {
    borderRadius: 45,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#ffcb05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  recordingButton: {
    // Additional styles for recording state
  },
  captureButtonGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
  },
  captureButtonCenter: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  recordingCenter: {
    borderRadius: 8, // Square shape when recording
  },
  cameraErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorGradient: {
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
  },
  errorTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },
  errorMessage: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
  },
  retryButton: {
    backgroundColor: "#ffcb05",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#004d98",
    fontSize: 16,
    fontWeight: "700",
  },
  previewContainer: {
    flex: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  imageFrame: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#ffcb05",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    position: "relative",
  },
  previewImage: {
    width: width - 40,
    height: (width - 40) * 1.33,
  },
  videoDurationBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
  },
  durationTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  locationOverlay: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  locationTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,203,5,0.3)",
  },
  locationTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  formContainer: {
    gap: 20,
  },
  locationCard: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(255,203,5,0.3)",
  },
  locationCardTitle: {
    color: "#ffcb05",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  locationCardText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  viewLocationButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,203,5,0.2)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,203,5,0.5)",
  },
  viewLocationButtonText: {
    color: "#ffcb05",
    fontSize: 12,
    fontWeight: "600",
  },
  inputCard: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  inputLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  textInput: {
    color: "#fff",
    fontSize: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
  },
  captionInput: {
    height: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 10,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#ffcb05",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#004d98",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  memoriesContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,77,152,0.2)",
    width: "100%",
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#004d98",
    textAlign: "center",
    marginBottom: 15,
    letterSpacing: 1,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyStateDivider: {
    width: 50,
    height: 3,
    backgroundColor: "#a50044",
    borderRadius: 2,
    marginBottom: 15,
  },
  emptyStateQuote: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#a50044",
    fontWeight: "600",
  },
  memoriesGrid: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  memoriesHeader: {
    margin: 15,
    marginBottom: 25,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,77,152,0.1)",
  },
  memoriesTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#004d98",
    letterSpacing: 1,
    marginBottom: 5,
  },
  memoriesCount: {
    fontSize: 14,
    color: "#a50044",
    fontWeight: "600",
  },
  memoryCard: {
    marginBottom: 25,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  memoryCardGradient: {
    borderRadius: 20,
    overflow: "hidden",
  },
  memoryImageContainer: {
    position: "relative",
  },
  memoryImage: {
    width: "100%",
    height: 300,
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  playIcon: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 4,
  },
  videoDurationOverlay: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  memoryOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  memoryInfo: {
    marginBottom: 15,
  },
  memoryMatch: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  memoryCaption: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
    lineHeight: 20,
  },
  memoryDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  memoryLocationButton: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,203,5,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,203,5,0.5)",
  },
  memoryLocation: {
    fontSize: 12,
    color: "#ffcb05",
    fontWeight: "600",
  },
  memoryActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  actionButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  actionButtonGradient: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  memoryCardFooter: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,77,152,0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barcaWatermark: {
    fontSize: 10,
    fontWeight: "800",
    color: "#004d98",
    letterSpacing: 1,
  },
  memoryCardLocation: {
    fontSize: 10,
    color: "#666",
    fontWeight: "600",
  },
  // Enhanced Beautiful Share Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  shareModal: {
    width: width * 0.92,
    maxWidth: 420,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 25,
    shadowColor: '#A50044',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
  },
  shareModalGradient: {
    position: 'relative',
  },
  shareModalHeader: {
    position: 'relative',
    paddingTop: 25,
    paddingBottom: 20,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,203,5,0.2)',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
  },
  shareModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  shareModalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  shareModalClose: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    marginLeft: 15,
  },
  closeButtonGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shareModalCloseText: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: '700',
  },
  sharePreviewContainer: {
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  sharePreview: {
    borderRadius: 22,
    overflow: 'hidden',
    height: 220,
    position: 'relative',
    backgroundColor: '#000',
  },
  sharePreviewImage: {
    width: '100%',
    height: '100%',
  },
  sharePreviewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  sharePreviewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sharePreviewCaption: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 12,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  videoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(220,53,69,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(220,53,69,0.4)',
    marginBottom: 8,
  },
  videoBadgeText: {
    fontSize: 13,
    color: '#ff6b6b',
    fontWeight: '700',
  },
  locationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,203,5,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,203,5,0.4)',
    marginBottom: 8,
  },
  sharePreviewLocation: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '700',
  },
  sharePreviewDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  previewBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,203,5,0.3)',
  },
  socialPlatformsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  socialPlatformsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: 25,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  socialPlatformsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialPlatformWrapper: {
    width: (width * 0.88 - 60) / 3,
  },
  socialPlatformButton: {
    height: 95,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  socialPlatformGradient: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialPlatformContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  socialPlatformIcon: {
    fontSize: 32,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  socialPlatformName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  platformShine: {
    position: 'absolute',
    top: -30,
    left: -30,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 30,
    transform: [{ rotate: '45deg' }],
  },
  shareModalFooter: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,203,5,0.2)',
  },
  footerContent: {
    alignItems: 'center',
  },
  shareModalFooterText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footerDivider: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(255,203,5,0.6)',
    borderRadius: 1,
    marginVertical: 10,
  },
  footerSubText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
