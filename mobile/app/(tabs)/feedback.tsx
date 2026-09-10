import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Theme';
import { Api } from '../../services/api';

export default function PromptFeedbackScreen() {
  const [loading, setLoading] = useState(true);
  const [feedbackData, setFeedbackData] = useState<any>(null);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await Api.getPromptFeedback();
      setFeedbackData(data);
    } catch (e) {
      console.log('Error loading prompt feedback', e);
    } finally {
      setLoading(false);
    }
  };

  const score = feedbackData?.overallScore || 88;
  const prompts = feedbackData?.prompts && feedbackData.prompts.length > 0
    ? feedbackData.prompts
    : [
        {
          prompt: "Explain SSE vs WebSocket streaming in Node.js backend",
          tool: "Codex CLI",
          capturedAt: "Today, 10:45 AM",
          contextScore: 92,
          verdict: "High Context",
          critique: "Clear technical boundaries and runtime context provided. Explicit mention of Node.js engine enables focused evaluation.",
          suggestion: "Include constraints regarding proxy timeout or client disconnection handling to elevate to architectural depth."
        },
        {
          prompt: "tell me more about java",
          tool: "Codex CLI",
          capturedAt: "Yesterday, 4:12 PM",
          contextScore: 45,
          verdict: "Vague / Low Density",
          critique: "Lacks scope, version targets, and system architecture context. Yields generic textbook output rather than high-density engineering leverage.",
          suggestion: "Calibrate prompt with specific JVM memory models, garbage collector tradeoffs, or concurrency frameworks (e.g. Virtual Threads)."
        }
      ];

  const tips = feedbackData?.tips && feedbackData.tips.length > 0
    ? feedbackData.tips
    : [
        "Include relevant error stack traces or schema definitions rather than paraphrasing runtime errors.",
        "Specify constraints explicitly: performance requirements, library versions, or target environments.",
        "Ask for tradeoffs and architectural failure modes rather than raw copy-paste solutions."
      ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Prompt Telemetry</Text>
          <Text style={styles.subtitle}>
            Audit your LLM queries for context density, technical precision, and engineering depth.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <>
            {/* Efficiency Score Card */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreTopRow}>
                <View>
                  <Text style={styles.scoreLabel}>OVERALL CONTEXT DENSITY</Text>
                  <Text style={styles.scoreSubtitle}>Prompt Efficiency Benchmark</Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreValue}>{score}</Text>
                  <Text style={styles.scoreTotal}>/100</Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${Math.min(score, 100)}%` }]} />
              </View>

              <Text style={styles.benchmarkNote}>
                {score >= 80
                  ? 'Your prompts demonstrate high technical density and minimal ambiguity.'
                  : 'Opportunity to provide deeper stack context and precise architectural boundaries.'}
              </Text>
            </View>

            {/* Recommended Principles */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>High-Leverage Principles</Text>
              <View style={styles.tipsList}>
                {tips.map((tip: string, idx: number) => (
                  <View key={idx} style={styles.tipRow}>
                    <View style={styles.tipIconCircle}>
                      <Feather name="shield" size={12} color={Colors.accent} />
                    </View>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Recent Prompts Audit */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Prompts Analyzed</Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    loadFeedback();
                  }}
                  style={styles.refreshIcon}
                >
                  <Feather name="refresh-cw" size={13} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.promptDeck}>
                {prompts.map((p: any, idx: number) => {
                  const isHigh = p.contextScore >= 75;
                  return (
                    <View key={idx} style={styles.promptCard}>
                      <View style={styles.promptCardHeader}>
                        <View style={styles.toolTag}>
                          <Text style={styles.toolTagText}>{p.tool}</Text>
                        </View>
                        <View
                          style={[
                            styles.verdictBadge,
                            isHigh ? styles.verdictHigh : styles.verdictLow,
                          ]}
                        >
                          <Text
                            style={[
                              styles.verdictText,
                              isHigh ? styles.verdictTextHigh : styles.verdictTextLow,
                            ]}
                          >
                            {p.verdict} ({p.contextScore}%)
                          </Text>
                        </View>
                      </View>

                      {/* Prompt Content */}
                      <View style={styles.promptSnippetBox}>
                        <Text style={styles.promptSnippetText}>"{p.prompt}"</Text>
                      </View>

                      {/* Critique */}
                      <Text style={styles.critiqueText}>{p.critique}</Text>

                      {/* Level up suggestion */}
                      {p.suggestion && (
                        <View style={styles.suggestionBox}>
                          <Feather name="arrow-up-right" size={12} color={Colors.accent} />
                          <Text style={styles.suggestionText}>{p.suggestion}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
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
  scoreCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  scoreTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.6,
  },
  scoreSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(232, 200, 114, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.accent,
  },
  scoreTotal: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: Colors.bgPrimary,
    borderRadius: 9999,
    marginTop: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 9999,
  },
  benchmarkNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  refreshIcon: {
    padding: 4,
  },
  tipsList: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(232, 200, 114, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  promptDeck: {
    gap: 14,
  },
  promptCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTag: {
    backgroundColor: Colors.bgPrimary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
  },
  verdictBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  verdictHigh: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  verdictLow: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  verdictText: {
    fontSize: 11,
    fontWeight: '600',
  },
  verdictTextHigh: {
    color: Colors.success,
  },
  verdictTextLow: {
    color: Colors.danger,
  },
  promptSnippetBox: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  promptSnippetText: {
    color: Colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  critiqueText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(232, 200, 114, 0.05)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.15)',
  },
  suggestionText: {
    flex: 1,
    fontSize: 12,
    color: Colors.accent,
    lineHeight: 16,
  },
});
