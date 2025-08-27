import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

const Home = ({ navigation, route }: any) => {
    const { id } = route.params;
    console.log(id);
  const clubHistory = [
    { year: '1899', event: 'FC Barcelona founded by Joan Gamper' },
    { year: '1957', event: 'First European Cup final appearance' },
    { year: '1992', event: 'First European Cup victory at Wembley' },
    { year: '2009', event: 'Historic treble under Pep Guardiola' },
    { year: '2015', event: 'Second treble achievement' },
  ];

  const legends = [
    { name: 'Lionel Messi', position: 'Forward', years: '2004-2021' },
    { name: 'Xavi Hernández', position: 'Midfielder', years: '1998-2015' },
    { name: 'Andrés Iniesta', position: 'Midfielder', years: '2002-2018' },
    { name: 'Ronaldinho', position: 'Forward', years: '2003-2008' },
    { name: 'Puyol', position: 'Defender', years: '1999-2014' },
  ];

  const campNouFacts = [
    'Capacity: 99,354 (largest in Europe)',
    'Opened: September 24, 1957',
    'Original name: Estadi del FC Barcelona',
    'Renovation: €600M project planned',
    'Record attendance: 120,000 vs Real Madrid (1986)',
  ];

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#A50044" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>FC Barcelona</Text>
          <Text style={styles.subtitle}>Més que un club</Text>
          <Text style={styles.motto}>More than a club since 1899</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>125+</Text>
            <Text style={styles.statLabel}>Years</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>27</Text>
            <Text style={styles.statLabel}>La Liga</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Champions League</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>31</Text>
            <Text style={styles.statLabel}>Copa del Rey</Text>
          </View>
        </View>

        {/* Club History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏛️ Club History</Text>
          <View style={styles.historyContainer}>
            {clubHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.yearBadge}>
                  <Text style={styles.yearText}>{item.year}</Text>
                </View>
                <Text style={styles.eventText}>{item.event}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Legends Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Club Legends</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {legends.map((player, index) => (
              <View key={index} style={styles.playerCard}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerPosition}>{player.position}</Text>
                <Text style={styles.playerYears}>{player.years}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Camp Nou Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏟️ Camp Nou</Text>
          <View style={styles.stadiumContainer}>
            <Text style={styles.stadiumIntro}>
              The iconic home of FC Barcelona, Camp Nou is a fortress of football history.
            </Text>
            {campNouFacts.map((fact, index) => (
              <View key={index} style={styles.factItem}>
                <Text style={styles.factBullet}>•</Text>
                <Text style={styles.factText}>{fact}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next Match */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚽ Next Match</Text>
          <View style={styles.matchCard}>
            <View style={styles.matchHeader}>
              <Text style={styles.matchTitle}>El Clásico</Text>
              <Text style={styles.matchDate}>August 20, 2025</Text>
            </View>
            <View style={styles.matchDetails}>
              <Text style={styles.matchTeams}>FC Barcelona vs Real Madrid</Text>
              <Text style={styles.matchTime}>20:45 CET</Text>
              <Text style={styles.matchVenue}>📍 Camp Nou, Barcelona</Text>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Join the Culé Family?</Text>
          <Text style={styles.ctaSubtitle}>Get exclusive content, match updates, and more!</Text>
          
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 FC Barcelona. All rights reserved.</Text>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A50044',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: 5,
    textAlign: 'center',
  },
  motto: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
    minWidth: 70,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  historyContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  yearBadge: {
    backgroundColor: '#004D98',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 15,
  },
  yearText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  eventText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    width: 140,
  },
  playerName: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  playerPosition: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 3,
  },
  playerYears: {
    color: '#ddd',
    fontSize: 12,
  },
  stadiumContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  stadiumIntro: {
    color: '#fff',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 15,
    textAlign: 'center',
  },
  factItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  factBullet: {
    color: '#FFD700',
    fontSize: 16,
    marginRight: 10,
  },
  factText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  matchHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  matchDate: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  matchDetails: {
    alignItems: 'center',
  },
  matchTeams: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  matchTime: {
    fontSize: 16,
    color: '#FFD700',
    marginBottom: 5,
  },
  matchVenue: {
    fontSize: 14,
    color: '#ddd',
  },
  ctaSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 40,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  getStartedButton: {
    backgroundColor: '#004D98',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#ddd',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default Home;