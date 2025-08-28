import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  avatar: string;
  goals: number;
  assists: number;
  careerGoals: number;
  age: number;
  pastTeams: string[];
  trophies: string[];
  nationality: string;
}

const SquadPlayers = ({ navigation }: any) => {
  // ✅ Permanently set to dark mode
  const isDarkMode = true;
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // ✅ Dark mode theme configuration
  const theme = {
    primary: '#A50044',
    secondary: '#004D98',
    accent: '#FFD700',
    background: '#0a0a0a',
    cardBackground: '#1a1a1a',
    headerGradient: ['#A50044', '#004D98'],
    cardGradient: ['#1a1a1a', '#2a2a2a'],
    text: '#ffffff',
    subText: '#b0b0b0',
    statCardBg: 'rgba(165, 0, 68, 0.1)',
    borderColor: '#333',
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    modalBg: 'rgba(0,0,0,0.95)',
  };

  const players: Player[] = [
    {
      id: '1',
      name: 'Robert Lewandowski',
      position: 'Forward',
      number: 9,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvI3M6gk4XcYneJDlRzT56Tj_wKyfPGFkXzg&s',
      goals: 42,
      assists: 8,
      careerGoals: 634,
      age: 35,
      pastTeams: ['Bayern Munich', 'Borussia Dortmund'],
      trophies: ['Champions League', 'Bundesliga (8x)', 'La Liga', 'Copa del Rey', 'FIFA Club World Cup', 'UEFA Super Cup'],
      nationality: '🇵🇱',
    },
    {
      id: '2',
      name: 'Pedri González',
      position: 'Midfielder',
      number: 8,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5LSjElCQNoSBh7DjJWaf-KFK-iWLjqlfWgg&s',
      goals: 12,
      assists: 15,
      careerGoals: 28,
      age: 21,
      pastTeams: ['Las Palmas'],
      trophies: ['La Liga', 'Copa del Rey', 'UEFA Nations League', 'Olympics Silver Medal'],
      nationality: '🇪🇸',
    },
    {
      id: '3',
      name: 'Gavi',
      position: 'Midfielder',
      number: 6,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM2JNxv9-dRv6gkhKcV6SovBgZy6l7NKF3Wg&s',
      goals: 8,
      assists: 12,
      careerGoals: 15,
      age: 20,
      pastTeams: ['Barcelona B'],
      trophies: ['La Liga', 'Copa del Rey', 'UEFA Nations League', 'World Cup'],
      nationality: '🇪🇸',
    },
    {
      id: '4',
      name: 'Marc-André ter Stegen',
      position: 'Goalkeeper',
      number: 1,
      avatar: 'https://www.aljazeera.com/wp-content/uploads/2025/08/2025-08-07T140541Z_1552282171_RC2JAEAAYM00_RTRMADP_3_SOCCER-SPAIN-BAR-1754680968.jpg?resize=770%2C513&quality=80',
      goals: 0,
      assists: 2,
      careerGoals: 0,
      age: 31,
      pastTeams: ['Borussia Mönchengladbach'],
      trophies: ['Champions League', 'La Liga (3x)', 'Copa del Rey (5x)', 'FIFA Club World Cup', 'UEFA Super Cup'],
      nationality: '🇩🇪',
    },
    {
      id: '5',
      name: 'Frenkie de Jong',
      position: 'Midfielder',
      number: 21,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwnhKJArh6romUlsd5ovgVPze9MUT56Dxylw&s',
      goals: 6,
      assists: 10,
      careerGoals: 35,
      age: 27,
      pastTeams: ['Ajax', 'Willem II'],
      trophies: ['La Liga', 'Copa del Rey', 'Eredivisie (2x)', 'KNVB Cup', 'UEFA Nations League'],
      nationality: '🇳🇱',
    },
    {
      id: '6',
      name: 'Jules Koundé',
      position: 'Defender',
      number: 23,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_NBAS841l5lunFBZs3Of-qGBScb-d3m74QA&s',
      goals: 3,
      assists: 4,
      careerGoals: 18,
      age: 25,
      pastTeams: ['Sevilla', 'Bordeaux'],
      trophies: ['La Liga', 'Europa League (2x)', 'UEFA Nations League'],
      nationality: '🇫🇷',
    },
    {
      id: '7',
      name: 'Raphinha',
      position: 'Winger',
      number: 22,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWoQB3dWExkf6rsBVoW-idFvTAaXzVPpmS1kIKuu7iy7PK-W8EYDt47G-XW9OfZgKIVFQ&usqp=CAU',
      goals: 18,
      assists: 14,
      careerGoals: 87,
      age: 27,
      pastTeams: ['Leeds United', 'Rennes', 'Sporting CP'],
      trophies: ['La Liga', 'Copa América'],
      nationality: '🇧🇷',
    },
    {
      id: '8',
      name: 'Ronald Araújo',
      position: 'Defender',
      number: 4,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk_QTHBYSFHKR-ie30otkx7sg3fYoqqE6LXg&s',
      goals: 5,
      assists: 2,
      careerGoals: 12,
      age: 25,
      pastTeams: ['Boston River'],
      trophies: ['La Liga', 'Copa del Rey', 'Copa América'],
      nationality: '🇺🇾',
    },
    {
      id: '9',
      name: 'Jordi Alba',
      position: 'Left-back',
      number: 18,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYhvFFY4pOtCe3A2c477z6UlDPcyzO5rYDWA&s',
      goals: 24,
      assists: 89,
      careerGoals: 47,
      age: 34,
      pastTeams: ['Valencia'],
      trophies: ['Champions League', 'La Liga (6x)', 'Copa del Rey (5x)', 'Euro 2012', 'UEFA Nations League'],
      nationality: '🇪🇸',
    },
    {
      id: '10',
      name: 'Ferran Torres',
      position: 'Forward',
      number: 7,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpnLEERjUSzQ7mhHDEP5pQr9MAgZceqFi-UA&s',
      goals: 16,
      assists: 11,
      careerGoals: 78,
      age: 24,
      pastTeams: ['Manchester City', 'Valencia'],
      trophies: ['La Liga', 'Premier League', 'Carabao Cup', 'UEFA Nations League'],
      nationality: '🇪🇸',
    },
    {
      id: '11',
      name: 'Lamine Yamal',
      position: 'Winger',
      number: 19,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhoTjjzQ9-6jps5TvZrmwl4O0Zo_1HsBGbsA&s',
      goals: 14,
      assists: 8,
      careerGoals: 29,
      age: 17,
      pastTeams: ['Barcelona B'],
      trophies: ['La Liga', 'Copa del Rey', 'UEFA Euro 2024'],
      nationality: '🇪🇸',
    },
    {
      id: '12',
      name: 'Ansu Fati',
      position: 'Winger',
      number: 10,
      avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgLqVDe87M06AecXPBa6PmHzy06dkLgopQ_w&s',
      goals: 22,
      assists: 21,
      careerGoals: 96,
      age: 22,
      pastTeams: ['Barcelona B'],
      trophies: ['La Liga (2x)', 'Copa del Rey (2x)', 'Golden Boy Award'],
      nationality: '🇪🇸',
    },
  ];

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'goalkeeper':
        return ['#28a745', '#20c997'];
      case 'defender':
      case 'left-back':
        return ['#17a2b8', '#20c997'];
      case 'midfielder':
        return ['#ffc107', '#fd7e14'];
      case 'forward':
      case 'winger':
        return ['#dc3545', '#e83e8c'];
      default:
        return [theme.primary, theme.secondary];
    }
  };

  const openPlayerModal = (player: Player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const renderPlayerCard = ({ item, index }: { item: Player; index: number }) => (
    <Animated.View
      style={[
        styles.playerCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0]
            })
          }]
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => openPlayerModal(item)}
        style={styles.cardTouchable}
      >
        {/* Background Gradient */}
        <View style={styles.cardBackground}>
          <View style={[styles.cardGlow, { backgroundColor: getPositionColor(item.position)[0] + '20' }]} />
        </View>

        {/* Player Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.avatar }} style={styles.playerAvatar} />
            <View style={[styles.numberBadge, { 
              backgroundColor: getPositionColor(item.position)[0],
              shadowColor: getPositionColor(item.position)[0]
            }]}>
              <Text style={styles.numberText}>{item.number}</Text>
            </View>
          </View>
          <Text style={styles.nationalityFlag}>{item.nationality}</Text>
        </View>

        {/* Player Info */}
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, { color: theme.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={[styles.positionBadge, { 
            backgroundColor: getPositionColor(item.position)[0],
            shadowColor: getPositionColor(item.position)[0]
          }]}>
            <Text style={styles.positionText}>{item.position}</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.statCardBg }]}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{item.goals}</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>Goals</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.statCardBg }]}>
              <Text style={[styles.statValue, { color: theme.secondary }]}>{item.assists}</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>Assists</Text>
            </View>
          </View>

          {/* Career Info */}
          <View style={styles.careerSection}>
            <Text style={[styles.ageText, { color: theme.subText }]}>Age: {item.age}</Text>
            <Text style={[styles.careerGoals, { color: theme.text }]}>
              Career: {item.careerGoals} goals
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity 
            style={[styles.viewDetailsBtn, { backgroundColor: theme.primary }]}
            onPress={() => openPlayerModal(item)}
          >
            <Text style={styles.viewDetailsText}>View Profile</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderPlayerModal = () => {
    if (!selectedPlayer) return null;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalBg }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { 
                // background: `linear-gradient(135deg, ${getPositionColor(selectedPlayer.position)[0]}, ${getPositionColor(selectedPlayer.position)[1]})`
              }]}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
                
                <Image source={{ uri: selectedPlayer.avatar }} style={styles.modalAvatar} />
                <Text style={styles.modalPlayerName}>{selectedPlayer.name}</Text>
                <View style={[styles.modalNumberBadge, { backgroundColor: getPositionColor(selectedPlayer.position)[0] }]}>
                  <Text style={styles.modalNumberText}>#{selectedPlayer.number}</Text>
                </View>
              </View>

              {/* Detailed Stats */}
              <View style={styles.detailedStatsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Season Statistics</Text>
                <View style={styles.detailedStatsGrid}>
                  <View style={[styles.detailedStatCard, { backgroundColor: theme.statCardBg }]}>
                    <Text style={[styles.detailedStatValue, { color: theme.primary }]}>{selectedPlayer.goals}</Text>
                    <Text style={[styles.detailedStatLabel, { color: theme.subText }]}>Goals</Text>
                  </View>
                  <View style={[styles.detailedStatCard, { backgroundColor: theme.statCardBg }]}>
                    <Text style={[styles.detailedStatValue, { color: theme.secondary }]}>{selectedPlayer.assists}</Text>
                    <Text style={[styles.detailedStatLabel, { color: theme.subText }]}>Assists</Text>
                  </View>
                  <View style={[styles.detailedStatCard, { backgroundColor: theme.statCardBg }]}>
                    <Text style={[styles.detailedStatValue, { color: theme.accent }]}>{selectedPlayer.careerGoals}</Text>
                    <Text style={[styles.detailedStatLabel, { color: theme.subText }]}>Career</Text>
                  </View>
                </View>
              </View>

              {/* Past Teams */}
              <View style={styles.modalSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>🏟️ Previous Clubs</Text>
                <View style={styles.pastTeamsGrid}>
                  {selectedPlayer.pastTeams.map((team, index) => (
                    <View key={index} style={[styles.teamBadge, { backgroundColor: theme.statCardBg }]}>
                      <Text style={[styles.teamName, { color: theme.text }]}>{team}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Trophies */}
              <View style={styles.modalSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>🏆 Major Honours</Text>
                <View style={styles.trophiesGrid}>
                  {selectedPlayer.trophies.map((trophy, index) => (
                    <View key={index} style={[styles.trophyCard, { backgroundColor: theme.statCardBg }]}>
                      <Text style={[styles.trophyText, { color: theme.text }]}>{trophy}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      height: 120,
      backgroundColor: theme.primary,
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
    },
    headerPattern: {
      position: 'absolute',
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerCenter: {
      alignItems: 'center',
      flex: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.accent,
      letterSpacing: 1,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    headerSubtitle: {
      fontSize: 14,
      color: '#fff',
      marginTop: 4,
      opacity: 0.9,
    },
    // ✅ Removed theme toggle styles
    squadInfo: {
      margin: 20,
      padding: 20,
      borderRadius: 16,
      backgroundColor: theme.cardBackground,
      elevation: 8,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
    },
    squadTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
    },
    squadDescription: {
      fontSize: 14,
      color: theme.subText,
      lineHeight: 20,
    },
    playersList: {
      padding: 15,
      paddingBottom: 30,
    },
    row: {
      justifyContent: 'space-between',
      paddingHorizontal: 5,
    },
    playerCard: {
      width: (width - 40) / 2,
      marginBottom: 20,
      borderRadius: 20,
      overflow: 'hidden',
    },
    cardTouchable: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      elevation: 12,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      overflow: 'hidden',
      minHeight: 320,
    },
    cardBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    cardGlow: {
      position: 'absolute',
      top: -50,
      right: -50,
      width: 100,
      height: 100,
      borderRadius: 50,
      opacity: 0.3,
    },
    avatarSection: {
      alignItems: 'center',
      paddingTop: 20,
      paddingBottom: 15,
      position: 'relative',
    },
    avatarContainer: {
      position: 'relative',
    },
    playerAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 3,
      borderColor: theme.accent,
    },
    numberBadge: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    numberText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    nationalityFlag: {
      fontSize: 20,
      position: 'absolute',
      bottom: -5,
      left: 30,
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 2,
      borderColor: theme.borderColor,
      elevation: 2,
    },
    playerInfo: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      alignItems: 'center',
    },
    playerName: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 8,
      lineHeight: 20,
    },
    positionBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginBottom: 15,
      elevation: 2,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    positionText: {
      fontSize: 12,
      color: '#fff',
      fontWeight: '600',
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 15,
    },
    statCard: {
      width: '48%',
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    careerSection: {
      alignItems: 'center',
      marginBottom: 15,
    },
    ageText: {
      fontSize: 12,
      marginBottom: 4,
    },
    careerGoals: {
      fontSize: 13,
      fontWeight: '600',
    },
    viewDetailsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 25,
      elevation: 4,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    viewDetailsText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
      marginRight: 6,
    },
    arrowIcon: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      maxHeight: height * 0.85,
      borderRadius: 24,
      overflow: 'hidden',
      elevation: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
    },
    modalHeader: {
      alignItems: 'center',
      padding: 30,
      position: 'relative',
      backgroundColor: theme.primary,
    },
    closeButton: {
      position: 'absolute',
      top: 15,
      right: 15,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    modalAvatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 4,
      borderColor: '#fff',
      marginBottom: 16,
    },
    modalPlayerName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
      marginBottom: 10,
    },
    modalNumberBadge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    modalNumberText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    detailedStatsSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
    },
    detailedStatsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    detailedStatCard: {
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      minWidth: 90,
      elevation: 4,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    detailedStatValue: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    detailedStatLabel: {
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    modalSection: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    pastTeamsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    teamBadge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      elevation: 2,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    teamName: {
      fontSize: 13,
      fontWeight: '600',
    },
    trophiesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    trophyCard: {
      width: (width - 80) / 2,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
      elevation: 2,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    trophyText: {
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '500',
      lineHeight: 16,
    },
  });

  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.primary}
      />
      <View style={styles.container}>
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerPattern} />
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>FIRST TEAM</Text>
            <Text style={styles.headerSubtitle}>FC Barcelona 2024/25</Text>
          </View>
          
          {/* ✅ Removed theme toggle button completely */}
          <View style={{ width: 44 }} />
        </View>

        {/* Squad Information Card */}
        <View style={styles.squadInfo}>
          <Text style={styles.squadTitle}>First Team Squad</Text>
          <Text style={styles.squadDescription}>
            Meet our talented roster of world-class players representing FC Barcelona in the 2024/25 season.
          </Text>
        </View>

        {/* Players Grid */}
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={players}
            renderItem={renderPlayerCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.playersList}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.row}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
          />
        </Animated.View>

        {/* Player Details Modal */}
        {renderPlayerModal()}
      </View>
    </>
  );
};

export default SquadPlayers;
