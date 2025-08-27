import React from "react";
import { View, Text, Image, FlatList, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Match {
  id: string;
  type: string;
  date: string;
  opponent: string;
  stadium: string;
  city: string;
  capacity: string;
}

interface MatchCardProps {
  match: Match;
}

// The four random stadium images
const randomImages = [
  "https://ichef.bbci.co.uk/ace/standard/624/cpsprodpb/131B9/production/_88656287_barca1.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy3UD4aQ4Px3bW9mStJ2FC8tVye0kDiGnqyA&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAlyQaHzRfhUr9o_QZYBil-KaqmLferVS6RQ&s",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZnca7swtdCvrI0O-CxnMjQf8YACzqbkInYw&s"
];

const { width } = Dimensions.get('window');

// Fixture data (all home and away matches)
const matches = [
  { id: "1", type: "Away", date: "16 Aug", opponent: "Mallorca", stadium: "Son Moix", city: "Palma de Mallorca", capacity: "23,142" },
  { id: "2", type: "Away", date: "23 Aug", opponent: "Levante", stadium: "Ciutat de València", city: "Valencia", capacity: "26,354" },
  { id: "3", type: "Away", date: "31 Aug", opponent: "Rayo Vallecano", stadium: "Vallecas", city: "Madrid", capacity: "14,708" },
  { id: "4", type: "Away", date: "24 Sep", opponent: "Real Oviedo", stadium: "Carlos Tartiere", city: "Oviedo", capacity: "30,500" },
  { id: "5", type: "Away", date: "05 Oct", opponent: "Sevilla", stadium: "Ramón Sánchez Pizjuán", city: "Seville", capacity: "43,883" },
  { id: "6", type: "Away", date: "26 Oct", opponent: "Real Madrid", stadium: "Santiago Bernabéu", city: "Madrid", capacity: "81,044" },
  { id: "7", type: "Away", date: "09 Nov", opponent: "Celta Vigo", stadium: "Balaídos", city: "Vigo", capacity: "29,000" },
  { id: "8", type: "Away", date: "07 Dec", opponent: "Real Betis", stadium: "La Cartuja", city: "Seville", capacity: "57,619" },
  { id: "9", type: "Away", date: "21 Dec", opponent: "Villarreal", stadium: "Cerámica", city: "Villarreal", capacity: "23,500" },
  { id: "10", type: "Away", date: "04 Jan", opponent: "Espanyol", stadium: "RCDE Stadium", city: "Barcelona", capacity: "40,000" },
  { id: "11", type: "Away", date: "18 Jan", opponent: "Real Sociedad", stadium: "Anoeta", city: "San Sebastian", capacity: "39,500" },
  { id: "12", type: "Away", date: "01 Feb", opponent: "Elche", stadium: "Martínez-Valero", city: "Elche", capacity: "33,732" },
  { id: "13", type: "Away", date: "15 Feb", opponent: "Girona", stadium: "Montilivi", city: "Girona", capacity: "14,624" },
  { id: "14", type: "Away", date: "08 Mar", opponent: "Athletic Club", stadium: "San Mamés", city: "Bilbao", capacity: "53,289" },
  { id: "15", type: "Away", date: "05 Apr", opponent: "Atlético de Madrid", stadium: "Metropolitano", city: "Madrid", capacity: "68,456" },
  { id: "16", type: "Away", date: "19 Apr", opponent: "Getafe", stadium: "Coliseum Alfonso Pérez", city: "Getafe", capacity: "17,393" },
  { id: "17", type: "Away", date: "03 May", opponent: "Osasuna", stadium: "El Sadar", city: "Pamplona", capacity: "23,516" },
  { id: "18", type: "Away", date: "13 May", opponent: "Alavés", stadium: "Mendizorrotza", city: "Vitoria-Gasteiz", capacity: "19,840" },
  { id: "19", type: "Away", date: "24 May", opponent: "Valencia", stadium: "Mestalla", city: "Valencia", capacity: "49,430" },
  { id: "20", type: "Home", date: "14 Sep", opponent: "Valencia", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "21", type: "Home", date: "21 Sep", opponent: "Getafe", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "22", type: "Home", date: "28 Sep", opponent: "Real Sociedad", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "23", type: "Home", date: "19 Oct", opponent: "Girona", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "24", type: "Home", date: "02 Nov", opponent: "Elche", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "25", type: "Home", date: "23 Nov", opponent: "Athletic Club", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "26", type: "Home", date: "30 Nov", opponent: "Alavés", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "27", type: "Home", date: "14 Dec", opponent: "Osasuna", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "28", type: "Home", date: "11 Jan", opponent: "Atlético de Madrid", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "29", type: "Home", date: "25 Jan", opponent: "Real Oviedo", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "30", type: "Home", date: "08 Feb", opponent: "Mallorca", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "31", type: "Home", date: "22 Feb", opponent: "Levante", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "32", type: "Home", date: "01 Mar", opponent: "Villarreal", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "33", type: "Home", date: "15 Mar", opponent: "Sevilla", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "34", type: "Home", date: "22 Mar", opponent: "Rayo Vallecano", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "35", type: "Home", date: "12 Apr", opponent: "Espanyol", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "36", type: "Home", date: "22 Apr", opponent: "Celta Vigo", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "37", type: "Home", date: "10 May", opponent: "Real Madrid", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
  { id: "38", type: "Home", date: "17 May", opponent: "Real Betis", stadium: "Camp Nou", city: "Barcelona", capacity: "99,354" },
];

const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const img = randomImages[parseInt(match.id) % randomImages.length];
  const isHome = match.type.toLowerCase() === 'home';
  return (
    <View style={styles.card}>
      <View>
        <Image source={{ uri: img }} style={styles.stadiumImage} />
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.5)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.imageOverlay}
        />
        <View style={[styles.badge, { backgroundColor: isHome ? '#004D98' : '#A50044' }]}>
          <Text style={styles.badgeText}>{match.type}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.date}>{match.date}</Text>
        <Text style={styles.opponent}>vs {match.opponent}</Text>
        <Text style={styles.stadium}>{match.stadium}</Text>
        <Text style={styles.details}>
          {match.city} • Capacity: {match.capacity}
        </Text>
      </View>
    </View>
  );
};

const MatchesScreen: React.FC = () => (
  <LinearGradient
    colors={["#0B1F48", "#004D98", "#A50044"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={styles.gradientBg}
  >
    <FlatList
      data={matches}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MatchCard match={item} />}
      contentContainerStyle={styles.list}
      ListHeaderComponent={() => (
        <LinearGradient
          colors={["#A50044", "#7A0033", "#004D98"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Fixtures</Text>
          <Text style={styles.headerSub}>2025 • La Liga & Cups</Text>
        </LinearGradient>
      )}
      showsVerticalScrollIndicator={false}
    />
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 1,
  },
  headerSub: {
    marginTop: 6,
    color: '#fff',
    opacity: 0.85,
  },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  stadiumImage: { width: '100%', height: Math.max(180, width * 0.45) },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  info: { padding: 14 },
  date: { fontSize: 13, color: '#666' },
  opponent: { fontSize: 18, fontWeight: '800', marginTop: 4, color: '#0B1F48' },
  stadium: { fontSize: 15, marginTop: 6, color: '#333' },
  details: { fontSize: 13, color: '#666', marginTop: 4 },
});

export default MatchesScreen;
