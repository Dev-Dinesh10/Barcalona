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
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");

interface Memory {
  id: string;
  uri: string;
  caption: string;
  date: string;
  matchInfo: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  };
}

interface TrackingPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  speed?: number;
  heading?: number;
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

export default function App() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    MediaLibrary.usePermissions();
  const [locationPermission, requestLocationPermission] =
    Location.useForegroundPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [flashMode, setFlashMode] = useState<"off" | "on">("off");
  const cameraRef = useRef<CameraView | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [memories, setMemories] = useState<Memory[]>([]);
  const [caption, setCaption] = useState("");
  const [matchInfo, setMatchInfo] = useState("");
  const [currentView, setCurrentView] = useState<
    "camera" | "memories" | "tracking"
  >("camera");
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasShownCameraReadyAlert, setHasShownCameraReadyAlert] =
    useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Live tracking state
  const [isTracking, setIsTracking] = useState(false);
  const [trackingPoints, setTrackingPoints] = useState<TrackingPoint[]>([]);
  const [currentPosition, setCurrentPosition] = useState<TrackingPoint | null>(
    null
  );
  const [totalDistance, setTotalDistance] = useState(0);
  const [trackingDuration, setTrackingDuration] = useState(0);
  const [trackingStartTime, setTrackingStartTime] = useState<number | null>(
    null
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null
  );
  const trackingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle back button on Android
    const backAction = () => {
      if (photo) {
        setPhoto(null);
        setCurrentLocation(null);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    // Request location permission on app start
    requestLocationPermissions();

    // Cleanup function
    return () => {
      backHandler.remove();
      stopTracking();
    };
  }, [fadeAnim, scaleAnim, photo]);

  // Update tracking duration
  useEffect(() => {
    if (isTracking && trackingStartTime) {
      trackingInterval.current = setInterval(() => {
        setTrackingDuration(
          Math.floor((Date.now() - trackingStartTime) / 1000)
        );
      }, 1000);
    } else if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }

    return () => {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
      }
    };
  }, [isTracking, trackingStartTime]);

  // Calculate distance between two points
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  // Start live tracking
  const startTracking = async () => {
    try {
      await triggerHapticFeedback("success");

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required for live tracking."
        );
        return;
      }

      // Clear previous tracking data
      setTrackingPoints([]);
      setTotalDistance(0);
      setTrackingDuration(0);
      setTrackingStartTime(Date.now());
      setIsTracking(true);

      // Start location subscription
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const newPoint: TrackingPoint = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: Date.now(),
            speed: location.coords.speed || 0,
            heading: location.coords.heading || 0,
          };

          setCurrentPosition(newPoint);

          setTrackingPoints((prevPoints) => {
            const updatedPoints = [...prevPoints, newPoint];

            // Calculate total distance
            if (prevPoints.length > 0) {
              const lastPoint = prevPoints[prevPoints.length - 1];
              const distance = calculateDistance(
                lastPoint.latitude,
                lastPoint.longitude,
                newPoint.latitude,
                newPoint.longitude
              );
              setTotalDistance((prev) => prev + distance);
            }

            return updatedPoints;
          });

          // Center map on current location
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              },
              1000
            );
          }
        }
      );

      Alert.alert(
        "Live Tracking Started",
        "Your location is now being tracked!"
      );
    } catch (error) {
      console.error("Error starting tracking:", error);
      await triggerHapticFeedback("error");
      Alert.alert("Error", "Failed to start live tracking. Please try again.");
    }
  };

  // Stop live tracking
  const stopTracking = async () => {
    await triggerHapticFeedback("light");

    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }

    setIsTracking(false);

    if (trackingPoints.length > 0) {
      Alert.alert(
        "Tracking Stopped",
        `Journey completed!\nDistance: ${formatDistance(
          totalDistance
        )}\nDuration: ${formatDuration(trackingDuration)}`,
        [{ text: "OK" }]
      );
    }
  };

  // Center map on user location
  const centerOnUser = async () => {
    if (currentPosition && mapRef.current) {
      await triggerHapticFeedback("light");
      mapRef.current.animateToRegion(
        {
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000
      );
    }
  };

  const requestLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Location access is needed to add location information to your Barça memories and enable live tracking. You can still use the camera without location services.",
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
        const permissionResult =
          await Location.requestForegroundPermissionsAsync();
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
        // maximumAge: 10000,
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
            address: `${address.street || ""} ${
              address.streetNumber || ""
            }`.trim(),
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
    if (location.address && location.address.trim())
      parts.push(location.address);
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);

    if (parts.length === 0) {
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(
        4
      )}`;
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
      return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(
        4
      )}`;
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
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          break;
        case "error":
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log("Haptic feedback not available:", error);
      if (Platform.OS === "android") {
        Vibration.vibrate(
          type === "heavy" ? 200 : type === "success" ? [100, 50, 100] : 100
        );
      }
    }
  };

  const requestPermissions = async () => {
    try {
      await triggerHapticFeedback("light");

      const cameraResult = await requestCameraPermission();
      const mediaResult = await requestMediaLibraryPermission();

      if (!cameraResult?.granted) {
        await triggerHapticFeedback("error");
        Alert.alert(
          "Camera Permission Required",
          "Please go to Settings and enable camera permission for this app to capture photos.",
          [{ text: "OK" }]
        );
      } else {
        await triggerHapticFeedback("success");
      }

      if (!mediaResult?.granted) {
        Alert.alert(
          "Media Library Permission",
          "Media library permission is needed to save photos to your gallery.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      await triggerHapticFeedback("error");
      Alert.alert(
        "Error",
        "Failed to request permissions. Please restart the app."
      );
    }
  };

  const onCameraReady = async () => {
    console.log("Camera is ready");
    setIsCameraReady(true);

    await triggerHapticFeedback("success");

    if (!hasShownCameraReadyAlert) {
      setTimeout(() => {
        Alert.alert(
          "Camera Ready",
          "Camera is now ready to capture photos with location!"
        );
        setHasShownCameraReadyAlert(true);
      }, 500);
    }
  };

  const takePicture = async () => {
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

      if (data && data.uri) {
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
          const locationText = locationData
            ? ` at ${locationData.city || "your location"}`
            : "";
          Alert.alert(
            "Perfect Shot!",
            `Your Barça memory is captured${locationText}!`
          );
        }, 100);
      } else {
        throw new Error("No photo data received");
      }
    } catch (error: any) {
      console.error("Error taking picture:", error);
      await triggerHapticFeedback("error");
      Alert.alert(
        "Camera Error",
        `Failed to capture photo: ${
          error.message || "Unknown error"
        }. Please try again.`
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

  const saveMemory = async () => {
    if (!photo) return;

    await triggerHapticFeedback("success");

    const newMemory: Memory = {
      id: Date.now().toString(),
      uri: photo,
      caption: caption || "Visça Barça! Amazing moment!",
      date: new Date().toLocaleDateString(),
      matchInfo: matchInfo || "FC Barcelona Match",
      location: currentLocation || undefined,
    };

    setMemories((prev) => [newMemory, ...prev]);
    setPhoto(null);
    setCurrentLocation(null);
    setCaption("");
    setMatchInfo("");

    const locationText = currentLocation
      ? ` from ${currentLocation.city || "your location"}`
      : "";
    Alert.alert(
      "Perfecte!",
      `Your Barça memory${locationText} has been saved to your collection!`
    );
  };

  const shareMemory = async (memory: Memory) => {
    await triggerHapticFeedback("light");
    const locationText = memory.location
      ? ` from ${memory.location.city || "a special location"}`
      : "";
    Alert.alert(
      "Share Barça Memory",
      `Share "${memory.caption}"${locationText} with fellow culés?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Share",
          onPress: async () => {
            await triggerHapticFeedback("success");
            Alert.alert("Shared!", "Memory shared with the Barça family!");
          },
        },
      ]
    );
  };

  const deleteMemory = async (id: string) => {
    await triggerHapticFeedback("light");
    const memoryToDelete = memories.find((memory) => memory.id === id);
    const memoryTitle = memoryToDelete ? memoryToDelete.caption : "this memory";

    Alert.alert(
      "Delete Barça Memory",
      `Are you sure you want to delete "${memoryTitle}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await triggerHapticFeedback("success");
            setMemories((prevMemories) => {
              const updatedMemories = prevMemories.filter(
                (memory) => memory.id !== id
              );
              Alert.alert(
                "Deleted",
                "Barça memory has been removed from your collection.",
                [{ text: "OK" }]
              );
              return updatedMemories;
            });
          },
        },
      ]
    );
  };

  // const openLocationInMaps = (location: any) => {
  //   if (!location) return;

  //   Alert.alert(
  //     "Open in Maps",
  //     "Would you like to view this location in your maps app?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Open Maps",
  //         onPress: () => {
  //           Alert.alert("Maps", "This would open the location in your maps app!");
  //         }
  //       },
  //     ]
  //   );
  // };

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

    // Different URL schemes for iOS and Android
    let url: string;

    if (Platform.OS === "ios") {
      // iOS Apple Maps URL scheme
      url = `maps:0,0?q=${label}@${lat},${lng}`;
    } else {
      // Android geo URI scheme
      url = `geo:0,0?q=${lat},${lng}(${label})`;
    }

    try {
      // Check if the URL can be opened
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        await triggerHapticFeedback("success");
      } else {
        // Fallback: Try Google Maps web version
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        const webSupported = await Linking.canOpenURL(webUrl);

        if (webSupported) {
          await Linking.openURL(webUrl);
          await triggerHapticFeedback("success");
        } else {
          await triggerHapticFeedback("error");
          Alert.alert(
            "Cannot Open Maps",
            "No map application is available on this device.",
            [{ text: "OK" }]
          );
        }
      }
    } catch (error) {
      console.error("Error opening maps:", error);
      await triggerHapticFeedback("error");
      Alert.alert(
        "Maps Error",
        "Unable to open the map application. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const switchTab = async (tab: "camera" | "memories" | "tracking") => {
    await triggerHapticFeedback("light");
    setCurrentView(tab);
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
              information, live tracking, and share them with the world. From
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

  if (photo) {
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
          <Text style={styles.headerTitle}>ADD BARÇA MEMORY</Text>
        </LinearGradient>

        <ScrollView
          style={styles.previewContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
            <View style={styles.imageFrame}>
              <Image
                source={{ uri: photo }}
                style={styles.previewImage}
                resizeMode="cover"
              />
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
          <Text style={styles.appTitle}>FC BARCELONA</Text>
          <Text style={styles.appSubtitle}>BARÇA MEMORIES & LIVE TRACKING</Text>
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
            style={[styles.tab, currentView === "tracking" && styles.activeTab]}
            onPress={() => switchTab("tracking")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                currentView === "tracking"
                  ? ["#ffcb05", "#ffd700"]
                  : ["transparent", "transparent"]
              }
              style={styles.tabGradient}
            >
              <Text
                style={[
                  styles.tabText,
                  currentView === "tracking" && styles.activeTabText,
                ]}
              >
                LIVE TRACK
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
              onCameraReady={onCameraReady}
            >
              {/* Professional Camera Overlay */}
              <LinearGradient
                colors={[
                  "rgba(0,77,152,0.3)",
                  "transparent",
                  "rgba(165,0,68,0.3)",
                ]}
                style={styles.cameraOverlay}
              />

              {/* Camera Info */}
              {/* <View style={styles.cameraInfo}>
                <LinearGradient
                  colors={["rgba(0,77,152,0.8)", "rgba(165,0,68,0.8)"]}
                  style={styles.infoCard}
                >
                  <Text style={styles.infoText}>VISÇA BARÇA!</Text>
                  <Text style={styles.infoSubText}>
                    {!isCameraReady
                      ? "Initializing camera..."
                      : isCapturing
                      ? "Capturing moment with location..."
                      : "Tap to capture your Barça moment with location"}
                  </Text>
                  {isGettingLocation && (
                    <Text style={styles.infoLocationText}>
                      Getting location...
                    </Text>
                  )}
                </LinearGradient>
              </View> */}

              {/* Enhanced Camera Controls */}
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.7)"]}
                style={styles.cameraControls}
              >
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleCameraType}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                    style={styles.controlButtonGradient}
                  >
                    <Text style={styles.controlButtonText}>FLIP</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.captureButton,
                    (!isCameraReady || isCapturing) &&
                      styles.captureButtonDisabled,
                  ]}
                  onPress={takePicture}
                  disabled={!isCameraReady || isCapturing}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      isCameraReady && !isCapturing
                        ? ["#ffcb05", "#ffd700", "#ffcb05"]
                        : ["#666", "#555", "#666"]
                    }
                    style={styles.captureButtonGradient}
                  >
                    <View style={styles.captureButtonInner}>
                      <LinearGradient
                        colors={
                          isCameraReady && !isCapturing
                            ? ["#004d98", "#a50044"]
                            : ["#333", "#222"]
                        }
                        style={styles.captureButtonCenter}
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
      ) : currentView === "tracking" ? (
        <LinearGradient
          colors={["#f8f9fa", "#e9ecef"]}
          style={styles.trackingContainer}
        >
          {/* Live Tracking Stats */}
          <LinearGradient
            colors={["rgba(0,77,152,0.1)", "rgba(165,0,68,0.1)"]}
            style={styles.trackingStatsContainer}
          >
            <View style={styles.trackingStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatDuration(trackingDuration)}
                </Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatDistance(totalDistance)}
                </Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {currentPosition?.speed
                    ? `${Math.round(currentPosition.speed * 3.6)} km/h`
                    : "0 km/h"}
                </Text>
                <Text style={styles.statLabel}>Speed</Text>
              </View>
            </View>

            <View style={styles.trackingControls}>
              <TouchableOpacity
                style={[styles.trackingButton, isTracking && styles.stopButton]}
                onPress={isTracking ? stopTracking : startTracking}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isTracking ? ["#dc3545", "#c82333"] : ["#28a745", "#218838"]
                  }
                  style={styles.trackingButtonGradient}
                >
                  <Text style={styles.trackingButtonText}>
                    {isTracking ? "STOP TRACKING" : "START TRACKING"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {currentPosition && (
                <TouchableOpacity
                  style={styles.centerButton}
                  onPress={centerOnUser}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={["#007bff", "#0056b3"]}
                    style={styles.centerButtonGradient}
                  >
                    <Text style={styles.centerButtonText}>CENTER</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>

          {/* Map View */}
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: 20.5937,
                longitude: 78.9629,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              showsMyLocationButton={false}
              followsUserLocation={isTracking}
              showsCompass={true}
              showsScale={true}
              mapType="standard"
            >
              {/* Current Position Marker */}
              {currentPosition && (
                <Marker
                  coordinate={{
                    latitude: currentPosition.latitude,
                    longitude: currentPosition.longitude,
                  }}
                  title="Your Current Location"
                  description={`Speed: ${
                    currentPosition.speed
                      ? Math.round(currentPosition.speed * 3.6)
                      : 0
                  } km/h`}
                >
                  <View style={styles.currentLocationMarker}>
                    <LinearGradient
                      colors={["#007bff", "#0056b3"]}
                      style={styles.markerGradient}
                    >
                      <View style={styles.markerInner} />
                    </LinearGradient>
                  </View>
                </Marker>
              )}

              {/* Route Polyline */}
              {trackingPoints.length > 1 && (
                <Polyline
                  coordinates={trackingPoints.map((point) => ({
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }))}
                  strokeColor="#004d98"
                  strokeWidth={4}
                  lineJoin="round"
                  lineCap="round"
                />
              )}

              {/* Start Point Marker */}
              {trackingPoints.length > 0 && (
                <Marker
                  coordinate={{
                    latitude: trackingPoints[0].latitude,
                    longitude: trackingPoints[0].longitude,
                  }}
                  title="Journey Start"
                  description="Your journey began here"
                  pinColor="green"
                />
              )}
            </MapView>

            {/* Tracking Status Overlay */}
            {isTracking && (
              <View style={styles.trackingStatusOverlay}>
                <LinearGradient
                  colors={["rgba(40,167,69,0.9)", "rgba(33,136,56,0.9)"]}
                  style={styles.statusBadge}
                >
                  <Text style={styles.statusText}>LIVE TRACKING</Text>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Journey Summary */}
          {trackingPoints.length > 0 && (
            <LinearGradient
              colors={["rgba(0,77,152,0.05)", "rgba(165,0,68,0.05)"]}
              style={styles.journeySummary}
            >
              <Text style={styles.journeyTitle}>CURRENT JOURNEY</Text>
              <Text style={styles.journeyInfo}>
                {trackingPoints.length} tracking points recorded
              </Text>
              {trackingStartTime && (
                <Text style={styles.journeyInfo}>
                  Started at {new Date(trackingStartTime).toLocaleTimeString()}
                </Text>
              )}
            </LinearGradient>
          )}
        </LinearGradient>
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
                    Start capturing your magical Barça moments with location and
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
                        <Image
                          source={{ uri: memory.uri }}
                          style={styles.memoryImage}
                          resizeMode="cover"
                        />
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
                        <Text style={styles.barcaWatermark}>BARÇA MEMORY</Text>
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
    fontSize: 14,
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
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  cameraInfo: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  infoCard: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: "center",
  },
  infoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
  infoSubText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  infoLocationText: {
    color: "#ffcb05",
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
    fontWeight: "600",
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
  // Tracking Container Styles
  trackingContainer: {
    flex: 1,
  },
  trackingStatsContainer: {
    margin: 15,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0,77,152,0.2)",
  },
  trackingStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#004d98",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  trackingControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  trackingButton: {
    borderRadius: 25,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stopButton: {},
  trackingButtonGradient: {
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  trackingButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  centerButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  centerButtonGradient: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  centerButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  map: {
    flex: 1,
  },
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  markerGradient: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  trackingStatusOverlay: {
    position: "absolute",
    top: 15,
    right: 15,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  journeySummary: {
    margin: 15,
    marginTop: 0,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(0,77,152,0.1)",
  },
  journeyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#004d98",
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  journeyInfo: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  // Memories Container Styles
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
});
