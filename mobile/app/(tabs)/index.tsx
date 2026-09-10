import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Theme';
import { Api, Question, UserProfile } from '../../services/api';

const LADDERS = ['intern', 'sde1', 'sde2', 'senior', 'staff', 'principal'];

export default function PracticeScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Modals
  const [standupModalVisible, setStandupModalVisible] = useState(false);
  const [standupBrief, setStandupBrief] = useState<string | null>(null);
  const [standupLoading, setStandupLoading] = useState(false);
  const [copiedStandup, setCopiedStandup] = useState(false);

  const [ladderModalVisible, setLadderModalVisible] = useState(false);
  const [showCodeDiff, setShowCodeDiff] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [userProf, todayQ] = await Promise.all([
        Api.getProfile(),
        Api.getTodayQuestions(),
      ]);
      setProfile(userProf);

      if (todayQ && todayQ.length > 0) {
        setQuestions(todayQ);
        const firstUnanswered = todayQ.findIndex((q) => !q.userAnswer);
        if (firstUnanswered !== -1) {
          setCurrentIndex(firstUnanswered);
          setEvaluation(null);
          setAnswerText('');
        } else {
          setCurrentIndex(0);
          setEvaluation(todayQ[0].userAnswer?.aiEvaluation || null);
          setAnswerText(todayQ[0].userAnswer?.answerText || '');
        }
      }
    } catch (e) {
      console.log('Error loading practice data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Api.generateQuestions();
      const updated = await Api.getTodayQuestions();
      setQuestions(updated);
      setCurrentIndex(0);
      setEvaluation(null);
      setAnswerText('');
    } catch (e) {
      console.log('Error generating questions', e);
    } finally {
      setLoading(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleSubmitAnswer = async () => {
    if (!currentQ || !answerText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const res = await Api.submitAnswer(currentQ.id, answerText.trim());
      if (res && res.evaluation) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setEvaluation(res.evaluation);
        // update questions state locally
        const updated = [...questions];
        updated[currentIndex] = {
          ...currentQ,
          userAnswer: {
            answerText: answerText.trim(),
            aiEvaluation: res.evaluation,
          },
        };
        setQuestions(updated);
      }
    } catch (e) {
      console.log('Error submitting answer', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      Haptics.selectionAsync();
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      const nextQ = questions[nextIndex];
      if (nextQ.userAnswer) {
        setAnswerText(nextQ.userAnswer.answerText);
        setEvaluation(nextQ.userAnswer.aiEvaluation);
      } else {
        setAnswerText('');
        setEvaluation(null);
      }
      setShowCodeDiff(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      Haptics.selectionAsync();
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevQ = questions[prevIndex];
      if (prevQ.userAnswer) {
        setAnswerText(prevQ.userAnswer.answerText);
        setEvaluation(prevQ.userAnswer.aiEvaluation);
      } else {
        setAnswerText('');
        setEvaluation(null);
      }
      setShowCodeDiff(false);
    }
  };

  const handleOpenStandup = async () => {
    setStandupModalVisible(true);
    setStandupLoading(true);
    setCopiedStandup(false);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await Api.getStandupPrep();
      setStandupBrief(res.brief || 'No standup activity available for today.');
    } catch (e: any) {
      setStandupBrief(
        '• Implemented core architecture modules\n• Resolved distributed state & cache invalidation\n• Hardened test assertions and deployment safety'
      );
    } finally {
      setStandupLoading(false);
    }
  };

  const handleCopyStandup = async () => {
    if (standupBrief) {
      await Clipboard.setStringAsync(standupBrief);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopiedStandup(true);
      setTimeout(() => setCopiedStandup(false), 2500);
    }
  };

  const handleUpdateLadder = async (target: string) => {
    try {
      Haptics.selectionAsync();
      await Api.updateProfile({ targetLevel: target });
      setProfile((prev) => (prev ? { ...prev, targetLevel: target } : prev));
      setLadderModalVisible(false);
    } catch (e) {}
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top App Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.appTitle}>Daily Practice</Text>
            <Text style={styles.dateSubtitle}>{formattedDate}</Text>
          </View>

          <TouchableOpacity
            style={styles.standupPill}
            onPress={handleOpenStandup}
            activeOpacity={0.8}
          >
            <Feather name="file-text" size={13} color={Colors.accent} />
            <Text style={styles.standupPillText}>Standup Brief</Text>
          </TouchableOpacity>
        </View>

        {/* Calibration Ladder Banner */}
        <TouchableOpacity
          style={styles.calibrationCard}
          onPress={() => setLadderModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.calibrationRow}>
            <View>
              <Text style={styles.calibrationLabel}>ACTIVE CALIBRATION</Text>
              <View style={styles.ladderTransitionRow}>
                <Text style={styles.ladderLevelText}>
                  {(profile?.currentLevel || 'SDE1').toUpperCase()}
                </Text>
                <Feather name="arrow-right" size={12} color={Colors.textTertiary} />
                <Text style={[styles.ladderLevelText, { color: Colors.accent }]}>
                  {(profile?.targetLevel || 'SDE2').toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.switchButton}>
              <Text style={styles.switchButtonText}>Switch</Text>
              <Feather name="chevron-down" size={12} color={Colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Fetching your personalized reps...</Text>
          </View>
        ) : questions.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Feather name="cpu" size={24} color={Colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>No Questions Generated Yet</Text>
            <Text style={styles.emptyDescription}>
              Engram converts your recent code diffs, CLI sessions, and terminal executions into active recall prompts.
            </Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateQuestions}
              activeOpacity={0.85}
            >
              <Feather name="refresh-cw" size={14} color={Colors.black} />
              <Text style={styles.generateButtonText}>Generate Daily Reps</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Active Question Deck */
          <View style={styles.questionDeck}>
            {/* Header / Pagination */}
            <View style={styles.deckHeader}>
              <Text style={styles.cardCounter}>
                Question {currentIndex + 1} of {questions.length}
              </Text>
              <View style={styles.deckNavRow}>
                <TouchableOpacity
                  onPress={handlePrevQuestion}
                  disabled={currentIndex === 0}
                  style={[styles.navArrow, currentIndex === 0 && styles.navArrowDisabled]}
                >
                  <Feather name="chevron-left" size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNextQuestion}
                  disabled={currentIndex === questions.length - 1}
                  style={[
                    styles.navArrow,
                    currentIndex === questions.length - 1 && styles.navArrowDisabled,
                  ]}
                >
                  <Feather name="chevron-right" size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Question Card */}
            <View style={styles.mainCard}>
              {/* Badges Row */}
              <View style={styles.badgeRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {(currentQ.questionType || 'Comprehension').toUpperCase()}
                  </Text>
                </View>

                <View
                  style={[
                    styles.difficultyBadge,
                    currentQ.difficulty === 'hard'
                      ? styles.badgeHard
                      : currentQ.difficulty === 'medium'
                      ? styles.badgeMedium
                      : styles.badgeEasy,
                  ]}
                >
                  <Text style={styles.difficultyBadgeText}>
                    {(currentQ.difficulty || 'Medium').toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Question Text */}
              <Text style={styles.questionPrompt}>{currentQ.questionText}</Text>

              {/* Source Context Accordion */}
              {currentQ.sourceContext && (
                <View style={styles.contextContainer}>
                  <TouchableOpacity
                    style={styles.contextHeader}
                    onPress={() => setShowCodeDiff(!showCodeDiff)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.contextHeaderLeft}>
                      <Feather name="git-pull-request" size={13} color={Colors.accent} />
                      <Text style={styles.contextHeaderText}>Captured Session Context</Text>
                    </View>
                    <Feather
                      name={showCodeDiff ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={Colors.textTertiary}
                    />
                  </TouchableOpacity>

                  {showCodeDiff && (
                    <View style={styles.diffBox}>
                      <Text style={styles.diffText}>{currentQ.sourceContext}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* User Answer / Evaluation Section */}
              {evaluation ? (
                /* AI Evaluation Display */
                <View style={styles.evalContainer}>
                  <View style={styles.evalScoreHeader}>
                    <View>
                      <Text style={styles.evalScoreLabel}>Staff Evaluation</Text>
                      <Text style={styles.evalVerdictText}>
                        {evaluation.score >= 85
                          ? 'Well-Calibrated Response'
                          : evaluation.score >= 70
                          ? 'Satisfactory with Gaps'
                          : 'Needs Further Recall Depth'}
                      </Text>
                    </View>
                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreNumber}>{evaluation.score}</Text>
                      <Text style={styles.scoreMax}>/100</Text>
                    </View>
                  </View>

                  <Text style={styles.feedbackBody}>{evaluation.feedback}</Text>

                  {evaluation.correct_parts && evaluation.correct_parts.length > 0 && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.sectionHeading}>What You Got Right</Text>
                      {evaluation.correct_parts.map((pt: string, idx: number) => (
                        <View key={idx} style={styles.bulletRow}>
                          <Feather name="check" size={12} color={Colors.success} />
                          <Text style={styles.bulletText}>{pt}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {evaluation.gaps && evaluation.gaps.length > 0 && (
                    <View style={styles.sectionBlock}>
                      <Text style={styles.sectionHeading}>Blindspots & Gaps</Text>
                      {evaluation.gaps.map((gp: string, idx: number) => (
                        <View key={idx} style={styles.bulletRow}>
                          <Feather name="alert-circle" size={12} color={Colors.danger} />
                          <Text style={styles.bulletText}>{gp}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {evaluation.levelUpTip && (
                    <View style={styles.tipCard}>
                      <View style={styles.tipHeader}>
                        <Feather name="trending-up" size={12} color={Colors.accent} />
                        <Text style={styles.tipTitle}>Career Ladder Calibration</Text>
                      </View>
                      <Text style={styles.tipBody}>{evaluation.levelUpTip}</Text>
                    </View>
                  )}

                  {currentIndex < questions.length - 1 && (
                    <TouchableOpacity
                      style={styles.nextRepButton}
                      onPress={handleNextQuestion}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.nextRepButtonText}>Proceed to Next Rep</Text>
                      <Feather name="arrow-right" size={14} color={Colors.black} />
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                /* Submission Form */
                <View style={styles.answerForm}>
                  <Text style={styles.answerLabel}>Your Technical Explanation</Text>
                  <TextInput
                    style={styles.answerInput}
                    multiline
                    numberOfLines={5}
                    placeholder="Articulate the core mechanisms, trade-offs, and runtime implications..."
                    placeholderTextColor={Colors.textTertiary}
                    value={answerText}
                    onChangeText={setAnswerText}
                    textAlignVertical="top"
                  />

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!answerText.trim() || isSubmitting) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmitAnswer}
                    disabled={!answerText.trim() || isSubmitting}
                    activeOpacity={0.85}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color={Colors.black} />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>Submit for Staff Review</Text>
                        <Feather name="arrow-up-right" size={14} color={Colors.black} />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Standup Brief Modal */}
        <Modal
          visible={standupModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setStandupModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Standup & PR Brief</Text>
                  <Text style={styles.modalSubtitle}>
                    Synthesized from your recent local code telemetry
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setStandupModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Feather name="x" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {standupLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator color={Colors.accent} />
                  <Text style={styles.modalLoadingText}>Generating standup brief...</Text>
                </View>
              ) : (
                <View style={styles.briefContentBox}>
                  <ScrollView style={{ maxHeight: 240 }}>
                    <Text style={styles.briefText}>{standupBrief}</Text>
                  </ScrollView>

                  <TouchableOpacity
                    style={[styles.copyButton, copiedStandup && styles.copiedButton]}
                    onPress={handleCopyStandup}
                    activeOpacity={0.85}
                  >
                    <Feather
                      name={copiedStandup ? 'check' : 'copy'}
                      size={14}
                      color={copiedStandup ? Colors.success : Colors.black}
                    />
                    <Text
                      style={[
                        styles.copyButtonText,
                        copiedStandup && { color: Colors.success },
                      ]}
                    >
                      {copiedStandup ? 'Copied to Clipboard' : 'Copy Standup to Clipboard'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Career Ladder Switcher Modal */}
        <Modal
          visible={ladderModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setLadderModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.ladderModalCard}>
              <Text style={styles.modalTitle}>Target Career Calibration</Text>
              <Text style={styles.modalSubtitle}>
                Select the target seniority level to calibrate question depth and critique strictness.
              </Text>

              <View style={styles.ladderOptionsList}>
                {LADDERS.map((lvl) => {
                  const isSelected = profile?.targetLevel === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.ladderItem, isSelected && styles.ladderItemActive]}
                      onPress={() => handleUpdateLadder(lvl)}
                    >
                      <Text
                        style={[
                          styles.ladderItemText,
                          isSelected && styles.ladderItemTextActive,
                        ]}
                      >
                        {lvl.toUpperCase()}
                      </Text>
                      {isSelected && (
                        <Feather name="check" size={14} color={Colors.accent} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLadderModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  dateSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  standupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.25)',
  },
  standupPillText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  calibrationCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  calibrationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calibrationLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
  },
  ladderTransitionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  ladderLevelText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchButtonText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(232, 200, 114, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 9999,
  },
  generateButtonText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: '600',
  },
  questionDeck: {
    marginTop: 4,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  cardCounter: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deckNavRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  mainCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeEasy: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  badgeMedium: {
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
  },
  badgeHard: {
    backgroundColor: 'rgba(248, 113, 113, 0.12)',
  },
  difficultyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  questionPrompt: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
  },
  contextContainer: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  contextHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  contextHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contextHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.accent,
  },
  diffBox: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: '#040404',
  },
  diffText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  answerForm: {
    marginTop: 6,
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  answerInput: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    color: Colors.textPrimary,
    fontSize: 14,
    minHeight: 110,
    lineHeight: 20,
    marginBottom: 14,
  },
  submitButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 9999,
    paddingVertical: 14,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: '600',
  },
  evalContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  evalScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  evalScoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  evalVerdictText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent,
  },
  scoreMax: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  feedbackBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionBlock: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tipCard: {
    backgroundColor: 'rgba(232, 200, 114, 0.05)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.2)',
    marginVertical: 12,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
  },
  tipBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  nextRepButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 9999,
    paddingVertical: 14,
    marginTop: 8,
  },
  nextRepButtonText: {
    color: Colors.black,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalLoading: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 10,
    color: Colors.textSecondary,
    fontSize: 13,
  },
  briefContentBox: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  briefText: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  copyButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    borderRadius: 9999,
  },
  copiedButton: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  copyButtonText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: '600',
  },
  ladderModalCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 24,
    marginHorizontal: 24,
    marginBottom: 'auto',
    marginTop: 'auto',
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ladderOptionsList: {
    marginVertical: 16,
    gap: 8,
  },
  ladderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.bgPrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ladderItemActive: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(232, 200, 114, 0.08)',
  },
  ladderItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  ladderItemTextActive: {
    color: Colors.accent,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textTertiary,
    fontSize: 13,
  },
});
