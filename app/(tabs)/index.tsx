
import { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

const tasks = [
  {
    title: 'Review member applications',
    department: 'Administration',
    status: 'Pending',
    color: '#F59E0B',
  },
  {
    title: 'Prepare weekly progress report',
    department: 'Operations',
    status: 'In progress',
    color: '#2563EB',
  },
  {
    title: 'Update project documentation',
    department: 'Development',
    status: 'Completed',
    color: '#16A34A',
  },
];

const stats = [
  { label: 'Total tasks', value: '24', color: '#2563EB' },
  { label: 'In progress', value: '08', color: '#D97706' },
  { label: 'Completed', value: '12', color: '#16A34A' },
  { label: 'Pending', value: '04', color: '#9333EA' },
];

export default function DashboardScreen() {
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      const { error } = await signOut();

      if (error) {
        const message = `Unable to sign out: ${error.message}`;

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(message);
        } else {
          Alert.alert('Sign out failed', message);
        }

        setSigningOut(false);
      }
      // On success, AuthContext updates the session.
      // The protected tab layout redirects to login automatically.
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred.';

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Unable to sign out: ${message}`);
      } else {
        Alert.alert('Sign out failed', message);
      }

      setSigningOut(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>WORKSPACE OVERVIEW</Text>
          <Text style={styles.heading}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Your team&apos;s progress, at a glance.
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out of CollabFlow"
            disabled={signingOut}
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutButton,
              pressed && styles.pressed,
              signingOut && styles.signOutDisabled,
            ]}
          >
            <Text style={styles.signOutText}>
              {signingOut ? 'Signing out...' : 'Sign out'}
            </Text>
          </Pressable>

          <View style={styles.logo}>
            <Text style={styles.logoText}>C</Text>
          </View>
        </View>
      </View>

      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeLabel}>WELCOME TO COLLABFLOW</Text>
        <Text style={styles.welcomeTitle}>
          Better teamwork. Clear accountability.
        </Text>
        <Text style={styles.welcomeDescription}>
          Coordinate tasks, track progress and keep everyone aligned.
        </Text>
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>DEMO WORKSPACE</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Task overview</Text>
        <Text style={styles.mutedText}>Sample data</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <View
              style={[styles.statIndicator, { backgroundColor: stat.color }]}
            />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent tasks</Text>
        <Text style={styles.mutedText}>Latest activity</Text>
      </View>

      {tasks.map((task) => (
        <Pressable
          key={task.title}
          accessibilityRole="button"
          onPress={() => {}}
          style={({ pressed }) => [
            styles.taskCard,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.taskIcon}>
            <Text style={styles.taskIconText}>
              {task.title.charAt(0)}
            </Text>
          </View>

          <View style={styles.taskDetails}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDepartment}>{task.department}</Text>
          </View>

          <View
            style={[
              styles.statusDot,
              { backgroundColor: task.color },
            ]}
          />
        </Pressable>
      ))}

      <Text style={styles.footer}>
        CollabFlow · Coordinate. Collaborate. Deliver.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.7,
    color: '#64748B',
    marginBottom: 7,
  },
  heading: {
    fontSize: 29,
    fontWeight: '800',
    color: '#172033',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  signOutButton: {
    backgroundColor: '#E8F1FF',
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 12,
  },
  signOutText: {
    color: '#2459A9',
    fontSize: 12,
    fontWeight: '700',
  },
  signOutDisabled: {
    opacity: 0.5,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2459A9',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  welcomeCard: {
    backgroundColor: '#173B70',
    borderRadius: 22,
    padding: 22,
    marginBottom: 28,
  },
  welcomeLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#BBD6FF',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  welcomeDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#D9E6F8',
  },
  demoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    marginTop: 18,
  },
  demoBadgeText: {
    color: '#173B70',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
  },
  mutedText: {
    fontSize: 11,
    color: '#64748B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  statCard: {
    width: '47%',
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  statIndicator: {
    width: 24,
    height: 4,
    borderRadius: 3,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#172033',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 5,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  taskIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1FF',
    marginRight: 12,
  },
  taskIconText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2459A9',
  },
  taskDetails: {
    flex: 1,
    paddingRight: 8,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#172033',
  },
  taskDepartment: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  pressed: {
    opacity: 0.75,
  },
  footer: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
  },
});
