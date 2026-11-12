
import { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type TaskFormValues = {
  title: string;
  description: string;
  category: string;
  assignee: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Under Review' | 'Completed';
  startDate: string;
  dueDate: string;
};

type TaskFormModalProps = {
  visible: boolean;
  initialTask: TaskFormValues | null;
  approvedMembers: string[];
  onClose: () => void;
  onSave: (values: TaskFormValues) => void;
};

const priorities: TaskFormValues['priority'][] = [
  'High',
  'Medium',
  'Low',
];

const statuses: TaskFormValues['status'][] = [
  'Pending',
  'In Progress',
  'Under Review',
  'Completed',
];

function todayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const emptyForm = (): TaskFormValues => ({
  title: '',
  description: '',
  category: '',
  assignee: '',
  priority: 'Medium',
  status: 'Pending',
  startDate: todayString(),
  dueDate: todayString(),
});

export default function TaskFormModal({
  visible,
  initialTask,
  approvedMembers,
  onClose,
  onSave,
}: TaskFormModalProps) {
  const [form, setForm] = useState<TaskFormValues>(emptyForm());

  useEffect(() => {
    if (visible) {
      setForm(initialTask ? { ...initialTask } : emptyForm());
    }
  }, [visible, initialTask]);

  const updateField = <K extends keyof TaskFormValues>(
    field: K,
    value: TaskFormValues[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Check task details', message);
    }
  };


const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  // Use UTC to prevent local timezone differences
  // from changing the calendar date.
  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
};


  const handleSave = () => {
    if (!form.title.trim()) {
      showError('Please enter a task title.');
      return;
    }

    if (!form.description.trim()) {
      showError('Please enter a task description.');
      return;
    }

    if (!form.category.trim()) {
      showError('Please enter a task category.');
      return;
    }

    if (!form.assignee) {
      showError('Please select an approved team member.');
      return;
    }

    if (!approvedMembers.includes(form.assignee)) {
      showError('The selected member is not currently approved.');
      return;
    }

    if (!isValidDate(form.startDate) || !isValidDate(form.dueDate)) {
      showError('Enter valid dates using YYYY-MM-DD.');
      return;
    }

    if (form.dueDate < form.startDate) {
      showError('The due date cannot be earlier than the start date.');
      return;
    }

    onSave({
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
    });
  };

  const renderChoice = <T extends string>(
    label: string,
    options: T[],
    selected: T,
    onSelect: (value: T) => void
  ) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choiceList}>
        {options.map((option) => {
          const active = selected === option;

          return (
            <Pressable
              key={option}
              onPress={() => onSelect(option)}
              style={[
                styles.choice,
                active && styles.choiceActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  active && styles.choiceTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.modal}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>WORKSPACE MANAGEMENT</Text>
            <Text style={styles.heading}>
              {initialTask ? 'Edit task' : 'Create task'}
            </Text>
          </View>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            Provide the task details, choose an approved team member and
            set the expected timeline.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Task title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Prepare monthly report"
              placeholderTextColor="#94A3B8"
              value={form.title}
              onChangeText={(value) => updateField('title', value)}
              maxLength={100}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe the work and expected outcome..."
              placeholderTextColor="#94A3B8"
              value={form.description}
              onChangeText={(value) => updateField('description', value)}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Category *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Administration, Planning, Reporting"
              placeholderTextColor="#94A3B8"
              value={form.category}
              onChangeText={(value) => updateField('category', value)}
              maxLength={60}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Assign to approved member *</Text>
            <View style={styles.memberList}>
              {approvedMembers.map((member) => {
                const active = form.assignee === member;

                return (
                  <Pressable
                    key={member}
                    onPress={() => updateField('assignee', member)}
                    style={[
                      styles.memberChoice,
                      active && styles.memberChoiceActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.memberText,
                        active && styles.memberTextActive,
                      ]}
                    >
                      {member}
                    </Text>
                    {active && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {renderChoice(
            'Priority',
            priorities,
            form.priority,
            (value) => updateField('priority', value)
          )}

          {renderChoice(
            'Initial status',
            statuses,
            form.status,
            (value) => updateField('status', value)
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Start date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              value={form.startDate}
              onChangeText={(value) => updateField('startDate', value)}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Due date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              value={form.dueDate}
              onChangeText={(value) => updateField('dueDate', value)}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>

          <Text style={styles.helper}>
            Dates must use YYYY-MM-DD format. The due date must be on or
            after the start date.
          </Text>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {initialTask ? 'Save changes' : 'Create task'}
            </Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          <Text style={styles.footerNote}>
            Development preview · Changes are stored locally for now.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: '#F4F6FB',
    paddingTop: Platform.OS === 'android' ? 35 : 55,
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  heading: {
    color: '#172033',
    fontSize: 29,
    fontWeight: '800',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#334155',
    fontSize: 19,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 40,
  },
  intro: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 21,
  },
  label: {
    color: '#25334A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 9,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#DCE3EC',
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
    color: '#172033',
    fontSize: 14,
  },
  textArea: {
    minHeight: 110,
  },
  memberList: {
    gap: 9,
  },
  memberChoice: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberChoiceActive: {
    borderColor: '#2459A9',
    backgroundColor: '#EAF1FC',
  },
  memberText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  memberTextActive: {
    color: '#2459A9',
    fontWeight: '800',
  },
  checkmark: {
    color: '#2459A9',
    fontSize: 18,
    fontWeight: '800',
  },
  choiceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choice: {
    borderWidth: 1,
    borderColor: '#DCE3EC',
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 13,
  },
  choiceActive: {
    backgroundColor: '#2459A9',
    borderColor: '#2459A9',
  },
  choiceText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  helper: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginTop: -7,
    marginBottom: 20,
  },
  saveButton: {
    minHeight: 54,
    borderRadius: 13,
    backgroundColor: '#2459A9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    minHeight: 50,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 9,
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 15,
  },
});
