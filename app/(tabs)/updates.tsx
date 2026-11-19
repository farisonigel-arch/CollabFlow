import {
  useNotifications,
  type NotificationItem,
  type NotificationType,
} from '@/context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Section = 'Notifications' | 'Activity Log';

type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: NotificationType;
};

const initialActivities: ActivityItem[] = [
  {
    id: '1',
    actor: 'Nigel Fariso',
    action: 'created the task',
    target: 'Project Progress Report',
    time: 'Today, 10:15 AM',
    type: 'Task',
  },
  {
    id: '2',
    actor: 'Tariro Moyo',
    action: 'updated the status of',
    target: 'Website Development',
    time: 'Today, 9:45 AM',
    type: 'Task',
  },
  {
    id: '3',
    actor: 'Nigel Fariso',
    action: 'created the channel',
    target: 'Projects',
    time: 'Today, 8:30 AM',
    type: 'Channel',
  },
  {
    id: '4',
    actor: 'Tariro Moyo',
    action: 'submitted a member for approval',
    target: 'New workspace member',
    time: 'Yesterday, 3:20 PM',
    type: 'Member',
  },
  {
    id: '5',
    actor: 'Nigel Fariso',
    action: 'created the role',
    target: 'Project Coordinator',
    time: 'Yesterday, 11:00 AM',
    type: 'System',
  },
];

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'Task':
      return 'checkbox-outline';
    case 'Member':
      return 'people-outline';
    case 'Channel':
      return 'chatbubbles-outline';
    default:
      return 'information-circle-outline';
  }
};

const getTypeColor = (type: NotificationType) => {
  switch (type) {
    case 'Task':
      return '#2563EB';
    case 'Member':
      return '#D97706';
    case 'Channel':
      return '#7C3AED';
    default:
      return '#0F766E';
  }
};

