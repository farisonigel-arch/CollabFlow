import TaskFormModal, {
  type TaskFormValues,
} from '@/components/TaskFormModal';

import TaskDetailsModal, {
  type TaskComment,
  type TaskDetails,
  type TaskEscalation,
} from '@/components/TaskDetailsModal';
import { loadData, saveData, STORAGE_KEYS } from '@/utils/storage';
import { useLocalSearchParams } from 'expo-router';

import { useNotifications } from '@/context/NotificationContext';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TaskStatus = 'Pending' | 'In Progress' | 'Under Review' | 'Completed';
type Priority = 'High' | 'Medium' | 'Low';

type Task = {
  id: number;
  title: string;
  description: string;
  category: string;
  assignee: string;
  priority: Priority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
};

const initialTaskComments: Record<number, TaskComment[]> = {
  1: [
    {
      id: 'comment-1',
      taskId: 1,
      author: 'Tariro Moyo',
      message: 'Please include the latest membership figures in the review.',
      createdAt: 'Today, 9:30 AM',
    },
  ],
  2: [
    {
      id: 'comment-2',
      taskId: 2,
      author: 'Nigel Fariso',
      message: 'The proposal is ready for the next review stage.',
      createdAt: 'Today, 8:45 AM',
    },
  ],
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Review member applications',
    description: 'Review new membership applications and verify submitted information.',
    category: 'Administration',
    assignee: 'Nigel Fariso',
    priority: 'High',
    status: 'In Progress',
    startDate: '2026-10-29',
    dueDate: '2026-11-02',
  },
  {
    id: 2,
    title: 'Prepare project proposal',
    description: 'Complete the project proposal and prepare it for management review.',
    category: 'Planning',
    assignee: 'Tariro Moyo',
    priority: 'High',
    status: 'Under Review',
    startDate: '2026-10-30',
    dueDate: '2026-11-04',
  },
  {
    id: 3,
    title: 'Update team records',
    description: 'Check and update the organisation team records.',
    category: 'Administration',
    assignee: 'Tendai Ncube',
    priority: 'Medium',
    status: 'Pending',
    startDate: '2026-11-02',
    dueDate: '2026-11-06',
  },
  {
    id: 4,
    title: 'Prepare weekly progress report',
    description: 'Compile team progress and outstanding activities for the weekly report.',
    category: 'Reporting',
    assignee: 'Rudo Dube',
    priority: 'Medium',
    status: 'Completed',
    startDate: '2026-10-26',
    dueDate: '2026-10-28',
  },
  {
    id: 5,
    title: 'Coordinate team meeting',
    description: 'Arrange the next team coordination meeting and share the agenda.',
    category: 'Communication',
    assignee: 'Tariro Moyo',
    priority: 'Low',
    status: 'Pending',
    startDate: '2026-11-02',
    dueDate: '2026-11-08',
  },
];

const isTaskOverdue = (task: Task): boolean => {
  // Completed tasks are never counted as overdue.
  if (task.status === 'Completed') {
    return false;
  }

  // Compare calendar dates using the device's local timezone.
  const [year, month, day] = task.dueDate.split('-').map(Number);
  const dueDate = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate < today;
};

const filters = [
  'All',
  'Pending',
  'In Progress',
  'Under Review',
  'Completed',
] as const;

type Filter = (typeof filters)[number];

const statusColors: Record<TaskStatus, string> = {
  Pending: '#D97706',
  'In Progress': '#2563EB',
  'Under Review': '#9333EA',
  Completed: '#159957',
};

const priorityColors: Record<Priority, string> = {
  High: '#DC2626',
  Medium: '#D97706',
  Low: '#159957',
};

