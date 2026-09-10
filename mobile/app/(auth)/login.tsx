import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Theme';
import { Api } from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (customEmail?: string, customPass?: string) => {
    const targetEmail = customEmail || email.trim();
    const targetPass = customPass || password;

    if (!targetEmail || !targetPass) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await Api.login(targetEmail, targetPass);

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Invalid email or password. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to Engram servers');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewerQuickAccess = () => {
    setEmail('test@devpractice.io');
    setPassword('reviewer123');
    handleLogin('test@devpractice.io', 'reviewer123');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Engram</Text>
          <Text style={styles.brandSubtitle}>
            Continuous active recall calibrated to your daily code diffs
          </Text>
        </View>

        {/* Form Container */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="engineer@company.com"
              placeholderTextColor={Colors.textTertiary}
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError(null);
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError(null);
              }}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={() => handleLogin()}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.black} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Play Reviewer / Demo Bypass Button */}
          <TouchableOpacity
            style={styles.reviewerButton}
            onPress={handleReviewerQuickAccess}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.reviewerButtonText}>
              Google Play Reviewer 1-Tap Demo
            </Text>
            <Text style={styles.reviewerSubtext}>
              Instant access without credentials for app verification
            </Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Do not have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.policyNotice}>
          By signing in, you agree to our privacy policy and zero-ad data retention standards.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textTertiary,
    fontSize: 11,
    paddingHorizontal: 12,
    fontWeight: '600',
  },
  reviewerButton: {
    backgroundColor: 'rgba(232, 200, 114, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232, 200, 114, 0.25)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  reviewerButtonText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  reviewerSubtext: {
    color: Colors.textTertiary,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  linkText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  policyNotice: {
    marginTop: 24,
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
