import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReset = async () => {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setSubmitting(true);

      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(
          'If an account exists for this email address, Supabase will send a password-reset email. Please check your inbox.'
        );
      }
    } catch {
      setError('Unable to request a password reset. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logo}>
            <Ionicons name="lock-open-outline" size={32} color="#FFFFFF" />
          </View>

          <Text style={styles.brand}>CollabFlow</Text>
          <Text style={styles.tagline}>Account recovery</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Forgot password?</Text>

          <Text style={styles.description}>
            Enter the email address associated with your account.
            We will request a password-reset email from Supabase.
          </Text>

          <Text style={styles.label}>Email address</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#64748B" />

            <TextInput
              style={styles.input}
              placeholder="Enter your registered email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!submitting}
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={18} color="#B91C1C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle-outline" size={19} color="#166534" />
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <Pressable
            style={[styles.resetButton, submitting && styles.disabledButton]}
            onPress={handleReset}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Email</Text>
            )}
          </Pressable>

          <View style={styles.backContainer}>
            <Link href="/(auth)/login" asChild>
              <Pressable style={styles.backLink}>
                <Ionicons name="arrow-back" size={17} color="#2459A9" />
                <Text style={styles.link}>Back to Sign In</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 19,
    backgroundColor: '#2459A9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 11,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1E293B',
  },
  tagline: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 9,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    marginBottom: 25,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  inputContainer: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#DCE3ED',
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEF2F2',
    padding: 11,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 13,
    lineHeight: 19,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 11,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    color: '#166534',
    fontSize: 13,
    lineHeight: 19,
  },
  resetButton: {
    minHeight: 52,
    backgroundColor: '#2459A9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 23,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  link: {
    color: '#2459A9',
    fontSize: 13,
    fontWeight: '700',
  },
});
