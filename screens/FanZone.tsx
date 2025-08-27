import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Types for Fan Zone activities
interface Activity {
  id: number;
  title: string;
  icon: string;
  color: string;
  description: string;
  points: string;
}

const FanZone = ({ navigation }: any) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [fanScore, setFanScore] = useState(2847);

  const barcaColors = {
    blue: '#004D98',
    claret: '#A50044',
    yellow: '#FFD700',
    white: '#FFFFFF'
  };

  // Fan Zone Activities
  const fanActivities: Activity[] = [
    {
      id: 1,
      title: 'Penalty Shootout',
      icon: '⚽',
      color: '#4CAF50',
      description: 'Test your penalty skills against legendary goalkeepers',
      points: '+50 points'
    },
    {
      id: 2,
      title: 'Barça Quiz',
      icon: '🧠',
      color: '#FF9800',
      description: 'Challenge your knowledge about FC Barcelona history',
      points: '+30 points'
    },
    {
      id: 3,
      title: 'Match Predictor',
      icon: '🔮',
      color: '#9C27B0',
      description: 'Predict upcoming match results and win rewards',
      points: '+25 points'
    },
    {
      id: 4,
      title: 'Fan Gallery',
      icon: '📸',
      color: '#F44336',
      description: 'Share your best Barça moments and photos',
      points: '+20 points'
    },
    {
      id: 5,
      title: 'Live Polls',
      icon: '📊',
      color: '#2196F3',
      description: 'Vote on team decisions and match predictions',
      points: '+15 points'
    },
    {
      id: 6,
      title: 'Fan Stories',
      icon: '📚',
      color: '#607D8B',
      description: 'Share your memorable Barcelona experiences',
      points: '+40 points'
    }
  ];

  // Latest Fan Activities
  const recentActivities = [
    {
      id: 1,
      user: 'Carlos_Barca',
      activity: 'scored 8/10 in penalty shootout',
      time: '2 hours ago',
      points: 50
    },
    {
      id: 2,
      user: 'Maria_Culé',
      activity: 'predicted Barça 3-1 victory correctly',
      time: '5 hours ago',
      points: 75
    },
    {
      id: 3,
      user: 'Ahmed_FCB',
      activity: 'shared amazing Camp Nou photo',
      time: '1 day ago',
      points: 25
    }
  ];

  const handleActivityPress = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  const participateInActivity = () => {
    setFanScore(fanScore + 50);
    setShowModal(false);
    Alert.alert('Success!', `You earned 50 fan points! 🎉\nTotal Points: ${fanScore + 50}`);
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
            <Text style={styles.headerTitle}>Fan Zone</Text>
          </View>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>{fanScore}</Text>
            <Text style={styles.pointsLabel}>Points</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          
          {/* Welcome Banner */}
          <LinearGradient
            colors={[barcaColors.claret, barcaColors.blue]}
            style={styles.welcomeBanner}
          >
            <Text style={styles.welcomeTitle}>Welcome, Culé! 🔵🔴</Text>
            <Text style={styles.welcomeText}>
              Engage with fellow fans and earn rewards for your loyalty!
            </Text>
          </LinearGradient>

          {/* Activities Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚡ Fan Activities</Text>
            <View style={styles.activitiesGrid}>
              {fanActivities.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[styles.activityCard, { borderLeftColor: activity.color }]}
                  onPress={() => handleActivityPress(activity)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.activityIcon}>{activity.icon}</Text>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityPoints}>{activity.points}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity Feed */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Recent Fan Activity</Text>
            {recentActivities.map((item) => (
              <View key={item.id} style={styles.activityFeedCard}>
                <View style={styles.activityFeedContent}>
                  <Text style={styles.userName}>@{item.user}</Text>
                  <Text style={styles.userActivity}>{item.activity}</Text>
                  <Text style={styles.activityTime}>{item.time}</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsBadgeText}>+{item.points}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Fan Challenges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏆 Weekly Challenges</Text>
            <View style={styles.challengeCard}>
              <LinearGradient
                colors={[barcaColors.yellow, '#FFA726']}
                style={styles.challengeGradient}
              >
                <Text style={styles.challengeTitle}>Score 1000 Points This Week!</Text>
                <Text style={styles.challengeDescription}>
                  Complete activities and earn exclusive Barça rewards
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: '65%' }]} />
                </View>
                <Text style={styles.progressText}>650 / 1000 points</Text>
              </LinearGradient>
            </View>
          </View>

        </ScrollView>

        {/* Activity Modal */}
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedActivity ? (
                <>
                  <Text style={styles.modalIcon}>{selectedActivity.icon}</Text>
                  <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
                  <Text style={styles.modalDescription}>
                    {selectedActivity.description}
                  </Text>
                  <Text style={styles.modalPoints}>Earn {selectedActivity.points}</Text>
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.participateButton}
                      onPress={participateInActivity}
                    >
                      <Text style={styles.participateText}>Participate Now!</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowModal(false)}
                    >
                      <Text style={styles.cancelText}>Maybe Later</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        </Modal>

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
  pointsContainer: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  welcomeBanner: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  activityPoints: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  activityFeedCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityFeedContent: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#004D98',
    marginBottom: 2,
  },
  userActivity: {
    fontSize: 13,
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#666',
  },
  pointsBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  challengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  challengeGradient: {
    padding: 20,
    alignItems: 'center',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: width - 48,
    elevation: 10,
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalPoints: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 24,
  },
  modalButtons: {
    width: '100%',
  },
  participateButton: {
    backgroundColor: '#004D98',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  participateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 14,
  },
});

export default FanZone;
