import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, StatusBar, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
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

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>FC Barcelona News</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {loading ? (
          <View style={styles.loader}><ActivityIndicator color={barcaColors.yellow} size="large" /></View>
        ) : (
          articles.map((item:any, idx:any) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              style={[
                styles.card,
                { 
                  borderLeftColor: idx%2 === 0 ? barcaColors.claret : barcaColors.blue,
                  backgroundColor: barcaColors.white 
                }
              ]}
            >
              <Image
                source={{ uri: `https://source.unsplash.com/collection/2114451/600x400?sig=${item.id}` }}
                style={styles.cardImage}
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title.charAt(0).toUpperCase() + item.title.slice(1)}</Text>
                <Text numberOfLines={3} style={styles.cardText}>{item.body}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(165,0,68,0.96)',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    elevation: 2
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
    letterSpacing: 1
  },
  container: {
    padding: 14,
    paddingBottom: 28
  },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    marginBottom: 5,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginTop: 18,
    backgroundColor: barcaColors.blue,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  backBtnText: {
    color: barcaColors.yellow,
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default News;
