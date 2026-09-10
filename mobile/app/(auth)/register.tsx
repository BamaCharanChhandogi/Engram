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

const LADDERS = [
  { id: 'intern', label: 'Intern' },
  { id: 'sde1', label: 'SDE 1' },
  { id: 'sde2', label: 'SDE 2' },
  { id: 'senior', label: 'Senior' },
  { id: 'staff', label: 'Staff' },
];

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetLevel, setTargetLevel] = useState('sde2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const res = await Api.register(name.trim(), email.trim(), password, targetLevel);

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const errMsg = 'message' in res ? (res.message as string) : 'Registration failed. Try a different email.';
        setError(errMsg);
      }
    } catch (err: any) {
      setError(err.message || 'Could not connect to Engram servers');
    } finally {
      setLoading(false);
    }
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
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Engram</Text>
          <Text style={styles.brandSubtitle}>
            Accelerate your engineering trajectory with AI-driven active recall
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Ada Lovelace"
              placeholderTextColor={Colors.textTertiary}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              autoCapitalize="words"
            />
          </View>

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
              placeholder="At least 6 characters"
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Career Benchmark</Text>
            <View style={styles.ladderRow}>
              {LADDERS.map((lvl) => {
                const isSelected = targetLevel === lvl.id;
                return (
                  <TouchableOpacity
                    key={lvl.id}
                    style={[styles.ladderPill, isSelected && styles.ladderPillActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setTargetLevel(lvl.id);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.ladderPillText, isSelected && styles.ladderPillTextActive]}
                    >
                      {lvl.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.black} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Join Engram</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.linkText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
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
    marginBottom: 18,
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
  ladderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  ladderPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: Colors.bgPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ladderPillActive: {
    backgroundColor: 'rgba(232, 200, 114, 0.12)',
    borderColor: Colors.accent,
  },
  ladderPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  ladderPillTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
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
    marginTop: 22,
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
});
