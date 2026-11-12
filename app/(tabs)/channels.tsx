
import { useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Visibility = 'Public' | 'Private';

type Channel = {
  id: string;
  name: string;
  description: string;
  visibility: Visibility;
  allowedRoles: string[];
  members: string[];
  isDefault: boolean;
};

const availableRoles = ['Owner', 'Admin', 'Manager', 'Member'];

const initialChannels: Channel[] = [
  {
    id: '1',
    name: 'General',
    description: 'General workspace discussions and updates.',
    visibility: 'Public',
    allowedRoles: [...availableRoles],
    members: ['Nigel Fariso', 'Tariro Moyo', 'Tendai Ncube', 'Rudo Dube'],
    isDefault: true,
  },
  {
    id: '2',
    name: 'Announcements',
    description: 'Important organisation announcements.',
    visibility: 'Public',
    allowedRoles: ['Owner', 'Admin', 'Manager', 'Member'],
    members: ['Nigel Fariso', 'Tariro Moyo', 'Tendai Ncube', 'Rudo Dube'],
    isDefault: true,
  },
  {
    id: '3',
    name: 'Management',
    description: 'Management coordination and planning.',
    visibility: 'Private',
    allowedRoles: ['Owner', 'Admin', 'Manager'],
    members: ['Nigel Fariso', 'Tariro Moyo'],
    isDefault: false,
  },
  {
    id: '4',
    name: 'Projects',
    description: 'Project discussions, updates and collaboration.',
    visibility: 'Public',
    allowedRoles: [...availableRoles],
    members: ['Nigel Fariso', 'Tariro Moyo', 'Tendai Ncube', 'Rudo Dube'],
    isDefault: false,
  },
];

export default function ChannelsScreen() {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [selectedChannelId, setSelectedChannelId] = useState('1');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | Visibility>('All');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingChannelId, setEditingChannelId] = useState<string | null>(null);

  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('Public');
  const [allowedRoles, setAllowedRoles] = useState<string[]>(['Owner', 'Admin']);

  const selectedChannel = useMemo(
    () => channels.find((channel) => channel.id === selectedChannelId) ?? channels[0],
    [channels, selectedChannelId]
  );

  const filteredChannels = useMemo(() => {
    const query = search.trim().toLowerCase();

    return channels.filter((channel) => {
      const matchesSearch =
        channel.name.toLowerCase().includes(query) ||
        channel.description.toLowerCase().includes(query);

      const matchesFilter =
        filter === 'All' || channel.visibility === filter;

      return matchesSearch && matchesFilter;
    });
  }, [channels, search, filter]);

  const publicCount = channels.filter(
    (channel) => channel.visibility === 'Public'
  ).length;

  const privateCount = channels.filter(
    (channel) => channel.visibility === 'Private'
  ).length;

  const openCreateModal = () => {
    setEditingChannelId(null);
    setChannelName('');
    setChannelDescription('');
    setVisibility('Public');
    setAllowedRoles(['Owner', 'Admin']);
    setModalVisible(true);
  };

  const openEditModal = () => {
    if (!selectedChannel) return;

    setEditingChannelId(selectedChannel.id);
    setChannelName(selectedChannel.name);
    setChannelDescription(selectedChannel.description);
    setVisibility(selectedChannel.visibility);
    setAllowedRoles([...selectedChannel.allowedRoles]);
    setModalVisible(true);
  };

  const toggleRole = (role: string) => {
    setAllowedRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role]
    );
  };

  const saveChannel = () => {
    const cleanName = channelName.trim();
    const cleanDescription = channelDescription.trim();

    if (!cleanName) {
      Alert.alert('Channel name required', 'Please enter a channel name.');
      return;
    }

    if (allowedRoles.length === 0) {
      Alert.alert(
        'Role access required',
        'Select at least one role that can access this channel.'
      );
      return;
    }

    const duplicate = channels.some(
      (channel) =>
        channel.name.toLowerCase() === cleanName.toLowerCase() &&
        channel.id !== editingChannelId
    );

    if (duplicate) {
      Alert.alert(
        'Channel already exists',
        'Please choose a different channel name.'
      );
      return;
    }

    if (editingChannelId) {
      setChannels((current) =>
        current.map((channel) =>
          channel.id === editingChannelId
            ? {
                ...channel,
                name: cleanName,
                description: cleanDescription,
                visibility,
                allowedRoles,
              }
            : channel
        )
      );
    } else {
      const newChannel: Channel = {
        id: Date.now().toString(),
        name: cleanName,
        description: cleanDescription || 'New workspace channel.',
        visibility,
        allowedRoles,
        members: [],
        isDefault: false,
      };

      setChannels((current) => [...current, newChannel]);
      setSelectedChannelId(newChannel.id);
    }

    setModalVisible(false);
  };

  const deleteChannel = () => {
    if (!selectedChannel) return;

    if (selectedChannel.isDefault) {
      Alert.alert(
        'Default channel protected',
        'Default workspace channels cannot be deleted.'
      );
      return;
    }

    Alert.alert(
      'Delete channel',
      `Are you sure you want to delete ${selectedChannel.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const remaining = channels.filter(
              (channel) => channel.id !== selectedChannel.id
            );

            setChannels(remaining);
            setSelectedChannelId(remaining[0]?.id ?? '');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>WORKSPACE MANAGEMENT</Text>
            <Text style={styles.heading}>Channels</Text>
            <Text style={styles.subtitle}>
              Organise conversations and team collaboration.
            </Text>
          </View>

          <View style={styles.logo}>
            <Text style={styles.logoText}>CF</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Workspace channels</Text>
          <Text style={styles.infoText}>
            Create dedicated spaces for announcements, projects,
            management and team discussions.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{channels.length}</Text>
            <Text style={styles.summaryLabel}>Total channels</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#15803D' }]}>
              {publicCount}
            </Text>
            <Text style={styles.summaryLabel}>Public</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#9333EA' }]}>
              {privateCount}
            </Text>
            <Text style={styles.summaryLabel}>Private</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workspace channels</Text>
          <Pressable style={styles.addButton} onPress={openCreateModal}>
            <Text style={styles.addButtonText}>+ Create channel</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search channels..."
          placeholderTextColor="#94A3B8"
        />

        <View style={styles.filterRow}>
          {(['All', 'Public', 'Private'] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterButton,
                filter === item && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.activeFilterText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {filteredChannels.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No matching channels found.</Text>
          </View>
        ) : (
          <View style={styles.channelList}>
            {filteredChannels.map((channel) => {
              const isSelected = channel.id === selectedChannelId;

              return (
                <Pressable
                  key={channel.id}
                  onPress={() => setSelectedChannelId(channel.id)}
                  style={[
                    styles.channelCard,
                    isSelected && styles.selectedChannelCard,
                  ]}
                >
                  <View style={styles.channelTop}>
                    <View style={styles.channelIcon}>
                      <Text style={styles.channelIconText}>#</Text>
                    </View>

                    <View style={styles.channelInfo}>
                      <Text style={styles.channelName}>{channel.name}</Text>
                      <Text style={styles.channelDescription} numberOfLines={2}>
                        {channel.description}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.visibilityBadge,
                        channel.visibility === 'Private'
                          ? styles.privateBadge
                          : styles.publicBadge,
                      ]}
                    >
                      {channel.visibility}
                    </Text>
                  </View>

                  <View style={styles.channelFooter}>
                    <Text style={styles.channelMeta}>
                      {channel.members.length} members
                    </Text>
                    {channel.isDefault && (
                      <Text style={styles.defaultLabel}>DEFAULT</Text>
                    )}
                    {isSelected && (
                      <Text style={styles.selectedLabel}>SELECTED</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {selectedChannel && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Channel settings</Text>
              <Pressable onPress={openEditModal}>
                <Text style={styles.editButton}>Edit channel</Text>
              </Pressable>
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeading}>
                #{selectedChannel.name}
              </Text>
              <Text style={styles.detailsDescription}>
                {selectedChannel.description}
              </Text>

              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>Visibility</Text>
                <Text style={styles.detailValue}>
                  {selectedChannel.visibility}
                </Text>
              </View>

              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>Accessible roles</Text>
                <Text style={styles.detailValue}>
                  {selectedChannel.allowedRoles.join(', ')}
                </Text>
              </View>

              <View style={styles.detailLine}>
                <Text style={styles.detailLabel}>Assigned members</Text>
                <Text style={styles.detailValue}>
                  {selectedChannel.members.length}
                </Text>
              </View>

              <Text style={styles.detailsHeading}>Channel members</Text>

              {selectedChannel.members.length === 0 ? (
                <Text style={styles.emptyText}>
                  No members assigned yet.
                </Text>
              ) : (
                selectedChannel.members.map((member) => (
                  <View key={member} style={styles.memberRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {member.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.memberName}>{member}</Text>
                  </View>
                ))
              )}

              {!selectedChannel.isDefault && (
                <Pressable
                  style={styles.deleteButton}
                  onPress={deleteChannel}
                >
                  <Text style={styles.deleteButtonText}>Delete channel</Text>
                </Pressable>
              )}
            </View>
          </>
        )}

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Development preview</Text>
          <Text style={styles.noticeText}>
            Channel information and role access currently use local sample
            data. Actual channel membership, messaging and server-side access
            enforcement will be connected later.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {editingChannelId ? 'Edit channel' : 'Create channel'}
              </Text>

              <Text style={styles.inputLabel}>Channel name</Text>
              <TextInput
                style={styles.input}
                value={channelName}
                onChangeText={setChannelName}
                placeholder="e.g. Marketing"
                placeholderTextColor="#94A3B8"
                maxLength={40}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={channelDescription}
                onChangeText={setChannelDescription}
                placeholder="Describe the purpose of this channel"
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={150}
              />

              <Text style={styles.inputLabel}>Visibility</Text>

              <View style={styles.visibilityOptions}>
                {(['Public', 'Private'] as const).map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => setVisibility(item)}
                    style={[
                      styles.visibilityOption,
                      visibility === item && styles.activeVisibilityOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.visibilityOptionText,
                        visibility === item && styles.activeVisibilityText,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Roles with access</Text>

              {availableRoles.map((role) => (
                <View key={role} style={styles.roleRow}>
                  <Text style={styles.roleName}>{role}</Text>
                  <Switch
                    value={allowedRoles.includes(role)}
                    onValueChange={() => toggleRole(role)}
                    trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                    thumbColor={
                      allowedRoles.includes(role) ? '#2459A9' : '#F8FAFC'
                    }
                  />
                </View>
              ))}

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable style={styles.saveButton} onPress={saveChannel}>
                  <Text style={styles.saveButtonText}>Save channel</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { padding: 20, paddingBottom: 35 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  headerText: { flex: 1, paddingRight: 10 },
  eyebrow: {
    color: '#2459A9',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heading: { color: '#172B4D', fontSize: 25, fontWeight: '800' },
  subtitle: { color: '#64748B', fontSize: 13, marginTop: 5 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2459A9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  infoCard: {
    backgroundColor: '#EAF1FC',
    padding: 17,
    borderRadius: 15,
    marginBottom: 20,
  },
  infoTitle: {
    color: '#1E3A70',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  infoText: { color: '#526784', fontSize: 13, lineHeight: 20 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 23 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  summaryNumber: {
    color: '#2459A9',
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: { color: '#64748B', fontSize: 10, marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#172B4D',
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#2459A9',
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 9,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E7F0',
    borderRadius: 10,
    padding: 13,
    color: '#172B4D',
    fontSize: 13,
    marginBottom: 12,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  filterButton: {
    backgroundColor: '#E9EEF5',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  activeFilter: { backgroundColor: '#2459A9' },
  filterText: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  activeFilterText: { color: '#FFFFFF' },
  channelList: { gap: 10, marginBottom: 23 },
  channelCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAF2',
    borderRadius: 13,
    padding: 14,
  },
  selectedChannelCard: {
    borderColor: '#2459A9',
    borderWidth: 2,
    backgroundColor: '#F8FAFF',
  },
  channelTop: { flexDirection: 'row', alignItems: 'center' },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF1FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  channelIconText: { color: '#2459A9', fontSize: 22, fontWeight: '800' },
  channelInfo: { flex: 1, paddingRight: 6 },
  channelName: { color: '#172B4D', fontSize: 14, fontWeight: '800' },
  channelDescription: { color: '#64748B', fontSize: 11, marginTop: 4 },
  visibilityBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    overflow: 'hidden',
  },
  publicBadge: { color: '#166534', backgroundColor: '#DCFCE7' },
  privateBadge: { color: '#7E22CE', backgroundColor: '#F3E8FF' },
  channelFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  channelMeta: { color: '#8491A3', fontSize: 10 },
  defaultLabel: { color: '#64748B', fontSize: 9, fontWeight: '800' },
  selectedLabel: { color: '#2459A9', fontSize: 9, fontWeight: '800' },
  editButton: { color: '#2459A9', fontSize: 13, fontWeight: '800' },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8EDF5',
  },
  detailsHeading: {
    color: '#172B4D',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 9,
  },
  detailsDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 14,
  },
  detailLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
    gap: 12,
  },
  detailLabel: { color: '#64748B', fontSize: 11, flex: 1 },
  detailValue: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF1FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#2459A9', fontWeight: '800' },
  memberName: { color: '#334155', fontSize: 13, fontWeight: '600' },
  deleteButton: {
    backgroundColor: '#FEF2F2',
    borderRadius: 9,
    padding: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  deleteButtonText: { color: '#B91C1C', fontSize: 12, fontWeight: '800' },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  emptyText: { color: '#8491A3', fontSize: 12 },
  notice: {
    backgroundColor: '#FFF7E8',
    borderRadius: 12,
    padding: 14,
    marginTop: 5,
  },
  noticeTitle: {
    color: '#92400E',
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 5,
  },
  noticeText: { color: '#946B35', fontSize: 11, lineHeight: 17 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
  },
  modalTitle: {
    color: '#172B4D',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 7,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DCE3ED',
    borderRadius: 10,
    padding: 12,
    color: '#172B4D',
    fontSize: 13,
    marginBottom: 16,
  },
  descriptionInput: { minHeight: 80, textAlignVertical: 'top' },
  visibilityOptions: { flexDirection: 'row', gap: 10, marginBottom: 17 },
  visibilityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 9,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
  },
  activeVisibilityOption: { backgroundColor: '#2459A9' },
  visibilityOptionText: { color: '#475569', fontWeight: '700', fontSize: 12 },
  activeVisibilityText: { color: '#FFFFFF' },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
  },
  roleName: { color: '#334155', fontSize: 12, fontWeight: '700' },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 22,
  },
  cancelButton: {
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderRadius: 9,
    backgroundColor: '#EEF2F7',
  },
  cancelButtonText: { color: '#475569', fontWeight: '700', fontSize: 12 },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9,
    backgroundColor: '#2459A9',
  },
  saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
});
