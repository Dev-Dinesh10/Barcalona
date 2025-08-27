import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  StatusBar,
  Image,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// ✅ Updated RootStackParamList to include Profile
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Dashboard: undefined;
  Main: undefined;
  Profile: undefined;
};

const Dashboard = ({ navigation }: any) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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
    statCardBg: isDarkMode ? '#2A2A2A' : '#F8F9FA',
    borderColor: isDarkMode ? '#333' : '#E9ECEF',
    newsCardBg: isDarkMode ? '#2A2A2A' : '#F8F9FA',
  };

  const quickStats = [
    { title: 'Matches Watched', value: '47', icon: '⚽' },
    { title: 'Goals Scored', value: '89', icon: '🥅' },
    { title: 'Trophies Won', value: '12', icon: '🏆' },
    { title: 'Fan Points', value: '2,547', icon: '⭐' },
  ];

  const recentMatches = [
    { opponent: 'Real Madrid', result: 'W 3-2', date: 'Aug 15', competition: 'La Liga' },
    { opponent: 'PSG', result: 'W 2-1', date: 'Aug 10', competition: 'UCL' },
    { opponent: 'Atletico Madrid', result: 'D 1-1', date: 'Aug 5', competition: 'La Liga' },
  ];

  const upcomingMatches = [
    { opponent: 'Valencia', date: 'Aug 25', time: '20:00', venue: 'Camp Nou' },
    { opponent: 'Bayern Munich', date: 'Sep 1', time: '21:00', venue: 'Allianz Arena' },
    { opponent: 'Sevilla', date: 'Sep 8', time: '16:15', venue: 'Camp Nou' },
  ];

  const menuItems = [
    { title: 'Squad & Players', icon: '👥', color: '#4CAF50', screen: 'SquadPlayers' },
    { title: 'Match Center', icon: '⚽', color: '#FF9800', screen: 'Matches'},
    { title: 'News & Updates', icon: '📰', color: '#2196F3', screen: 'News' },
    { title: 'Statistics', icon: '📊', color: '#9C27B0', screen: 'Statistics' },
    { title: 'Tickets', icon: '🎫', color: '#F44336', screen: 'Tickets' },
    { title: 'Fan Zone', icon: '🎉', color: '#FF5722', screen: 'FanZone' },
  ];

  const handleMenuPress = (item: any) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else {
      console.log(`${item.title} pressed - Coming Soon!`);
    }
  };

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
    welcomeText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.accent,
    },
    dateText: {
      fontSize: 14,
      color: '#fff',
      marginTop: 4,
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
      marginRight: 10,
    },
    themeIcon: {
      fontSize: 20,
    },
    profileButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileIcon: {
      fontSize: 20,
      color: '#fff',
    },
    logoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerLogo: {
      width: 30,
      height: 30,
      marginRight: 10,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.accent,
    },
    statsSection: {
      padding: 20,
      backgroundColor: theme.cardBackground,
      marginTop: -15,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 15,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: (width - 60) / 2,
      backgroundColor: theme.statCardBg,
      padding: 20,
      borderRadius: 15,
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    statIcon: {
      fontSize: 30,
      marginBottom: 10,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.barcelona,
      marginBottom: 5,
    },
    statTitle: {
      fontSize: 12,
      color: theme.subText,
      textAlign: 'center',
    },
    section: {
      backgroundColor: theme.cardBackground,
      marginTop: 10,
      paddingHorizontal: 20,
      paddingVertical: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    matchCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: theme.statCardBg,
      borderRadius: 10,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: theme.barcelona,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    matchInfo: {
      flex: 1,
    },
    matchOpponent: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    matchCompetition: {
      fontSize: 12,
      color: theme.subText,
      marginTop: 2,
    },
    matchResult: {
      alignItems: 'flex-end',
    },
    resultText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    matchDate: {
      fontSize: 12,
      color: theme.subText,
      marginTop: 2,
    },
    upcomingCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: theme.statCardBg,
      borderRadius: 10,
      marginBottom: 10,
      borderLeftWidth: 4,
      borderLeftColor: theme.blue,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    upcomingInfo: {
      flex: 1,
    },
    upcomingOpponent: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    upcomingVenue: {
      fontSize: 12,
      color: theme.subText,
      marginTop: 2,
    },
    upcomingTime: {
      alignItems: 'flex-end',
    },
    upcomingDate: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.blue,
    },
    upcomingTimeText: {
      fontSize: 12,
      color: theme.subText,
      marginTop: 2,
    },
    menuGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    menuItem: {
      width: (width - 60) / 2,
      backgroundColor: theme.statCardBg,
      padding: 20,
      borderRadius: 15,
      alignItems: 'center',
      marginBottom: 15,
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    menuIcon: {
      fontSize: 30,
      marginBottom: 10,
    },
    menuTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
    },
    newsCard: {
      flexDirection: 'row',
      backgroundColor: theme.newsCardBg,
      borderRadius: 15,
      padding: 15,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    newsContent: {
      flex: 1,
      marginRight: 15,
    },
    newsTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 5,
    },
    newsSubtitle: {
      fontSize: 14,
      color: theme.subText,
      marginBottom: 8,
      lineHeight: 20,
    },
    newsTime: {
      fontSize: 12,
      color: theme.barcelona,
      fontWeight: '600',
    },
    newsImage: {
      width: 60,
      height: 60,
      backgroundColor: theme.borderColor,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    newsImagePlaceholder: {
      fontSize: 24,
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
            <View>
              <Text style={styles.welcomeText}>Welcome back, Culé!</Text>
              <Text style={styles.dateText}>Saturday, August 16, 2025</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
                <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
              {/* ✅ Updated Profile Button with Navigation */}
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <Text style={styles.profileIcon}>👤</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' }}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>FC Barcelona</Text>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Results</Text>
          {recentMatches.map((match, index) => (
            <View key={index} style={styles.matchCard}>
              <View style={styles.matchInfo}>
                <Text style={styles.matchOpponent}>vs {match.opponent}</Text>
                <Text style={styles.matchCompetition}>{match.competition}</Text>
              </View>
              <View style={styles.matchResult}>
                <Text style={[styles.resultText, { color: match.result.startsWith('W') ? theme.success : match.result.startsWith('D') ? theme.warning : theme.danger }]}>
                  {match.result}
                </Text>
                <Text style={styles.matchDate}>{match.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Upcoming Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Fixtures</Text>
          {upcomingMatches.map((match, index) => (
            <View key={index} style={styles.upcomingCard}>
              <View style={styles.upcomingInfo}>
                <Text style={styles.upcomingOpponent}>vs {match.opponent}</Text>
                <Text style={styles.upcomingVenue}>{match.venue}</Text>
              </View>
              <View style={styles.upcomingTime}>
                <Text style={styles.upcomingDate}>{match.date}</Text>
                <Text style={styles.upcomingTimeText}>{match.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Menu Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.menuItem, { borderLeftColor: item.color }]}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* News Highlight */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest News</Text>
          <TouchableOpacity style={styles.newsCard}>
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>Barcelona Signs New Star Player</Text>
              <Text style={styles.newsSubtitle}>
                The club announces the signing of a promising young talent from La Masia academy.
              </Text>
              <Text style={styles.newsTime}>2 hours ago</Text>
            </View>
            <View style={styles.newsImage}>
              <Text style={styles.newsImagePlaceholder}>📰</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
      </LinearGradient>
    </>
  );
};

export default Dashboard;