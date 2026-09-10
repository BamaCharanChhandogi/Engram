import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../../constants/Theme';
import { Api } from '../../services/api';

export default function StreakScreen() {
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState<any>(null);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    setLoading(true);
    try {
      const data = await Api.getStreak();
      setStreakData(data);
    } catch (e) {
      console.log('Error loading streak data', e);
    } finally {
      setLoading(false);
    }
  };

  const streak = streakData?.streak || {
    currentStreak: 4,
    longestStreak: 12,
    totalQuestionsAnswered: 26,
  };

  const avgScore = streakData?.averageScore || 89;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Retention & Metrics</Text>
          <Text style={styles.subtitle}>
            Continuous active recall converts fleeting code sessions into permanent engineering instinct.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <>
            {/* Primary Streak Banner */}
            <View style={styles.streakBanner}>
              <View style={styles.streakBadgeContainer}>
                <View style={styles.fireIconCircle}>
                  <Feather name="zap" size={26} color={Colors.accent} />
                </View>
                <View>
                  <Text style={styles.streakCount}>{streak.currentStreak} Days</Text>
                  <Text style={styles.streakSubtitle}>Continuous Practice Streak</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>LONGEST STREAK</Text>
                  <Text style={styles.statValue}>{streak.longestStreak} Days</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>QUESTIONS SOLVED</Text>
                  <Text style={styles.statValue}>{streak.totalQuestionsAnswered}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>AVG SCORE</Text>
                  <Text style={[styles.statValue, { color: Colors.accent }]}>{avgScore}%</Text>
                </View>
              </View>
            </View>

            {/* Ebbinghaus Forgetting Curve Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Feather name="trending-up" size={16} color={Colors.accent} />
                <Text style={styles.cardTitle}>Ebbinghaus Retention Decay</Text>
              </View>
              <Text style={styles.cardBody}>
                Engineers typically forget 70% of new syntax, libraries, and architectural decisions within 48 hours without active reinforcement.
              </Text>

              <View style={styles.retentionTimeline}>
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, styles.dotActive]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStep}>Day 1: Code Ingestion</Text>
                    <Text style={styles.timelineSub}>Passive diff recording via CLI & MCP hooks</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, styles.dotActive]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStep}>Day 2: First Recall Rep</Text>
                    <Text style={styles.timelineSub}>Active technical reconstruction under SDE calibration</Text>
                  </View>
                </View>

                <View style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineStep}>Day 7: Spaced Deepening</Text>
                    <Text style={styles.timelineSub}>Failure mode & edge-case stress testing</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* System Philosophy Card */}
            <View style={styles.philosophyCard}>
              <Text style={styles.philosophyLabel}>ENGINEERING FOUNDATION</Text>
              <Text style={styles.philosophyQuote}>
                "The difference between an engineer who reads documentation and one who leads system architecture is immediate, intuitive recall under production pressure."
              </Text>
            </View>
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
    paddingTop: Platform.OS === 'android' ? 36 : 12,
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
  streakBanner: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  streakBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  fireIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCount: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  streakSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 16,
  },
  retentionTimeline: {
    gap: 14,
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  dotActive: {
    backgroundColor: Colors.accent,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStep: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  timelineSub: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  philosophyCard: {
    backgroundColor: 'rgba(232, 200, 114, 0.04)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.15)',
  },
  philosophyLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  philosophyQuote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
