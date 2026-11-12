import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';


import type { TaskFormValues } from './TaskFormModal';

export type TaskDetails = TaskFormValues & {
  id: number;
};

export type TaskComment = {
  id: string;
  taskId: number;
  author: string;
  message: string;
  createdAt: string;
};

export type TaskEscalation = {
  status: 'Blocked' | 'Escalated' | 'Resolved';
  reason: string;
  reportedBy: string;
  manager: string;
  createdAt: string;
};

type TaskDetailsModalProps = {
  visible: boolean;
  task: TaskDetails | null;
  onClose: () => void;
  onEdit: (task: TaskDetails) => void;
  onUpdateStatus: (task: TaskDetails) => void;
  comments: TaskComment[];
  onAddComment: (taskId: number, message: string) => void;
  escalation: TaskEscalation | null;
  onReportBlocked: (taskId: number, reason: string) => void;
  onEscalate: (taskId: number) => void;
  onResolveEscalation: (taskId: number) => void;
};

const statusColors: Record<TaskFormValues['status'], string> = {
  Pending: '#D97706',
  'In Progress': '#2563EB',
  'Under Review': '#9333EA',
  Completed: '#159957',
};

const priorityColors: Record<TaskFormValues['priority'], string> = {
  High: '#DC2626',
  Medium: '#D97706',
  Low: '#159957',
};

const nextStatusAction: Record<TaskFormValues['status'], string> = {
  Pending: 'Start task',
  'In Progress': 'Submit for review',
  'Under Review': 'Mark completed',
  Completed: 'Restart task',
};

