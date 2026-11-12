
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

type Permission = {
  id: string;
  label: string;
  description: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  members: string[];
  permissions: string[];
  isDefault: boolean;
};

const availablePermissions: Permission[] = [
  {
    id: 'manage_members',
    label: 'Manage members',
    description: 'Approve, invite and manage workspace members.',
  },
  {
    id: 'manage_roles',
    label: 'Manage roles',
    description: 'Create and manage workspace roles.',
  },
  {
    id: 'manage_channels',
    label: 'Manage channels',
    description: 'Create and manage organisation channels.',
  },
  {
    id: 'create_tasks',
    label: 'Create tasks',
    description: 'Create and assign tasks to team members.',
  },
  {
    id: 'manage_tasks',
    label: 'Manage tasks',
    description: 'Edit and manage tasks across the workspace.',
  },
  {
    id: 'view_reports',
    label: 'View reports',
    description: 'Access workspace progress and reports.',
  },
];

const initialRoles: Role[] = [
  {
    id: '1',
    name: 'Owner',
    description: 'Full control of the organisation.',
    members: ['Nigel Fariso'],
    permissions: availablePermissions.map((permission) => permission.id),
    isDefault: true,
  },
  {
    id: '2',
    name: 'Admin',
    description: 'Manages workspace administration.',
    members: [],
    permissions: [
      'manage_members',
      'manage_channels',
      'create_tasks',
      'manage_tasks',
      'view_reports',
    ],
    isDefault: true,
  },
  {
    id: '3',
    name: 'Manager',
    description: 'Coordinates team activities and tasks.',
    members: ['Tariro Moyo'],
    permissions: [
      'create_tasks',
      'manage_tasks',
      'view_reports',
    ],
    isDefault: true,
  },
  {
    id: '4',
    name: 'Member',
    description: 'Participates in assigned team activities.',
    members: ['Tendai Ncube', 'Rudo Dube'],
    permissions: ['create_tasks'],
    isDefault: true,
  },
];

