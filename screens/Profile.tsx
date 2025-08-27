import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  TextInput,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Dashboard: undefined;
  Main: undefined;
  Profile: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  favoritePlayer: string;
  memberSince: string;
  fanLevel: string;
  profileImage?: string;
  bio: string;
  location: string;
}

const Profile = ({ navigation }: Props) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: '',
    email: '',
    phone: '',
    favoritePlayer: '',
    memberSince: '',
    fanLevel: 'Bronze',
    bio: '',
    location: '',
  });

  const theme = {
    background: isDarkMode ? '#121212' : '#F5F5F5',
    cardBackground: isDarkMode ? '#1E1E1E' : '#fff',
    text: isDarkMode ? '#FFFFFF' : '#333',
    subText: isDarkMode ? '#B0B0B0' : '#666',
    header: '#A50044',
    accent: '#FFD700',
    barcelona: '#A50044',
    blue: '#004D98',
    success: '#4CAF50',
    warning: '#FF9800',
    danger: '#F44336',
    inputBackground: isDarkMode ? '#2A2A2A' : '#F8F9FA',
    borderColor: isDarkMode ? '#333' : '#E9ECEF',
  };

  // Clear existing profile data and reset to user defaults
  const resetToUserProfile = async () => {
    try {
      await AsyncStorage.removeItem('userProfile'); // Clear old data
      const userProfile = {
        fullName: 'Barcelona Fan',
        email: 'test@example.com',
        phone: '+1 (555) 123-4567',
        favoritePlayer: 'Lionel Messi',
        memberSince: '2020',
        fanLevel: 'Gold',
        bio: 'Passionate FC Barcelona fan since childhood. Visca el Barça!',
        location: 'Barcelona, Spain',
      };
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      setUserProfile(userProfile);
    } catch (error) {
      console.error('Error resetting profile:', error);
    }
  };

  // Load profile data from AsyncStorage
  useEffect(() => {
    resetToUserProfile(); // Reset to user profile first
    loadTheme();
  }, []);

  const loadProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        setUserProfile(JSON.parse(profileData));
      } else {
        // Set default profile data for user
        const defaultProfile = {
          fullName: 'Barcelona Fan',
          email: 'test@example.com',
          phone: '+1 (555) 123-4567',
          favoritePlayer: 'Lionel Messi',
          memberSince: '2020',
          fanLevel: 'Gold',
          bio: 'Passionate FC Barcelona fan since childhood. Visca el Barça!',
          location: 'Barcelona, Spain',
        };
        setUserProfile(defaultProfile);
        await AsyncStorage.setItem('userProfile', JSON.stringify(defaultProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear user session data (keep profile data)
      await AsyncStorage.removeItem('userSession');
      setShowLogoutModal(false);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const getFanLevelColor = (level: string) => {
    switch (level) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return theme.barcelona;
    }
  };

  const profileStats = [
    { label: 'Matches Attended', value: '47' },
    { label: 'Years as Fan', value: '15' },
    { label: 'Trophies Witnessed', value: '23' },
    { label: 'Camp Nou Visits', value: '12' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    gradientBg: {
      flex: 1,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 30,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.accent,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    themeToggle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    themeIcon: {
      fontSize: 20,
    },
    profileCard: {
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      marginTop: -15,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    profileImageContainer: {
      position: 'relative',
      marginBottom: 20,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      borderColor: theme.barcelona,
    },
    profileImagePlaceholder: {
      fontSize: 50,
      color: theme.barcelona,
    },
    editImageButton: {
      position: 'absolute',
      bottom: 5,
      right: 5,
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.barcelona,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editImageText: {
      color: '#fff',
      fontSize: 16,
    },
    profileName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 5,
    },
    profileEmail: {
      fontSize: 16,
      color: theme.subText,
      marginBottom: 10,
    },
    fanLevelBadge: {
      paddingHorizontal: 15,
      paddingVertical: 5,
      borderRadius: 20,
      marginBottom: 20,
    },
    fanLevelText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    editButton: {
      backgroundColor: theme.barcelona,
      paddingHorizontal: 25,
      paddingVertical: 10,
      borderRadius: 25,
    },
    editButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      marginTop: 15,
      borderRadius: 15,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.barcelona,
      marginBottom: 5,
    },
    statLabel: {
      fontSize: 12,
      color: theme.subText,
      textAlign: 'center',
    },
    infoSection: {
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      marginTop: 15,
      borderRadius: 15,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 15,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    infoLabel: {
      fontSize: 16,
      color: theme.subText,
      flex: 1,
    },
    infoValue: {
      fontSize: 16,
      color: theme.text,
      flex: 2,
      textAlign: 'right',
    },
    input: {
      fontSize: 16,
      color: theme.text,
      flex: 2,
      textAlign: 'right',
      backgroundColor: theme.inputBackground,
      padding: 8,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    bioInput: {
      fontSize: 16,
      color: theme.text,
      backgroundColor: theme.inputBackground,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.borderColor,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      marginTop: 15,
      borderRadius: 15,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    actionButton: {
      flex: 1,
      marginHorizontal: 5,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: theme.success,
    },
    cancelButton: {
      backgroundColor: theme.subText,
    },
    logoutButton: {
      backgroundColor: theme.danger,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 30,
      width: width * 0.8,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 15,
    },
    modalMessage: {
      fontSize: 16,
      color: theme.subText,
      textAlign: 'center',
      marginBottom: 25,
      lineHeight: 22,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    modalButton: {
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 10,
      minWidth: 80,
      alignItems: 'center',
    },
    modalCancelButton: {
      backgroundColor: theme.subText,
    },
    modalConfirmButton: {
      backgroundColor: theme.danger,
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "light-content"} 
        backgroundColor="#A50044" 
      />
      <LinearGradient
        colors={["#0B1F48", "#004D98", "#A50044"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBg}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            style={styles.header}
            colors={["#A50044", "#7A0033", "#004D98"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
              
              <Text style={styles.headerTitle}>Profile</Text>
              
              <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
                <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Text style={styles.profileImagePlaceholder}>👤</Text>
              </View>
              <TouchableOpacity style={styles.editImageButton}>
                <Text style={styles.editImageText}>✎</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.profileName}>{userProfile.fullName}</Text>
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
            
            <View style={[styles.fanLevelBadge, { backgroundColor: getFanLevelColor(userProfile.fanLevel) }]}>
              <Text style={styles.fanLevelText}>{userProfile.fanLevel} Member</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {profileStats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Profile Information */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={userProfile.fullName}
                  onChangeText={(text) => setUserProfile({...userProfile, fullName: text})}
                  placeholder="Enter full name"
                  placeholderTextColor={theme.subText}
                />
              ) : (
                <Text style={styles.infoValue}>{userProfile.fullName}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={userProfile.email}
                  onChangeText={(text) => setUserProfile({...userProfile, email: text})}
                  placeholder="Enter email"
                  placeholderTextColor={theme.subText}
                  keyboardType="email-address"
                />
              ) : (
                <Text style={styles.infoValue}>{userProfile.email}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={userProfile.phone}
                  onChangeText={(text) => setUserProfile({...userProfile, phone: text})}
                  placeholder="Enter phone number"
                  placeholderTextColor={theme.subText}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoValue}>{userProfile.phone}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={userProfile.location}
                  onChangeText={(text) => setUserProfile({...userProfile, location: text})}
                  placeholder="Enter location"
                  placeholderTextColor={theme.subText}
                />
              ) : (
                <Text style={styles.infoValue}>{userProfile.location}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Favorite Player</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={userProfile.favoritePlayer}
                  onChangeText={(text) => setUserProfile({...userProfile, favoritePlayer: text})}
                  placeholder="Enter favorite player"
                  placeholderTextColor={theme.subText}
                />
              ) : (
                <Text style={styles.infoValue}>{userProfile.favoritePlayer}</Text>
              )}
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={userProfile.memberSince}
                  onChangeText={(text) => setUserProfile({...userProfile, memberSince: text})}
                  placeholder="Enter year"
                  placeholderTextColor={theme.subText}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.infoValue}>{userProfile.memberSince}</Text>
              )}
            </View>
          </View>

          {/* Bio Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Bio</Text>
            {isEditing ? (
              <TextInput
                style={styles.bioInput}
                value={userProfile.bio}
                onChangeText={(text) => setUserProfile({...userProfile, bio: text})}
                placeholder="Tell us about yourself..."
                placeholderTextColor={theme.subText}
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={[styles.infoValue, { textAlign: 'left' }]}>{userProfile.bio}</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={saveProfile}
                >
                  <Text style={styles.actionButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setIsEditing(false);
                    loadProfile(); // Reset to original data
                  }}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.actionButton, styles.logoutButton]}
                onPress={() => setShowLogoutModal(true)}
              >
                <Text style={styles.actionButtonText}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Logout</Text>
              <Text style={styles.modalMessage}>
                Are you sure you want to logout? You'll need to login again to access your account.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={handleLogout}
                >
                  <Text style={styles.modalButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </>
  );
};

export default Profile;