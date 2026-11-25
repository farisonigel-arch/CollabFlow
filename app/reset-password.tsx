import { useEffect, useRef, useState } from 'react';
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
import { Link, router } from 'expo-router';
import * as ExpoLinking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();

  const [checkingLink, setCheckingLink] = useState(true);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const processedUrls = useRef(new Set<string>());

  useEffect(() => {
    let mounted = true;

    const processRecoveryUrl = async (url: string | null) => {
      if (!url || processedUrls.current.has(url)) return;

      processedUrls.current.add(url);

      try {
        const queryString = url.includes('?')
          ? url.split('?')[1].split('#')[0]
          : '';

        const hashString = url.includes('#')
          ? url.split('#').slice(1).join('#')
          : '';

        const params = new URLSearchParams(
          [queryString, hashString].filter(Boolean).join('&')
        );

        const code = params.get('code');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const recoveryType = params.get('type');

        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) throw exchangeError;
        } else if (
          recoveryType === 'recovery' &&
          accessToken &&
          refreshToken
        ) {
          const { error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (sessionError) throw sessionError;
        } else {
          throw new Error(
            'This password-reset link is invalid or incomplete. Please request a new one.'
          );
        }

        if (mounted) {
          setRecoveryReady(true);
          setError('');

          // Remove recovery credentials from the browser address bar.
          if (Platform.OS === 'web') {
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );
          }
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to verify the password-reset link.'
          );
        }
      } finally {
        if (mounted) setCheckingLink(false);
      }
    };

    if (Platform.OS === 'web') {
      void processRecoveryUrl(window.location.href);
    } else {
      const subscription = ExpoLinking.addEventListener(
        'url',
        ({ url }) => {
          void processRecoveryUrl(url);
        }
      );

      void ExpoLinking.getInitialURL().then(processRecoveryUrl);

      return () => {
        mounted = false;
        subscription.remove();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdatePassword = async () => {
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Your new password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);

      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(
        'Your password has been updated successfully. You can now sign in with your new password.'
      );

      const { error: signOutError } = await supabase.auth.signOut();

      if (!signOutError) {
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 1800);
      }
    } catch {
      setError('Unable to update your password. Please try again.');
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
            <Ionicons name="shield-checkmark-outline" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.brand}>CollabFlow</Text>
          <Text style={styles.tagline}>Secure account recovery</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Create a new password</Text>

          <Text style={styles.description}>
            Verify your recovery link and choose a new password for your
            CollabFlow account.
          </Text>

          {checkingLink ? (
            <View style={styles.statusContainer}>
              <ActivityIndicator size="large" color="#2459A9" />
              <Text style={styles.statusText}>
                Verifying your recovery link...
              </Text>
            </View>
          ) : recoveryReady ? (
            <>
              <Text style={styles.label}>New password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#94A3B8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!submitting}
                />
              </View>

              <Text style={styles.label}>Confirm new password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password again"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
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

              {!success ? (
                <Pressable
                  style={[styles.button, submitting && styles.disabledButton]}
                  onPress={handleUpdatePassword}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Update Password</Text>
                  )}
                </Pressable>
              ) : null}
            </>
          ) : (
            <>
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={19} color="#B91C1C" />
                <Text style={styles.errorText}>
                  {error || 'The recovery link could not be verified.'}
                </Text>
              </View>

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable style={styles.button}>
                  <Text style={styles.buttonText}>Request a New Reset Link</Text>
                </Pressable>
              </Link>
            </>
          )}

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
    marginBottom: 18,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    paddingVertical: 12,
  },
  button: {
    minHeight: 52,
    backgroundColor: '#2459A9',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 25,
    gap: 12,
  },
  statusText: {
    color: '#64748B',
    fontSize: 14,
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 22,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    padding: 8,
  },
  link: {
    color: '#2459A9',
    fontSize: 14,
    fontWeight: '600',
  },
});
