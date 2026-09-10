import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Theme';
import { Api, UserProfile } from '../../services/api';
import { NotificationService } from '../../services/notifications';

// Custom Elite Toggle Component matching Engram website luxury aesthetics
interface EliteToggleProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

const EliteToggle: React.FC<EliteToggleProps> = ({ value, onValueChange, disabled }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={[
        styles.toggleTrack,
        value ? styles.toggleTrackActive : styles.toggleTrackInactive,
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          value ? styles.toggleThumbActive : styles.toggleThumbInactive,
        ]}
      />
    </TouchableOpacity>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    setLoading(true);
    try {
      const [data, notifActive] = await Promise.all([
        Api.getProfile(),
        NotificationService.isEnabled(),
      ]);
      setProfile(data);
      setNotificationsEnabled(notifActive);
    } catch (e) {
      console.log('Error loading profile', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (newVal: boolean) => {
    Haptics.selectionAsync();
    if (newVal) {
      const success = await NotificationService.scheduleDailyReminder();
      if (success) {
        setNotificationsEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await NotificationService.sendTestNotification();
      } else {
        setNotificationsEnabled(false);
        Alert.alert(
          'Notification Permission',
          'Please enable notifications for Engram in your phone settings to receive daily recall prompt reps at standup time.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else {
      await NotificationService.cancelDailyReminder();
      setNotificationsEnabled(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCopyApiKey = async () => {
    if (profile?.apiKey) {
      await Clipboard.setStringAsync(profile.apiKey);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Engram?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await Api.deleteAccount(); // clears local session
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      'This action is irreversible. All your recorded prompt history, daily practice reps, evaluations, and streak telemetry will be permanently wiped from Engram servers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              await Api.deleteAccount();
              Alert.alert(
                'Account Deleted',
                'Your Engram account and personal data have been completely purged.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/(auth)/login'),
                  },
                ]
              );
            } catch (e) {
              Alert.alert('Error', 'Unable to delete account at this time.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const openUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Manage telemetry ingestion keys, notifications, and privacy compliance.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <>
            {/* Engineer Identity Card */}
            <View style={styles.card}>
              <Text style={styles.cardSectionLabel}>ENGINEER PROFILE</Text>
              <View style={styles.profileRow}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {(profile?.name || 'E').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile?.name || 'Engineer'}</Text>
                  <Text style={styles.profileEmail}>{profile?.email || 'No email registered'}</Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>CURRENT TRACK</Text>
                  <Text style={styles.metaValue}>{(profile?.currentLevel || 'SDE1').toUpperCase()}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>TARGET BENCHMARK</Text>
                  <Text style={[styles.metaValue, { color: Colors.accent }]}>
                    {(profile?.targetLevel || 'SDE2').toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Ingestion API Key Card */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardSectionLabel}>TELEMETRY INGESTION KEY</Text>
                <Feather name="key" size={14} color={Colors.accent} />
              </View>
              <Text style={styles.cardDescription}>
                Use this token with the Engram CLI or MCP extension to capture your coding sessions into active recall questions.
              </Text>

              <View style={styles.keyContainer}>
                <Text style={styles.keyText} numberOfLines={1}>
                  {profile?.apiKey || 'eng_live_sample_token'}
                </Text>
                <TouchableOpacity
                  style={[styles.copyPill, copiedKey && styles.copiedPill]}
                  onPress={handleCopyApiKey}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={copiedKey ? 'check' : 'copy'}
                    size={12}
                    color={copiedKey ? Colors.success : Colors.black}
                  />
                  <Text style={[styles.copyPillText, copiedKey && { color: Colors.success }]}>
                    {copiedKey ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cliHint}>
                Install CLI: <Text style={{ color: Colors.textPrimary }}>npm install -g engram-recall</Text>
              </Text>
            </View>

            {/* Notification Preferences with Custom Elite Toggle */}
            <View style={styles.card}>
              <Text style={styles.cardSectionLabel}>PREFERENCES</Text>
              <View style={styles.preferenceRow}>
                <View style={styles.prefTextContainer}>
                  <Text style={styles.prefTitle}>Daily Recall Reminders</Text>
                  <Text style={styles.prefSub}>
                    Receive prompt reps at your configured standup time (6:00 PM)
                  </Text>
                </View>
                <EliteToggle
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                />
              </View>
            </View>

            {/* Legal & Google Play Store Compliance */}
            <View style={styles.card}>
              <Text style={styles.cardSectionLabel}>PRIVACY & COMPLIANCE</Text>
              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => openUrl('https://engram.bamacharan.com/privacy')}
                activeOpacity={0.7}
              >
                <View style={styles.legalRowLeft}>
                  <Feather name="shield" size={15} color={Colors.textSecondary} />
                  <Text style={styles.legalText}>Official Privacy Policy</Text>
                </View>
                <Feather name="arrow-up-right" size={14} color={Colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.legalDivider} />

              <TouchableOpacity
                style={styles.legalRow}
                onPress={() => openUrl('https://engram.bamacharan.com/delete-account')}
                activeOpacity={0.7}
              >
                <View style={styles.legalRowLeft}>
                  <Feather name="globe" size={15} color={Colors.textSecondary} />
                  <Text style={styles.legalText}>Web Account Deletion Portal</Text>
                </View>
                <Feather name="arrow-up-right" size={14} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Account Actions / Mandatory Deletion */}
            <View style={styles.dangerZoneCard}>
              <Text style={styles.dangerZoneTitle}>ACCOUNT CONTROL</Text>

              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
                activeOpacity={0.8}
              >
                <Feather name="log-out" size={14} color={Colors.textPrimary} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>

              {/* Mandatory In-App Account Deletion Button */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                {isDeleting ? (
                  <ActivityIndicator color={Colors.danger} size="small" />
                ) : (
                  <>
                    <Feather name="trash-2" size={14} color={Colors.danger} />
                    <Text style={styles.deleteButtonText}>Permanently Delete Account & Data</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.versionText}>Engram Mobile v1.0.0 (Build 1) • Production</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 18,
  },
  cardSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accent,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.bgPrimary,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 3,
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgPrimary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  keyText: {
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: Colors.accent,
    marginRight: 10,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
  },
  copiedPill: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  copyPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.black,
  },
  cliHint: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 10,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prefTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  prefSub: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 3,
    lineHeight: 16,
  },
  // Elite Custom Toggle
  toggleTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  toggleTrackInactive: {
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: '#262626',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  toggleThumbActive: {
    backgroundColor: '#050505',
    alignSelf: 'flex-end',
  },
  toggleThumbInactive: {
    backgroundColor: '#666666',
    alignSelf: 'flex-start',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  legalRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legalText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  legalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  dangerZoneCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 10,
  },
  dangerZoneTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(248, 113, 113, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.danger,
  },
  versionText: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
});