export default function TaskDetailsModal({
  visible,
  task,
  onClose,
  onEdit,
  onUpdateStatus,
  comments,
  onAddComment,
  escalation,
  onReportBlocked,
  onEscalate,
  onResolveEscalation,
}: TaskDetailsModalProps) {
  const [commentText, setCommentText] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const submitComment = () => {
    const message = commentText.trim();

    if (!task || !message) {
      return;
    }

    onAddComment(task.id, message);
    setCommentText('');
  };

  if (!task) {
    return null;
  }

  const handleEdit = () => {
    onClose();
    onEdit(task);
  };

  const handleStatusUpdate = () => {
    onUpdateStatus(task);
  };

  const submitBlocker = () => {
    const reason = blockReason.trim();

    if (!reason) {
      return;
    }

    onReportBlocked(task.id, reason);
    setBlockReason('');
  };

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
            <Text style={styles.heading}>Task details</Text>
          </View>

          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close task details"
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainCard}>
            <Text style={styles.category}>{task.category}</Text>

            <Text style={styles.title}>{task.title}</Text>

            <Text style={styles.description}>
              {task.description}
            </Text>

            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: `${statusColors[task.status]}18` },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: statusColors[task.status] },
                  ]}
                >
                  {task.status}
                </Text>
              </View>

              <View
                style={[
                  styles.badge,
                  { backgroundColor: `${priorityColors[task.priority]}18` },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: priorityColors[task.priority] },
                  ]}
                >
                  {task.priority} priority
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Assignment</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>ASSIGNED MEMBER</Text>
            <Text style={styles.infoValue}>{task.assignee}</Text>

            <View style={styles.divider} />

            <Text style={styles.infoLabel}>TASK CATEGORY</Text>
            <Text style={styles.infoValue}>{task.category}</Text>
          </View>

          <Text style={styles.sectionTitle}>Task timeline</Text>

          <View style={styles.infoCard}>
            <View style={styles.dateRow}>
              <View style={styles.dateMarker}>
                <Text style={styles.markerText}>S</Text>
              </View>

              <View style={styles.dateContent}>
                <Text style={styles.infoLabel}>START DATE</Text>
                <Text style={styles.infoValue}>{task.startDate}</Text>
              </View>
            </View>

            <View style={styles.timelineLine} />

            <View style={styles.dateRow}>
              <View style={styles.dateMarker}>
                <Text style={styles.markerText}>D</Text>
              </View>

              <View style={styles.dateContent}>
                <Text style={styles.infoLabel}>DUE DATE</Text>
                <Text style={styles.infoValue}>{task.dueDate}</Text>
              </View>
            </View>
          </View>


          <Text style={styles.sectionTitle}>Task escalation</Text>

          <View style={styles.escalationCard}>
            {!escalation ? (
              <>
                <Text style={styles.escalationHeading}>
                  Is this task blocked?
                </Text>

                <Text style={styles.escalationDescription}>
                  Report an issue that is preventing progress. You can then
                  escalate it to the responsible manager.
                </Text>

                <Text style={styles.inputLabel}>BLOCKER REASON</Text>

                <TextInput
                  style={styles.escalationInput}
                  value={blockReason}
                  onChangeText={setBlockReason}
                  placeholder="Explain what is preventing this task..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  textAlignVertical="top"
                  maxLength={1000}
                />

                <Text style={styles.characterCount}>
                  {blockReason.length}/1000
                </Text>

                <Pressable
                  style={[
                    styles.escalationPrimaryButton,
                    !blockReason.trim() && styles.commentButtonDisabled,
                  ]}
                  onPress={submitBlocker}
                  disabled={!blockReason.trim()}
                >
                  <Text style={styles.escalationPrimaryButtonText}>
                    Report as blocked
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.escalationStatus}>
                  <Text style={styles.escalationStatusText}>
                    {escalation.status.toUpperCase()}
                  </Text>
                </View>

                <Text style={styles.escalationHeading}>
                  Escalation details
                </Text>

                <Text style={styles.escalationDescription}>
                  {escalation.reason}
                </Text>

                <Text style={styles.escalationMeta}>
                  Reported by: {escalation.reportedBy}
                </Text>

                <Text style={styles.escalationMeta}>
                  Reported: {escalation.createdAt}
                </Text>

                {escalation.status === 'Blocked' && (
                  <Pressable
                    style={styles.escalationPrimaryButton}
                    onPress={() => onEscalate(task.id)}
                  >
                    <Text style={styles.escalationPrimaryButtonText}>
                      Escalate to manager
                    </Text>
                  </Pressable>
                )}

                {escalation.status === 'Escalated' && (
                  <>
                    <Text style={styles.escalationMeta}>
                      Responsible manager: {escalation.manager}
                    </Text>

                    <Pressable
                      style={styles.escalationPrimaryButton}
                      onPress={() => onResolveEscalation(task.id)}
                    >
                      <Text style={styles.escalationPrimaryButtonText}>
                        Mark escalation resolved
                      </Text>
                    </Pressable>
                  </>
                )}

                {escalation.status === 'Resolved' && (
                  <Text style={styles.escalationResolvedText}>
                    This escalation has been resolved.
                  </Text>
                )}
              </>
            )}
          </View>

          <Text style={styles.sectionTitle}>Task discussion</Text>

          <View style={styles.commentsCard}>
            <Text style={styles.commentsHeading}>
              Comments ({comments.length})
            </Text>

            {comments.length > 0 ? (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.author
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.commentBody}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>
                        {comment.author}
                      </Text>
                      <Text style={styles.commentTime}>
                        {comment.createdAt}
                      </Text>
                    </View>

                    <Text style={styles.commentMessage}>
                      {comment.message}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyComments}>
                <Text style={styles.emptyCommentsTitle}>
                  No comments yet
                </Text>
                <Text style={styles.emptyCommentsText}>
                  Start the discussion by sharing a progress update or comment.
                </Text>
              </View>
            )}

            <View style={styles.commentInputContainer}>
              <Text style={styles.inputLabel}>ADD A COMMENT</Text>

              <TextInput
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Write your comment here..."
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />

              <Text style={styles.characterCount}>
                {commentText.length}/1000
              </Text>

              <Pressable
                style={[
                  styles.commentButton,
                  !commentText.trim() && styles.commentButtonDisabled,
                ]}
                onPress={submitComment}
                disabled={!commentText.trim()}
              >
                <Text style={styles.commentButtonText}>
                  Post comment
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={handleStatusUpdate}
          >
            <Text style={styles.primaryButtonText}>
              {nextStatusAction[task.status]}
            </Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleEdit}
          >
            <Text style={styles.secondaryButtonText}>Edit task</Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Close details</Text>
          </Pressable>

          <Text style={styles.footer}>
            CollabFlow · Task #{task.id} · Local development data
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
    escalationCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      padding: 18,
      marginBottom: 25,
    },
    escalationHeading: {
      color: '#172033',
      fontSize: 15,
      fontWeight: '800',
      marginBottom: 8,
    },
    escalationDescription: {
      color: '#64748B',
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 15,
    },
    escalationInput: {
      minHeight: 95,
      borderWidth: 1,
      borderColor: '#CBD5E1',
      borderRadius: 12,
      padding: 12,
      color: '#25334A',
      fontSize: 13,
      marginTop: 8,
    },
    escalationPrimaryButton: {
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: '#B45309',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
      paddingHorizontal: 12,
    },
    escalationPrimaryButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
    escalationStatus: {
      alignSelf: 'flex-start',
      backgroundColor: '#FEF3C7',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
      marginBottom: 12,
    },
    escalationStatusText: {
      color: '#92400E',
      fontSize: 11,
      fontWeight: '800',
    },
    escalationMeta: {
      color: '#64748B',
      fontSize: 12,
      marginBottom: 8,
    },
    escalationResolvedText: {
      color: '#159957',
      fontSize: 13,
      fontWeight: '800',
      marginTop: 12,
    },
    commentsCard: {
      backgroundColor: '#fff',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      padding: 18,
      marginBottom: 25,
    },
    commentsHeading: {
      color: '#172033',
      fontSize: 16,
      fontWeight: '800',
      marginBottom: 14,
    },
    commentItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 18,
    },
    commentAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#E2E8F0',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    commentAvatarText: {
      color: '#2459A9',
      fontWeight: '800',
      fontSize: 15,
    },
    commentBody: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
      gap: 8,
    },
    commentAuthor: {
      color: '#172033',
      fontWeight: '700',
      fontSize: 13,
      marginRight: 8,
    },
    commentTime: {
      color: '#64748B',
      fontSize: 11,
      fontWeight: '400',
    },
    commentMessage: {
      color: '#25334A',
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 2,
    },
    emptyComments: {
      alignItems: 'center',
      marginVertical: 18,
    },
    emptyCommentsTitle: {
      color: '#64748B',
      fontWeight: '700',
      fontSize: 14,
      marginBottom: 4,
    },
    emptyCommentsText: {
      color: '#94A3B8',
      fontSize: 13,
      textAlign: 'center',
      lineHeight: 18,
    },
    commentInputContainer: {
      marginTop: 18,
      backgroundColor: '#F1F5F9',
      borderRadius: 12,
      padding: 12,
    },
    inputLabel: {
      color: '#64748B',
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 7,
      letterSpacing: 1,
    },
    commentInput: {
      backgroundColor: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      padding: 10,
      fontSize: 14,
      minHeight: 60,
      maxHeight: 120,
      marginBottom: 7,
    },
    characterCount: {
      color: '#94A3B8',
      fontSize: 11,
      alignSelf: 'flex-end',
      marginBottom: 7,
    },
    commentButton: {
      backgroundColor: '#2459A9',
      borderRadius: 8,
      paddingVertical: 10,
      alignItems: 'center',
    },
    commentButtonDisabled: {
      backgroundColor: '#CBD5E1',
    },
    commentButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 14,
      letterSpacing: 1,
    },
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
  mainCard: {
    backgroundColor: '#1B3F70',
    borderRadius: 23,
    padding: 22,
    marginBottom: 27,
  },
  category: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 33,
    marginBottom: 12,
  },
  description: {
    color: '#DBEAFE',
    fontSize: 14,
    lineHeight: 23,
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#172033',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 13,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 25,
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: {
    color: '#25334A',
    fontSize: 15,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF0F5',
    marginVertical: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  dateMarker: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#EAF1FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#2459A9',
    fontSize: 14,
    fontWeight: '800',
  },
  dateContent: {
    flex: 1,
  },
  timelineLine: {
    width: 2,
    height: 23,
    backgroundColor: '#DCE3EC',
    marginLeft: 16,
    marginVertical: 4,
  },
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 17,
    padding: 17,
    marginBottom: 13,
  },
  placeholderTitle: {
    color: '#25334A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 7,
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    minHeight: 53,
    borderRadius: 13,
    backgroundColor: '#2459A9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 51,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#2459A9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#2459A9',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  cancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
  },
});