export default function RolesScreen() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState('1');

  const [modalVisible, setModalVisible] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? roles[0],
    [roles, selectedRoleId]
  );

  const openCreateModal = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRoleDescription('');
    setModalVisible(true);
  };

  const openEditModal = () => {
    if (!selectedRole || selectedRole.isDefault) return;

    setEditingRoleId(selectedRole.id);
    setRoleName(selectedRole.name);
    setRoleDescription(selectedRole.description);
    setModalVisible(true);
  };

  const saveRole = () => {
    const cleanName = roleName.trim();
    const cleanDescription = roleDescription.trim();

    if (!cleanName) {
      Alert.alert('Role name required', 'Please enter a role name.');
      return;
    }

    const duplicate = roles.some(
      (role) =>
        role.name.toLowerCase() === cleanName.toLowerCase() &&
        role.id !== editingRoleId
    );

    if (duplicate) {
      Alert.alert('Role already exists', 'Choose a different role name.');
      return;
    }

    if (editingRoleId) {
      setRoles((current) =>
        current.map((role) =>
          role.id === editingRoleId
            ? {
                ...role,
                name: cleanName,
                description: cleanDescription,
              }
            : role
        )
      );
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        name: cleanName,
        description: cleanDescription || 'Custom organisation role.',
        members: [],
        permissions: [],
        isDefault: false,
      };

      setRoles((current) => [...current, newRole]);
      setSelectedRoleId(newRole.id);
    }

    setModalVisible(false);
  };

  const togglePermission = (permissionId: string) => {
    if (!selectedRole || selectedRole.name === 'Owner') return;

    setRoles((current) =>
      current.map((role) => {
        if (role.id !== selectedRole.id) return role;

        const hasPermission = role.permissions.includes(permissionId);

        return {
          ...role,
          permissions: hasPermission
            ? role.permissions.filter((id) => id !== permissionId)
            : [...role.permissions, permissionId],
        };
      })
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>WORKSPACE MANAGEMENT</Text>
            <Text style={styles.heading}>Roles & Permissions</Text>
            <Text style={styles.subtitle}>
              Define responsibilities and access levels.
            </Text>
          </View>

          <View style={styles.logo}>
            <Text style={styles.logoText}>CF</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Organisation access control</Text>
          <Text style={styles.infoText}>
            Assign responsibilities through roles and control which
            workspace features each role can access.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workspace roles</Text>
          <Pressable style={styles.addButton} onPress={openCreateModal}>
            <Text style={styles.addButtonText}>+ Create role</Text>
          </Pressable>
        </View>

        <View style={styles.roleList}>
          {roles.map((role) => {
            const isSelected = role.id === selectedRoleId;

            return (
              <Pressable
                key={role.id}
                onPress={() => setSelectedRoleId(role.id)}
                style={[
                  styles.roleCard,
                  isSelected && styles.selectedRoleCard,
                ]}
              >
                <View style={styles.roleTop}>
                  <View style={styles.roleIcon}>
                    <Text style={styles.roleIconText}>
                      {role.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.roleInfo}>
                    <Text style={styles.roleName}>{role.name}</Text>
                    <Text style={styles.roleDescription}>
                      {role.description}
                    </Text>
                  </View>

                  {role.name === 'Owner' ? (
                    <Text style={styles.protectedLabel}>PROTECTED</Text>
                  ) : (
                    <Text style={styles.memberCount}>
                      {role.members.length} members
                    </Text>
                  )}
                </View>

                {isSelected && (
                  <Text style={styles.selectedLabel}>SELECTED ROLE</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {selectedRole && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedRole.name} permissions
              </Text>

              {!selectedRole.isDefault && (
                <Pressable onPress={openEditModal}>
                  <Text style={styles.editButton}>Edit role</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeading}>
                Permission settings
              </Text>

              {selectedRole.name === 'Owner' && (
                <Text style={styles.protectedMessage}>
                  Owner permissions are protected and cannot be changed.
                </Text>
              )}

              {availablePermissions.map((permission) => {
                const enabled = selectedRole.permissions.includes(
                  permission.id
                );

                return (
                  <View key={permission.id} style={styles.permissionRow}>
                    <View style={styles.permissionInfo}>
                      <Text style={styles.permissionName}>
                        {permission.label}
                      </Text>
                      <Text style={styles.permissionDescription}>
                        {permission.description}
                      </Text>
                    </View>

                    <Switch
                      value={enabled}
                      onValueChange={() =>
                        togglePermission(permission.id)
                      }
                      disabled={selectedRole.name === 'Owner'}
                      trackColor={{
                        false: '#CBD5E1',
                        true: '#93C5FD',
                      }}
                      thumbColor={enabled ? '#2459A9' : '#F8FAFC'}
                    />
                  </View>
                );
              })}
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.detailsHeading}>Assigned members</Text>

              {selectedRole.members.length === 0 ? (
                <Text style={styles.emptyText}>
                  No members are currently assigned to this role.
                </Text>
              ) : (
                selectedRole.members.map((member) => (
                  <View key={member} style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {member.charAt(0)}
                      </Text>
                    </View>

                    <Text style={styles.memberName}>{member}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Development preview</Text>
          <Text style={styles.noticeText}>
            Roles and permissions currently use local sample data.
            Changes are not yet saved to Supabase or enforced as
            server-side access controls.
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
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingRoleId ? 'Edit custom role' : 'Create custom role'}
            </Text>

            <Text style={styles.inputLabel}>Role name</Text>
            <TextInput
              style={styles.input}
              value={roleName}
              onChangeText={setRoleName}
              placeholder="e.g. Team Supervisor"
              placeholderTextColor="#94A3B8"
              maxLength={40}
            />

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={roleDescription}
              onChangeText={setRoleDescription}
              placeholder="Describe this role's responsibilities"
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={150}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.saveButton} onPress={saveRole}>
                <Text style={styles.saveButtonText}>Save role</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  headerText: {
    flex: 1,
    paddingRight: 10,
  },
  eyebrow: {
    color: '#2459A9',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heading: {
    color: '#172B4D',
    fontSize: 25,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 5,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2459A9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: '#EAF1FC',
    padding: 17,
    borderRadius: 15,
    marginBottom: 24,
  },
  infoTitle: {
    color: '#1E3A70',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
  },
  infoText: {
    color: '#526784',
    fontSize: 13,
    lineHeight: 20,
  },
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
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  roleList: {
    gap: 10,
    marginBottom: 23,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EAF2',
    borderRadius: 13,
    padding: 14,
  },
  selectedRoleCard: {
    borderColor: '#2459A9',
    borderWidth: 2,
    backgroundColor: '#F8FAFF',
  },
  roleTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EAF1FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  roleIconText: {
    color: '#2459A9',
    fontSize: 17,
    fontWeight: '800',
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    color: '#172B4D',
    fontSize: 14,
    fontWeight: '800',
  },
  roleDescription: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  memberCount: {
    color: '#64748B',
    fontSize: 10,
  },
  protectedLabel: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  selectedLabel: {
    color: '#2459A9',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: 0.8,
  },
  editButton: {
    color: '#2459A9',
    fontSize: 13,
    fontWeight: '800',
  },
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
    marginBottom: 13,
  },
  protectedMessage: {
    backgroundColor: '#ECFDF5',
    color: '#166534',
    padding: 10,
    borderRadius: 8,
    fontSize: 11,
    marginBottom: 12,
    overflow: 'hidden',
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
  },
  permissionInfo: {
    flex: 1,
    paddingRight: 10,
  },
  permissionName: {
    color: '#243B5A',
    fontSize: 13,
    fontWeight: '700',
  },
  permissionDescription: {
    color: '#8491A3',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
  },
  memberAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EAF1FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  memberAvatarText: {
    color: '#2459A9',
    fontWeight: '800',
  },
  memberName: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    color: '#8491A3',
    fontSize: 12,
    paddingVertical: 8,
  },
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
  noticeText: {
    color: '#946B35',
    fontSize: 11,
    lineHeight: 17,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
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
  descriptionInput: {
    minHeight: 85,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 5,
  },
  cancelButton: {
    paddingHorizontal: 17,
    paddingVertical: 12,
    borderRadius: 9,
    backgroundColor: '#EEF2F7',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 12,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9,
    backgroundColor: '#2459A9',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
