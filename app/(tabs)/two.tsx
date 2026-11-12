
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type MemberStatus = 'Approved' | 'Pending';

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: MemberStatus;
};

const initialMembers: Member[] = [
  {
    id: '1',
    name: 'Nigel Fariso',
    email: 'owner@collabflow.demo',
    role: 'Organisation owner',
    status: 'Approved',
  },
  {
    id: '2',
    name: 'Tariro Moyo',
    email: 'tariro@example.com',
    role: 'Project manager',
    status: 'Approved',
  },
  {
    id: '3',
    name: 'Tendai Ncube',
    email: 'tendai@example.com',
    role: 'Team member',
    status: 'Pending',
  },
  {
    id: '4',
    name: 'Rudo Dube',
    email: 'rudo@example.com',
    role: 'Team member',
    status: 'Pending',
  },
];

export default function OrganisationScreen() {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | MemberStatus>('All');

  const [reportingTo, setReportingTo] = useState<
    Record<string, string | null>
  >({
    '1': null,
    '2': '1',
  });

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query);

      const matchesFilter =
        filter === 'All' || member.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [members, search, filter]);

  const approvedCount = members.filter(
    (member) => member.status === 'Approved'
  ).length;

  const pendingCount = members.filter(
    (member) => member.status === 'Pending'
  ).length;

  const managers = members.filter(
    (member) =>
      member.status === 'Approved' &&
      (member.role === 'Organisation owner' ||
        member.role === 'Project manager')
  );

  function approveMember(id: string) {
    setMembers((current) =>
      current.map((member) =>
        member.id === id
          ? { ...member, status: 'Approved' }
          : member
      )
    );
  }

  function assignManager(memberId: string, managerId: string) {
    if (memberId === managerId) {
      showMessage('A member cannot report to themselves.');
      return;
    }

    const member = members.find((item) => item.id === memberId);
    const manager = members.find((item) => item.id === managerId);

    if (!member || member.status !== 'Approved') {
      showMessage('Only approved members can be assigned a manager.');
      return;
    }

    if (
      !manager ||
      manager.status !== 'Approved' ||
      !['Organisation owner', 'Project manager'].includes(manager.role)
    ) {
      showMessage('Please select an approved owner or project manager.');
      return;
    }

    setReportingTo((current) => ({
      ...current,
      [memberId]: managerId,
    }));
  }

  function showMessage(message: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
    } else {
      Alert.alert('CollabFlow', message);
    }
  }

  function handleInvite() {
    showMessage(
      'Member invitations will be connected to Supabase when authentication and database setup are implemented.'
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>WORKSPACE MANAGEMENT</Text>
          <Text style={styles.heading}>Organisation</Text>
          <Text style={styles.subtitle}>
            Manage your workspace and team.
          </Text>
        </View>

        <View style={styles.logo}>
          <Text style={styles.logoText}>C</Text>
        </View>
      </View>

      <View style={styles.organisationCard}>
        <View style={styles.organisationIcon}>
          <Text style={styles.organisationIconText}>CF</Text>
        </View>

        <Text style={styles.organisationName}>CollabFlow Workspace</Text>
        <Text style={styles.organisationDescription}>
          Your central space for teamwork, coordination and accountability.
        </Text>

        <View style={styles.ownerBadge}>
          <Text style={styles.ownerBadgeText}>OWNER-MANAGED WORKSPACE</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Team summary</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{members.length}</Text>
          <Text style={styles.summaryLabel}>Total members</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: '#15803D' }]}>
            {approvedCount}
          </Text>
          <Text style={styles.summaryLabel}>Approved</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: '#B45309' }]}>
            {pendingCount}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          marginTop: 20,
          marginBottom: 22,
          borderWidth: 1,
          borderColor: '#E2E8F0',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '800',
            color: '#172033',
          }}
        >
          Reporting Lines
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: '#64748B',
            marginTop: 5,
            marginBottom: 16,
          }}
        >
          View the organisation hierarchy and assign reporting managers.
        </Text>

        {members
          .filter((member) => member.status === 'Approved')
          .map((member) => {
            const isOwner = member.role === 'Organisation owner';
            const managerId = reportingTo[member.id];
            const assignedManager = members.find(
              (item) => item.id === managerId
            );

            return (
              <View
                key={member.id}
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: isOwner ? '#2459A9' : '#16A34A',
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: '#172033',
                  }}
                >
                  {member.name}
                </Text>

                <Text
                  style={{
                    fontSize: 11,
                    color: '#64748B',
                    marginTop: 3,
                  }}
                >
                  {member.role}
                </Text>

                <Text
                  style={{
                    fontSize: 11,
                    color: '#334155',
                    marginTop: 8,
                    fontWeight: '700',
                  }}
                >
                  {isOwner
                    ? 'Top-level organisation owner'
                    : assignedManager
                      ? `Reports to: ${assignedManager.name}`
                      : 'No reporting manager assigned'}
                </Text>

                {!isOwner && (
                  <View style={{ marginTop: 12 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#64748B',
                        marginBottom: 8,
                      }}
                    >
                      Assign reporting manager:
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                      }}
                    >
                      {managers
                        .filter((manager) => manager.id !== member.id)
                        .map((manager) => {
                          const selected = managerId === manager.id;

                          return (
                            <Pressable
                              key={manager.id}
                              accessibilityRole="button"
                              accessibilityState={{ selected }}
                              onPress={() =>
                                assignManager(member.id, manager.id)
                              }
                              style={({ pressed }) => ({
                                backgroundColor: selected
                                  ? '#2459A9'
                                  : '#E8F1FF',
                                paddingHorizontal: 11,
                                paddingVertical: 8,
                                borderRadius: 8,
                                marginRight: 7,
                                marginBottom: 7,
                                opacity: pressed ? 0.75 : 1,
                              })}
                            >
                              <Text
                                style={{
                                  color: selected ? '#FFFFFF' : '#2459A9',
                                  fontSize: 10,
                                  fontWeight: '700',
                                }}
                              >
                                {manager.name}
                              </Text>
                            </Pressable>
                          );
                        })}
                    </View>
                  </View>
                )}
              </View>
            );
          })}

        {pendingCount > 0 && (
          <Text
            style={{
              fontSize: 11,
              color: '#92400E',
              backgroundColor: '#FEF3C7',
              padding: 10,
              borderRadius: 8,
              lineHeight: 17,
            }}
          >
            {pendingCount} pending member(s) cannot be assigned a reporting
            manager until they are approved.
          </Text>
        )}
      </View>

      <View style={styles.memberHeading}>
        <View style={styles.headerText}>
          <Text style={styles.sectionTitle}>Members</Text>
          <Text style={styles.subtitle}>
            Review membership and access status.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={handleInvite}
          style={({ pressed }) => [
            styles.inviteButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.inviteButtonText}>+ Invite</Text>
        </Pressable>
      </View>

      <TextInput
        accessibilityLabel="Search members"
        placeholder="Search by name, email or role..."
        placeholderTextColor="#94A3B8"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        autoCapitalize="none"
        returnKeyType="search"
      />

      <View style={styles.filterRow}>
        {(['All', 'Approved', 'Pending'] as const).map((item) => {
          const selected = filter === item;

          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item)}
              style={[
                styles.filterButton,
                selected && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {filteredMembers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No members found</Text>
          <Text style={styles.emptyDescription}>
            Try another search or filter.
          </Text>
        </View>
      ) : (
        filteredMembers.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {member.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.memberDetails}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberEmail}>{member.email}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>

              <View
                style={[
                  styles.statusBadge,
                  member.status === 'Approved'
                    ? styles.approvedBadge
                    : styles.pendingBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    member.status === 'Approved'
                      ? styles.approvedText
                      : styles.pendingText,
                  ]}
                >
                  {member.status}
                </Text>
              </View>

              {member.status === 'Pending' && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => approveMember(member.id)}
                  style={({ pressed }) => [
                    styles.approveButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.approveButtonText}>
                    Approve member
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        ))
      )}

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Development preview</Text>
        <Text style={styles.noticeText}>
          Member approvals currently update local sample data only. They are
          not saved to a server and do not enforce access permissions.
        </Text>
      </View>

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
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#64748B',
    marginBottom: 7,
  },
  heading: {
    fontSize: 29,
    fontWeight: '800',
    color: '#172033',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 5,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2459A9',
    marginLeft: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },
  organisationCard: {
    backgroundColor: '#173B70',
    borderRadius: 20,
    padding: 20,
    marginBottom: 26,
  },
  organisationIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
  },
  organisationIconText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#173B70',
  },
  organisationName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  organisationDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: '#D9E6F8',
    marginTop: 8,
  },
  ownerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCEBFF',
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 16,
  },
  ownerBadgeText: {
    color: '#173B70',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
    marginBottom: 28,
  },
  summaryCard: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    borderRadius: 14,
    padding: 12,
  },
  summaryNumber: {
    fontSize: 23,
    fontWeight: '800',
    color: '#2459A9',
  },
  summaryLabel: {
    fontSize: 10,
    lineHeight: 15,
    color: '#64748B',
    marginTop: 5,
  },
  memberHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inviteButton: {
    backgroundColor: '#2459A9',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginLeft: 10,
  },
  inviteButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  searchInput: {
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE3EE',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#172033',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#DCE3EE',
    borderRadius: 9,
    paddingHorizontal: 15,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#2459A9',
    borderColor: '#2459A9',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    padding: 14,
    marginBottom: 11,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#2459A9',
    fontWeight: '800',
    fontSize: 13,
  },
  memberDetails: {
    flex: 1,
    minWidth: 0,
  },
  memberName: {
    color: '#172033',
    fontWeight: '800',
    fontSize: 13,
  },
  memberEmail: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  memberRole: {
    color: '#475569',
    fontSize: 11,
    marginTop: 7,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 9,
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  approvedText: {
    color: '#166534',
  },
  pendingText: {
    color: '#92400E',
  },
  approveButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2459A9',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    marginTop: 10,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#172033',
  },
  emptyDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  notice: {
    backgroundColor: '#E8F1FF',
    borderRadius: 13,
    padding: 14,
    marginTop: 14,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#173B70',
    marginBottom: 6,
  },
  noticeText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#334155',
  },
  footer: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
  },
});
