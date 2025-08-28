import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const barcaColors = {
  blue: '#004D98',
  claret: '#A50044',
  yellow: '#FFD700',
  white: '#fff'
}

const News = ({ navigation }: any) => {
  const [articles, setArticles] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/posts')
      .then((response) => {
        setArticles(response.data.slice(0, 16)); // Just a few for demo
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
  }, []);

  return (
    <LinearGradient colors={[barcaColors.blue, barcaColors.claret]} style={styles.gradientBg}>
      <StatusBar barStyle="light-content" backgroundColor={barcaColors.claret} />

      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={barcaColors.yellow} />
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerText}>FC Barcelona News</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={barcaColors.yellow} size="large" />
            <Text style={styles.loadingText}>Loading Barcelona News...</Text>
          </View>
        ) : (
          articles.map((item: any, idx: any) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[
                styles.card,
                { 
                  borderLeftColor: idx % 2 === 0 ? barcaColors.claret : barcaColors.blue,
                  backgroundColor: barcaColors.white 
                }
              ]}
            >
              <Image
                source={{ uri: `https://source.unsplash.com/collection/2114451/600x400?sig=${item.id}` }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>
                  {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
                </Text>
                <Text numberOfLines={3} style={styles.cardText}>
                  {item.body}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.readMore}>Read more →</Text>
                  <Text style={styles.timeStamp}>2 hours ago</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(165,0,68,0.96)',
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10
  },
  headerText: {
    fontSize: 21,
    fontWeight: 'bold',
    color: barcaColors.yellow,
    letterSpacing: 1,
    flex: 1,
  },
  container: {
    padding: 14,
    paddingBottom: 28
  },
  loader: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    color: barcaColors.yellow,
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    borderLeftWidth: 6,
    shadowColor: '#41204D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden'
  },
  cardImage: {
    width: '100%',
    height: width * 0.42,
    backgroundColor: '#EFEFEF'
  },
  cardContent: {
    padding: 14
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: barcaColors.blue,
    marginBottom: 8,
    lineHeight: 24,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  readMore: {
    color: barcaColors.claret,
    fontSize: 14,
    fontWeight: '600',
  },
  timeStamp: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default News;
