import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SettingsScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [dataSync, setDataSync] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const resetToDefault = () => {
    setDarkMode(false);
    setNotifications(true);
    setSoundEnabled(true);
    setLocationAccess(false);
    setBiometricAuth(false);
    setDataSync(true);
    setPrivacyMode(false);
    setAutoUpdate(true);
  };

  type SettingItemProps = {
    title: string;
    subtitle?: string;
    value: boolean;
    onToggle: () => void;
  };

  const SettingItem: React.FC<SettingItemProps> = ({ title, subtitle, value, onToggle }) => (
    <View style={styles.itemRow}>
      <View style={styles.itemTextWrap}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onToggle} thumbColor={value ? '#FFD700' : '#f4f3f4'} trackColor={{ false: '#d1d5db', true: '#004D98' }} />
    </View>
  );

  type ActionItemProps = {
    title: string;
    subtitle?: string;
    onPress: () => void;
    variant?: 'default' | 'danger';
  };

  const ActionItem: React.FC<ActionItemProps> = ({ title, subtitle, onPress, variant = 'default' }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.actionRow}>
      <View>
        <Text style={[styles.actionTitle, variant === 'danger' && { color: '#B91C1C' }]}>{title}</Text>
        {subtitle ? <Text style={styles.actionSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.chevron}>{'>'}</Text>
    </TouchableOpacity>
  );

  const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View>{children}</View>
    </View>
  );

  return (
    <LinearGradient
      colors={["#0B1F48", "#004D98", "#A50044"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradientBg}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#A50044", "#7A0033", "#004D98"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSub}>Manage your preferences</Text>
        </LinearGradient>

        <SectionCard title="Display & Appearance">
          <SettingItem
            title="Dark Mode"
            subtitle="Use dark theme across the app"
            value={darkMode}
            onToggle={() => setDarkMode(!darkMode)}
          />
        </SectionCard>

        <SectionCard title="Notifications">
          <SettingItem
            title="Push Notifications"
            subtitle="Receive important updates"
            value={notifications}
            onToggle={() => setNotifications(!notifications)}
          />
          <SettingItem
            title="Sound & Haptics"
            subtitle="Enable notification sounds"
            value={soundEnabled}
            onToggle={() => setSoundEnabled(!soundEnabled)}
          />
        </SectionCard>

        <SectionCard title="Privacy & Security">
          <SettingItem
            title="Biometric Lock"
            subtitle="Secure app with Touch/Face ID"
            value={biometricAuth}
            onToggle={() => setBiometricAuth(!biometricAuth)}
          />
          <SettingItem
            title="Privacy Mode"
            subtitle="Hide sensitive information"
            value={privacyMode}
            onToggle={() => setPrivacyMode(!privacyMode)}
          />
          <SettingItem
            title="Location Services"
            subtitle="Allow location-based features"
            value={locationAccess}
            onToggle={() => setLocationAccess(!locationAccess)}
          />
        </SectionCard>

        <SectionCard title="Data & Sync">
          <SettingItem
            title="Cloud Sync"
            subtitle="Sync data across your devices"
            value={dataSync}
            onToggle={() => setDataSync(!dataSync)}
          />
          <SettingItem
            title="Auto Updates"
            subtitle="Keep the app up to date"
            value={autoUpdate}
            onToggle={() => setAutoUpdate(!autoUpdate)}
          />
        </SectionCard>

        <SectionCard title="Account & Support">
          <ActionItem
            title="Account Settings"
            subtitle="Manage your account details"
            onPress={() => console.log('Account settings')}
          />
          <ActionItem
            title="Help & Support"
            subtitle="Get help or contact us"
            onPress={() => console.log('Help & Support')}
          />
          <ActionItem
            title="About"
            subtitle="App version 2.1.0"
            onPress={() => console.log('About')}
          />
        </SectionCard>

        <TouchableOpacity style={styles.resetBtn} activeOpacity={0.8} onPress={resetToDefault}>
          <Text style={styles.resetBtnText}>Reset to Defaults</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}> 2025 Your App Name. All rights reserved.</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 16,
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
    opacity: 0.9,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B1F48',
  },
  itemRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTextWrap: { flex: 1, paddingRight: 12 },
  itemTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  itemSubtitle: { marginTop: 4, fontSize: 13, color: '#6B7280' },
  actionRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
  actionSubtitle: { marginTop: 4, fontSize: 13, color: '#6B7280' },
  chevron: { fontSize: 16, color: '#9CA3AF' },
  resetBtn: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  resetBtnText: { fontWeight: '700', color: '#374151' },
  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { color: '#E5E7EB', fontSize: 12 },
});

export default SettingsScreen;