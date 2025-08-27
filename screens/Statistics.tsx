import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Explicit types to satisfy TypeScript strict mode
type PlayerName = 'Lewandowski' | 'Pedri' | 'ter Stegen';

const Statistics = ({ navigation }: any) => {
  const [selectedTab, setSelectedTab] = useState('Team');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerName>('Lewandowski');

  const barcaColors = {
    blue: '#004D98',
    claret: '#A50044',
    yellow: '#FFD700',
    white: '#FFFFFF'
  };

  // Tab options
  const tabs = ['Team', 'Players', 'Historical', 'Compare'];

  // Team Statistics Data
  const teamStats = [
    { title: 'League Position', value: '2nd', icon: '🏆', trend: '+1' },
    { title: 'Points', value: '68', icon: '⚽', trend: '+3' },
    { title: 'Goals Scored', value: '89', icon: '🥅', trend: '+12' },
    { title: 'Goals Conceded', value: '32', icon: '🛡️', trend: '-8' },
    { title: 'Win Rate', value: '74%', icon: '📊', trend: '+5%' },
    { title: 'Clean Sheets', value: '18', icon: '🥅', trend: '+4' },
  ];

  // Player Statistics
  const playerStats = {
    'Lewandowski': {
      position: 'Forward',
      image: 'https://img.a.transfermarkt.technology/portrait/big/38253-1668680491.jpg?lm=1',
      stats: [
        { label: 'Goals', value: '28', max: 35 },
        { label: 'Assists', value: '8', max: 15 },
        { label: 'Shots/Game', value: '4.2', max: 6 },
        { label: 'Pass Accuracy', value: '85%', max: 100 },
        { label: 'Dribbles/Game', value: '1.8', max: 5 },
        { label: 'Rating', value: '8.4', max: 10 },
      ]
    },
    'Pedri': {
      position: 'Midfielder',
      image: 'https://img.a.transfermarkt.technology/portrait/big/636629-1661605825.jpg?lm=1',
      stats: [
        { label: 'Goals', value: '5', max: 35 },
        { label: 'Assists', value: '12', max: 15 },
        { label: 'Pass Accuracy', value: '92%', max: 100 },
        { label: 'Key Passes/Game', value: '2.4', max: 5 },
        { label: 'Tackles/Game', value: '1.6', max: 5 },
        { label: 'Rating', value: '8.1', max: 10 },
      ]
    },
    'ter Stegen': {
      position: 'Goalkeeper',
      image: 'https://img.a.transfermarkt.technology/portrait/big/74023-1668684867.jpg?lm=1',
      stats: [
        { label: 'Clean Sheets', value: '18', max: 25 },
        { label: 'Saves', value: '89', max: 150 },
        { label: 'Save %', value: '78%', max: 100 },
        { label: 'Goals Conceded', value: '32', max: 50 },
        { label: 'Passes/Game', value: '35', max: 50 },
        { label: 'Rating', value: '7.8', max: 10 },
      ]
    }
  };

  // Recent Matches Data
  const recentMatches = [
    { opponent: 'Real Madrid', result: 'W', score: '3-2', date: 'Mar 20' },
    { opponent: 'PSG', result: 'W', score: '2-1', date: 'Mar 15' },
    { opponent: 'Atletico', result: 'D', score: '1-1', date: 'Mar 10' },
    { opponent: 'Valencia', result: 'W', score: '4-0', date: 'Mar 5' },
    { opponent: 'Sevilla', result: 'W', score: '2-1', date: 'Mar 1' },
  ];

  // Historical Records
  const historicalStats = [
    { title: 'La Liga Titles', value: '27', icon: '🏆' },
    { title: 'Champions League', value: '5', icon: '🏆' },
    { title: 'Copa del Rey', value: '31', icon: '🏆' },
    { title: 'All-time Goals', value: '4,892', icon: '⚽' },
    { title: 'Camp Nou Capacity', value: '99,354', icon: '🏟️' },
    { title: 'Founded', value: '1899', icon: '📅' },
  ];

  // Top Players comparison
  const topPlayers: PlayerName[] = ['Lewandowski', 'Pedri', 'ter Stegen'];

  const renderProgressBar = (value: string | number, max: number, color: string = barcaColors.blue) => {
    const percentage = Math.min((parseFloat(String(value)) / max) * 100, 100);
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderTeamStats = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🏆 Season Overview</Text>
      <View style={styles.statsGrid}>
        {teamStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
            <Text style={[styles.statTrend, { color: stat.trend.startsWith('+') ? '#4CAF50' : '#F44336' }]}>
              {stat.trend}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>📊 Recent Form</Text>
      <View style={styles.formContainer}>
        {recentMatches.map((match, index) => (
          <View key={index} style={styles.matchCard}>
            <View style={styles.matchInfo}>
              <Text style={styles.opponent}>vs {match.opponent}</Text>
              <Text style={styles.matchDate}>{match.date}</Text>
            </View>
            <View style={styles.matchResult}>
              <View style={[
                styles.resultBadge,
                { backgroundColor: match.result === 'W' ? '#4CAF50' : match.result === 'D' ? '#FF9800' : '#F44336' }
              ]}>
                <Text style={styles.resultText}>{match.result}</Text>
              </View>
              <Text style={styles.matchScore}>{match.score}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPlayerStats = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>⭐ Player Statistics</Text>
      
      {/* Player Selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playerSelection}>
        {topPlayers.map((player) => (
          <TouchableOpacity
            key={player}
            style={[
              styles.playerTab,
              selectedPlayer === player && styles.selectedPlayerTab
            ]}
            onPress={() => setSelectedPlayer(player)}
          >
            <Image 
              source={{ uri: playerStats[player].image }} 
              style={styles.playerTabImage}
            />
            <Text style={[
              styles.playerTabText,
              selectedPlayer === player && styles.selectedPlayerTabText
            ]}>
              {player}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected Player Stats */}
      {selectedPlayer && (
        <View style={styles.playerStatsContainer}>
          <View style={styles.playerHeader}>
            <Image 
              source={{ uri: playerStats[selectedPlayer].image }} 
              style={styles.playerImage}
            />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{selectedPlayer}</Text>
              <Text style={styles.playerPosition}>{playerStats[selectedPlayer].position}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            {playerStats[selectedPlayer].stats.map((stat, index) => (
              <View key={index} style={styles.statRow}>
                <View style={styles.statRowHeader}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statRowValue}>{stat.value}</Text>
                </View>
                {renderProgressBar(stat.value, stat.max)}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderHistoricalStats = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🏛️ Club Legacy</Text>
      <View style={styles.statsGrid}>
        {historicalStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>📈 El Clásico Record</Text>
      <View style={styles.clasicoContainer}>
        <LinearGradient
          colors={[barcaColors.blue, barcaColors.claret]}
          style={styles.clasicoCard}
        >
          <Text style={styles.clasicoTitle}>Barcelona vs Real Madrid</Text>
          <View style={styles.clasicoStats}>
            <View style={styles.clasicoStat}>
              <Text style={styles.clasicoValue}>98</Text>
              <Text style={styles.clasicoLabel}>Wins</Text>
            </View>
            <View style={styles.clasicoStat}>
              <Text style={styles.clasicoValue}>52</Text>
              <Text style={styles.clasicoLabel}>Draws</Text>
            </View>
            <View style={styles.clasicoStat}>
              <Text style={styles.clasicoValue}>100</Text>
              <Text style={styles.clasicoLabel}>Losses</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderCompareStats = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>⚔️ Player Comparison</Text>
      
      <View style={styles.comparisonContainer}>
        <View style={styles.comparisonHeader}>
          <View style={styles.comparisonPlayer}>
            <Image source={{ uri: playerStats['Lewandowski'].image }} style={styles.compareImage} />
            <Text style={styles.comparePlayerName}>Lewandowski</Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.comparisonPlayer}>
            <Image source={{ uri: playerStats['Pedri'].image }} style={styles.compareImage} />
            <Text style={styles.comparePlayerName}>Pedri</Text>
          </View>
        </View>

        <View style={styles.comparisonStats}>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonStatValue}>28</Text>
            <Text style={styles.comparisonStatLabel}>Goals</Text>
            <Text style={styles.comparisonStatValue}>5</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonStatValue}>8</Text>
            <Text style={styles.comparisonStatLabel}>Assists</Text>
            <Text style={styles.comparisonStatValue}>12</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonStatValue}>85%</Text>
            <Text style={styles.comparisonStatLabel}>Pass Accuracy</Text>
            <Text style={styles.comparisonStatValue}>92%</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonStatValue}>8.4</Text>
            <Text style={styles.comparisonStatLabel}>Average Rating</Text>
            <Text style={styles.comparisonStatValue}>8.1</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Team': return renderTeamStats();
      case 'Players': return renderPlayerStats();
      case 'Historical': return renderHistoricalStats();
      case 'Compare': return renderCompareStats();
      default: return renderTeamStats();
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={barcaColors.claret} />
      <LinearGradient colors={[barcaColors.blue, barcaColors.claret]} style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={barcaColors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Statistics</Text>
          </View>
          
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={20} color={barcaColors.white} />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  selectedTab === tab && styles.activeTabButton
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  selectedTab === tab && styles.activeTabText
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>

      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  filterButton: {
    padding: 8,
  },
  tabNavigation: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTabButton: {
    backgroundColor: '#FFD700',
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#004D98',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004D98',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  statTrend: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 24,
  },
  matchCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  matchInfo: {
    flex: 1,
  },
  opponent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  matchDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  matchResult: {
    alignItems: 'flex-end',
  },
  resultBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchScore: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  playerSelection: {
    marginBottom: 16,
  },
  playerTab: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedPlayerTab: {
    backgroundColor: '#FFD700',
  },
  playerTabImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  playerTabText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedPlayerTabText: {
    color: '#004D98',
  },
  playerStatsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  playerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  playerPosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    marginTop: 8,
  },
  statRow: {
    marginBottom: 16,
  },
  statRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  statRowValue: {
    fontSize: 14,
    color: '#004D98',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  clasicoContainer: {
    marginBottom: 24,
  },
  clasicoCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  clasicoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  clasicoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  clasicoStat: {
    alignItems: 'center',
  },
  clasicoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  clasicoLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 4,
  },
  comparisonContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  comparisonPlayer: {
    alignItems: 'center',
    flex: 1,
  },
  compareImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  comparePlayerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 16,
  },
  comparisonStats: {
    marginTop: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  comparisonStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004D98',
    flex: 1,
    textAlign: 'center',
  },
  comparisonStatLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 2,
    textAlign: 'center',
  },
});

export default Statistics;