export default function UpdatesScreen() {
  const [activeSection, setActiveSection] =
    useState<Section>('Notifications');

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState('All');

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (filter === 'Unread') return !item.read;
      if (filter === 'Read') return item.read;
      return true;
    });
  }, [notifications, filter]);

  const confirmClearReadNotifications = () => {
    Alert.alert(
      'Clear read notifications',
      'Remove all notifications that have already been read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearReadNotifications,
        },
      ]
    );
  };

  const handleNotificationPress = (item: NotificationItem) => {
    markAsRead(item.id);

    if (item.taskId !== undefined) {
      router.push({
        pathname: '/(tabs)/tasks',
        params: { taskId: String(item.taskId) },
      });
    }
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <Pressable
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${getTypeColor(item.type)}15` },
        ]}
      >
        <Ionicons
          name={getTypeIcon(item.type) as any}
          size={22}
          color={getTypeColor(item.type)}
        />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeading}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.timeText}>{item.time}</Text>

        {!item.read && (
          <Text style={styles.tapHint}>Tap to mark as read</Text>
        )}
      </View>
    </Pressable>
  );

  const renderActivity = ({ item }: { item: ActivityItem }) => (
    <View style={styles.activityCard}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${getTypeColor(item.type)}15` },
        ]}
      >
        <Ionicons
          name={getTypeIcon(item.type) as any}
          size={21}
          color={getTypeColor(item.type)}
        />
      </View>

      <View style={styles.activityContent}>
        <Text style={styles.activityDescription}>
          <Text style={styles.actorName}>{item.actor}</Text>
          {' '}{item.action}{' '}
          <Text style={styles.targetName}>{item.target}</Text>
        </Text>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.heading}>Updates</Text>
            <Text style={styles.subtitle}>
              Notifications and workspace activity
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="notifications-outline"
              size={25}
              color="#2563EB"
            />
            {unreadCount > 0 && <View style={styles.headerBadge} />}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{unreadCount}</Text>
            <Text style={styles.summaryLabel}>Unread</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{notifications.length}</Text>
            <Text style={styles.summaryLabel}>Notifications</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{initialActivities.length}</Text>
            <Text style={styles.summaryLabel}>Activities</Text>
          </View>
        </View>

        <View style={styles.sectionSwitcher}>
          {(['Notifications', 'Activity Log'] as Section[]).map((section) => (
            <Pressable
              key={section}
              onPress={() => setActiveSection(section)}
              style={[
                styles.sectionButton,
                activeSection === section && styles.activeSectionButton,
              ]}
            >
              <Text
                style={[
                  styles.sectionButtonText,
                  activeSection === section && styles.activeSectionText,
                ]}
              >
                {section}
              </Text>

              {section === 'Notifications' && unreadCount > 0 && (
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {activeSection === 'Notifications' ? (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Your notifications</Text>
              <Pressable onPress={markAllAsRead}>
                <Text style={styles.actionText}>Mark all as read</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {['All', 'Unread', 'Read'].map((option) => (
                <Pressable
                  key={option}
                  onPress={() => setFilter(option)}
                  style={[
                    styles.filterButton,
                    filter === option && styles.activeFilterButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === option && styles.activeFilterText,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {filteredNotifications.length > 0 ? (
              <FlatList
                data={filteredNotifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="notifications-off-outline"
                  size={38}
                  color="#94A3B8"
                />
                <Text style={styles.emptyTitle}>No notifications here</Text>
                <Text style={styles.emptyMessage}>
                  There are no notifications matching this filter.
                </Text>
              </View>
            )}

            <Pressable
              style={styles.clearButton}
              onPress={confirmClearReadNotifications}
            >
              <Ionicons name="trash-outline" size={17} color="#DC2626" />
              <Text style={styles.clearButtonText}>
                Clear read notifications
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.contentSection}>
            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Workspace activity</Text>
              <Text style={styles.activityCount}>
                {initialActivities.length} records
              </Text>
            </View>

            <Text style={styles.activityIntro}>
              A record of actions performed within your organisation.
            </Text>

            {initialActivities.map((item) => (
              <View key={item.id}>{renderActivity({ item })}</View>
            ))}
          </View>
        )}

        <View style={styles.previewNotice}>
          <Ionicons
            name="information-circle-outline"
            size={19}
            color="#2563EB"
          />
          <Text style={styles.previewText}>
            Development preview: notifications are currently held in application
            memory and are not saved between restarts. The activity log uses
            sample records. Persistent notifications, server-backed activity
            records and synchronisation will be added in a future stage.
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 5,
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  summaryCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 19,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 5,
  },
  summaryDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#E2E8F0',
  },
  sectionSwitcher: {
    marginHorizontal: 20,
    marginTop: 24,
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
  },
  sectionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  activeSectionButton: {
    backgroundColor: '#FFFFFF',
  },
  sectionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  activeSectionText: {
    color: '#1D4ED8',
  },
  sectionBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  filterRow: {
    gap: 8,
    paddingBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 17,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  activeFilterButton: {
    backgroundColor: '#2563EB',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 11,
    gap: 12,
  },
  unreadCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FBFF',
  },
  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  notificationMessage: {
    fontSize: 12,
    lineHeight: 18,
    color: '#475569',
    marginTop: 6,
  },
  timeText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 8,
  },
  tapHint: {
    fontSize: 10,
    color: '#2563EB',
    marginTop: 5,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 13,
    marginTop: 5,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  activityIntro: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 17,
    lineHeight: 18,
  },
  activityCount: {
    fontSize: 11,
    color: '#64748B',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: '#475569',
  },
  actorName: {
    fontWeight: '800',
    color: '#0F172A',
  },
  targetName: {
    fontWeight: '700',
    color: '#2563EB',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 35,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptyMessage: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  previewNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginHorizontal: 20,
    marginTop: 23,
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
  },
  previewText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: '#475569',
  },
  bottomSpace: {
    height: 25,
  },
});