export default function TasksScreen() {
  const { taskId } = useLocalSearchParams<{
    taskId?: string;
  }>();
  const { addNotification } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');


  const [formVisible, setFormVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [taskComments, setTaskComments] =
    useState<Record<number, TaskComment[]>>(initialTaskComments);

  const [taskEscalations, setTaskEscalations] =
    useState<Record<number, TaskEscalation>>({});

  const [dataLoaded, setDataLoaded] = useState(false);
    useEffect(() => {
      let active = true;

      const restoreTasksData = async () => {
        try {
          const [savedTasks, savedComments, savedEscalations] =
            await Promise.all([
              loadData(STORAGE_KEYS.TASKS, initialTasks),
              loadData(STORAGE_KEYS.TASK_COMMENTS, initialTaskComments),
              loadData(
                STORAGE_KEYS.TASK_ESCALATIONS,
                {} as Record<number, TaskEscalation>
              ),
            ]);

          if (!active) return;

         setTasks(savedTasks);
         setTaskComments(savedComments);
         setTaskEscalations(savedEscalations);
        } catch (error) {
          console.error('Unable to restore Tasks data:', error);
        } finally {
          if (active) {
            setDataLoaded(true);
          }
        }
      };

      restoreTasksData();

      return () => {
        active = false;
      };
    }, []);

    useEffect(() => {
      if (!dataLoaded) return;

      const persistTasksData = async () => {
        try {
          await Promise.all([
            saveData(STORAGE_KEYS.TASKS, tasks),
            saveData(STORAGE_KEYS.TASK_COMMENTS, taskComments),
            saveData(STORAGE_KEYS.TASK_ESCALATIONS, taskEscalations),
          ]);
        } catch (error) {
          console.error('Unable to save Tasks data:', error);
        }
      };

      persistTasksData();
    }, [dataLoaded, tasks, taskComments, taskEscalations]);

  const routeTask = useMemo(() => {
    if (!taskId) return null;

    return tasks.find((task) => task.id === Number(taskId)) ?? null;
  }, [dataLoaded, taskId, tasks]);

  const activeTask = routeTask ?? selectedTask;
  const isDetailsVisible = detailsVisible || Boolean(routeTask);

  useEffect(() => {
    if (!dataLoaded) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      // Completed tasks do not need reminders.
      if (task.status === 'Completed') return;

      const [year, month, day] = task.dueDate.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      dueDate.setHours(0, 0, 0, 0);

      const daysUntilDue = Math.round(
        (Date.UTC(
          dueDate.getFullYear(),
          dueDate.getMonth(),
          dueDate.getDate()
        ) -
          Date.UTC(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          )) /
          (1000 * 60 * 60 * 24)
      );

      let title = '';
      let message = '';

      if (daysUntilDue < 0) {
        title = 'Task overdue';
        message = `${task.title} is overdue. Its due date was ${task.dueDate}.`;
      } else if (daysUntilDue === 0) {
        title = 'Task due today';
        message = `${task.title} is due today.`;
      } else if (daysUntilDue === 1) {
        title = 'Task due tomorrow';
        message = `${task.title} is due tomorrow.`;
      } else if (daysUntilDue <= 2) {
        title = 'Task due soon';
        message = `${task.title} is due in ${daysUntilDue} days.`;
      }

      if (!title) return;

      const reminderType =
        daysUntilDue < 0 ? 'overdue' : 'due';

      addNotification({
        id: `task-${reminderType}-${task.id}-${task.dueDate}`,
        title,
        message,
        type: 'Task',
        taskId: task.id,
      });
    });
  }, [dataLoaded, tasks, addNotification]);

  // Demonstration routing based on the sample Reporting Lines structure.
  const managerByAssignee: Record<string, string> = {
    'Nigel Fariso': 'No manager assigned',
    'Tariro Moyo': 'Nigel Fariso',
    'Tendai Ncube': 'Tariro Moyo',
    'Rudo Dube': 'Tariro Moyo',
  };

  const approvedMembers = [
    'Nigel Fariso',
    'Tariro Moyo',
  ];

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesFilter =
        activeFilter === 'All' || task.status === activeFilter;

      const matchesSearch =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.assignee.toLowerCase().includes(query) ||
        task.category.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [tasks, activeFilter, search]);

  const counts = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((task) => task.status === 'Pending').length,
    inProgress: tasks.filter((task) => task.status === 'In Progress').length,
    completed: tasks.filter((task) => task.status === 'Completed').length,
    overdue: tasks.filter(isTaskOverdue).length,
  }), [tasks]);

  const showTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setDetailsVisible(true);
  };

  const addTaskComment = (taskId: number, message: string) => {
    const newComment: TaskComment = {
      id: `comment-${Date.now()}`,
      taskId,
      author: 'Nigel Fariso',
      message,
      createdAt: new Date().toLocaleString(),
    };

    setTaskComments((currentComments) => ({
      ...currentComments,
      [taskId]: [
        ...(currentComments[taskId] ?? []),
        newComment,
      ],
    }));
  };

  const reportTaskBlocked = (taskId: number, reason: string) => {
    const task = tasks.find((item) => item.id === taskId);

    if (!task || taskEscalations[taskId]) {
      return;
    }

    const manager =
      managerByAssignee[task.assignee] ?? 'No manager assigned';

    const newEscalation: TaskEscalation = {
      status: 'Blocked',
      reason,
      reportedBy: 'Nigel Fariso',
      manager,
      createdAt: new Date().toLocaleString(),
    };

    setTaskEscalations((current) => ({
      ...current,
      [taskId]: newEscalation,
    }));

    addNotification({
      id: `task-blocked-${taskId}-${Date.now()}`,
      title: 'Task reported as blocked',
      message: `${task.title} has been reported as blocked. Reason: ${reason}`,
      type: 'Task',
      taskId,
    });
  };

  const escalateTask = (taskId: number) => {
    const existing = taskEscalations[taskId];
    const task = tasks.find((item) => item.id === taskId);

    if (!existing || existing.status !== 'Blocked' || !task) {
      return;
    }

    setTaskEscalations((current) => ({
      ...current,
      [taskId]: {
        ...current[taskId],
        status: 'Escalated',
      },
    }));

    addNotification({
      id: `task-escalated-${taskId}-${Date.now()}`,
      title: 'Task escalated',
      message: `${task.title} has been escalated to ${existing.manager}.`,
      type: 'Task',
      taskId,
    });
  };

  const resolveTaskEscalation = (taskId: number) => {
    const existing = taskEscalations[taskId];
    const task = tasks.find((item) => item.id === taskId);

    if (!existing || existing.status !== 'Escalated' || !task) {
      return;
    }

    setTaskEscalations((current) => ({
      ...current,
      [taskId]: {
        ...current[taskId],
        status: 'Resolved',
      },
    }));

    addNotification({
      id: `task-resolved-${taskId}-${Date.now()}`,
      title: 'Task escalation resolved',
      message: `The escalation for ${task.title} has been resolved.`,
      type: 'Task',
      taskId,
    });
  };

  const updateTaskStatus = (task: Task) => {
    const nextStatuses: TaskStatus[] = [
      'Pending',
      'In Progress',
      'Under Review',
      'Completed',
    ];

    const currentIndex = nextStatuses.indexOf(task.status);
    const nextStatus =
      nextStatuses[(currentIndex + 1) % nextStatuses.length];

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === task.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    setSelectedTask((currentTask) =>
      currentTask && currentTask.id === task.id
        ? { ...currentTask, status: nextStatus }
        : currentTask
    );

    addNotification({
      id: `task-status-${task.id}-${Date.now()}`,
      title: 'Task status updated',
      message: `${task.title} has moved from ${task.status} to ${nextStatus}.`,
      type: 'Task',
      taskId: task.id,
    });
  };

  const openCreateForm = () => {
    setEditingTask(null);
    setFormVisible(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setFormVisible(true);
  };

  const saveTask = (values: TaskFormValues) => {
    if (editingTask) {
      const assigneeChanged = editingTask.assignee !== values.assignee;

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id
            ? { ...values, id: editingTask.id }
            : task
        )
      );

      if (assigneeChanged) {
        addNotification({
          id: `task-reassigned-${editingTask.id}-${Date.now()}`,
          title: 'Task reassigned',
          message: `${editingTask.title} has been reassigned from ${editingTask.assignee} to ${values.assignee}.`,
          type: 'Task',
          taskId: editingTask.id,
        });
      }
    } else {
      const newTask: Task = {
        ...values,
        id: Math.max(0, ...tasks.map((task) => task.id)) + 1,
      };

      setTasks((currentTasks) => [newTask, ...currentTasks]);

      addNotification({
        id: `task-created-${newTask.id}-${Date.now()}`,
        title: 'New task created',
        message: `${newTask.title} has been created and assigned to ${newTask.assignee}.`,
        type: 'Task',
        taskId: newTask.id,
      });

      setActiveFilter('All');
      setSearch('');
    }

    setFormVisible(false);
    setEditingTask(null);
  };

  const getStatusAction = (status: TaskStatus) => {
    switch (status) {
      case 'Pending':
        return 'Start task';
      case 'In Progress':
        return 'Submit for review';
      case 'Under Review':
        return 'Mark completed';
      case 'Completed':
        return 'Restart task';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>WORKSPACE MANAGEMENT</Text>
        <Text style={styles.pageTitle}>Tasks</Text>
        <Text style={styles.subtitle}>
          Organise responsibilities and track team progress.
        </Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>COLLABFLOW TASK MANAGEMENT</Text>
          <Text style={styles.heroTitle}>
            Plan better. Work together. Deliver results.
          </Text>
          <Text style={styles.heroDescription}>
            Assign responsibilities, monitor progress and keep your team
            accountable.
          </Text>

          <Pressable
            style={styles.createButton}
            onPress={openCreateForm}
          >
            <Text style={styles.createButtonText}>+ Create task</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Task overview</Text>
          <Text style={styles.sampleLabel}>Sample data</Text>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            value={counts.total}
            label="Total tasks"
            color="#2563EB"
          />
          <SummaryCard
            value={counts.inProgress}
            label="In progress"
            color="#D97706"
          />
          <SummaryCard
            value={counts.completed}
            label="Completed"
            color="#159957"
          />
          <SummaryCard
            value={counts.pending}
            label="Pending"
            color="#9333EA"
          />
          <SummaryCard
            value={counts.overdue}
            label="Overdue"
            color="#DC2626"
          />
        </View>

        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Team tasks</Text>
          <Text style={styles.taskCount}>
            {filteredTasks.length} shown
          </Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks, members or categories..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filters.map((filter) => {
            const selected = activeFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterButton,
                  selected && styles.activeFilterButton,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.activeFilterText,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptyText}>
              Try another search term or select a different filter.
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskTopRow}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{task.category}</Text>
                </View>

                <Text
                  style={[
                    styles.priorityText,
                    { color: priorityColors[task.priority] },
                  ]}
                >
                  {task.priority} priority
                </Text>
              </View>

              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDescription}>
                {task.description}
              </Text>

              <View style={styles.taskDivider} />

              <Text style={styles.metaLabel}>ASSIGNED TO</Text>
              <Text style={styles.assignee}>{task.assignee}</Text>

              <View style={styles.taskBottomRow}>
                <View style={styles.dueDateContainer}>
                  <Text style={styles.metaLabel}>DUE DATE</Text>
                  <Text style={styles.dueDate}>{task.dueDate}</Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  {isTaskOverdue(task) && (
                    <View style={styles.overdueBadge}>
                      <Text style={styles.overdueBadgeText}>
                        OVERDUE
                      </Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${statusColors[task.status]}18` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusColors[task.status] },
                      ]}
                    >
                      {task.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.detailsButton}
                  onPress={() => showTaskDetails(task)}
                >
                  <Text style={styles.detailsButtonText}>View details</Text>
                </Pressable>

                <Pressable
                  style={styles.detailsButton}
                  onPress={() => openEditForm(task)}
                >
                  <Text style={styles.detailsButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                  style={styles.updateButton}
                  onPress={() => updateTaskStatus(task)}
                >
                  <Text style={styles.updateButtonText}>
                    {getStatusAction(task.status)}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Development preview</Text>
          <Text style={styles.noticeText}>
            Tasks currently use sample data stored locally in the app.
            Updates will reset when the app is restarted. Database storage,
            real assignments and task notifications will be added later.
          </Text>
        </View>
      </ScrollView>

      <TaskDetailsModal
        visible={isDetailsVisible}
        task={activeTask}
        comments={
          activeTask ? taskComments[activeTask.id] ?? [] : []
        }
        onAddComment={addTaskComment}
        escalation={
          activeTask ? taskEscalations[activeTask.id] ?? null : null
        }
        onReportBlocked={reportTaskBlocked}
        onEscalate={escalateTask}
        onResolveEscalation={resolveTaskEscalation}
        onClose={() => {
          setDetailsVisible(false);
          setSelectedTask(null);
        }}
        onEdit={(task: TaskDetails) => {
          setDetailsVisible(false);
          setSelectedTask(null);
          openEditForm(task);
        }}
        onUpdateStatus={(task: TaskDetails) => {
          updateTaskStatus(task);
        }}
      />

      <TaskFormModal
        key={editingTask ? `task-${editingTask.id}` : 'new-task'}
        visible={formVisible}
        initialTask={editingTask}
        approvedMembers={approvedMembers}
        onClose={() => {
          setFormVisible(false);
          setEditingTask(null);
        }}
        onSave={saveTask}
      />
    </SafeAreaView>
  );
}

function SummaryCard({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryAccent, { backgroundColor: color }]} />
      <Text style={styles.summaryValue}>
        {String(value).padStart(2, '0')}
      </Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 35,
  },
  eyebrow: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },
  pageTitle: {
    color: '#172033',
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
  },
  hero: {
    backgroundColor: '#1B3F70',
    borderRadius: 28,
    padding: 25,
    marginBottom: 32,
  },
  heroLabel: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 18,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 12,
  },
  heroDescription: {
    color: '#DBEAFE',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 22,
  },
  createButton: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 18,
  },
  createButtonText: {
    color: '#1B3F70',
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#172033',
    fontSize: 21,
    fontWeight: '800',
  },
  sampleLabel: {
    color: '#64748B',
    fontSize: 13,
  },
  taskCount: {
    color: '#64748B',
    fontSize: 13,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
    marginBottom: 34,
  },
  summaryCard: {
    width: '48%',
    minHeight: 132,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 19,
  },
  summaryAccent: {
    width: 34,
    height: 6,
    borderRadius: 5,
    marginBottom: 17,
  },
  summaryValue: {
    color: '#172033',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 5,
  },
  summaryLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  searchInput: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE3EC',
    borderRadius: 15,
    paddingHorizontal: 16,
    color: '#172033',
    fontSize: 14,
    marginBottom: 14,
  },
  filterList: {
    gap: 9,
    paddingBottom: 19,
  },
  filterButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE3EC',
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 15,
  },
  activeFilterButton: {
    backgroundColor: '#2459A9',
    borderColor: '#2459A9',
  },
  filterText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 15,
  },
  taskTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryText: {
    color: '#2459A9',
    fontSize: 11,
    fontWeight: '700',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '800',
  },
  taskTitle: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 7,
  },
  taskDescription: {
    color: '#64748B',
    fontSize: 14,
    lineHeight: 21,
  },
  taskDivider: {
    height: 1,
    backgroundColor: '#EDF0F5',
    marginVertical: 16,
  },
  metaLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  assignee: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  taskBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  dueDateContainer: {
    flex: 1,
  },
  dueDate: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  overdueBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  overdueBadgeText: {
    color: '#DC2626',
    fontSize: 9,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  detailsButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2459A9',
    borderRadius: 11,
    paddingVertical: 12,
  },
  detailsButtonText: {
    color: '#2459A9',
    fontSize: 12,
    fontWeight: '800',
  },
  updateButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2459A9',
    borderRadius: 11,
    paddingVertical: 12,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    color: '#172033',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 7,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  notice: {
    backgroundColor: '#EAF1FC',
    borderRadius: 15,
    padding: 16,
    marginTop: 8,
  },
  noticeTitle: {
    color: '#1B3F70',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  noticeText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 19,
  },
});
