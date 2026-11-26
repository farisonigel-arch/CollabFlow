import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'notice';
};

const suggestions = [
  {
    title: 'Plan a project',
    description: 'Organise tasks, milestones and responsibilities.',
    prompt: 'Help me create a project plan with milestones and responsibilities.',
    icon: 'briefcase-outline' as const,
  },
  {
    title: 'Manage team activities',
    description: 'Coordinate events, schedules and team activities.',
    prompt: 'Help me plan and coordinate a team activity.',
    icon: 'people-outline' as const,
  },
  {
    title: 'Business assistance',
    description: 'Explore business ideas and commercial activities.',
    prompt: 'Help me develop a practical business activity plan.',
    icon: 'business-outline' as const,
  },
  {
    title: 'Prepare a proposal',
    description: 'Structure a professional business proposal.',
    prompt: 'Help me prepare a professional business proposal.',
    icon: 'document-text-outline' as const,
  },
];

export default function AssistantScreen() {
  const router = useRouter();
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  function sendMessage() {
    const cleanMessage = draft.trim();

    if (!cleanMessage) return;

    const timestamp = Date.now().toString();

    setMessages((current) => [
      ...current,
      {
        id: `${timestamp}-user`,
        text: cleanMessage,
        sender: 'user',
      },
      {
        id: `${timestamp}-notice`,
        text: 'Your message has been added to this preview. The secure AI service will be connected in Stage 2. No AI-generated answer has been produced.',
        sender: 'notice',
      },
    ]);

    setDraft('');
  }

  function chooseSuggestion(prompt: string) {
    setDraft(prompt);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to Dashboard"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={21} color="#2459A9" />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>COLLABFLOW WORKSPACE</Text>
            <Text style={styles.heading}>AI Assistant</Text>
          </View>

          <View style={styles.assistantIcon}>
            <Ionicons name="sparkles" size={23} color="#FFFFFF" />
          </View>
        </View>

        <ScrollView
          style={styles.conversation}
          contentContainerStyle={styles.conversationContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons name="sparkles" size={25} color="#2459A9" />
            </View>

            <Text style={styles.introTitle}>How can I help you today?</Text>
            <Text style={styles.introDescription}>
              Your future CollabFlow assistant will help you plan projects,
              coordinate teams, explore business activities and prepare
              professional documents.
            </Text>

            <View style={styles.statusNotice}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                Interface preview · AI connection coming in Stage 2
              </Text>
            </View>
          </View>

          {messages.length === 0 ? (
            <View style={styles.suggestionsSection}>
              <Text style={styles.sectionTitle}>Explore what you can do</Text>

              {suggestions.map((item) => (
                <Pressable
                  key={item.title}
                  accessibilityRole="button"
                  onPress={() => chooseSuggestion(item.prompt)}
                  style={({ pressed }) => [
                    styles.suggestionCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={styles.suggestionIcon}>
                    <Ionicons name={item.icon} size={21} color="#2459A9" />
                  </View>

                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionTitle}>{item.title}</Text>
                    <Text style={styles.suggestionDescription}>
                      {item.description}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#94A3B8"
                  />
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.messagesSection}>
              <Text style={styles.sectionTitle}>Conversation preview</Text>

              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[
                    styles.messageBubble,
                    message.sender === 'user'
                      ? styles.userMessage
                      : styles.noticeMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageLabel,
                      message.sender === 'user'
                        ? styles.userMessageLabel
                        : styles.noticeMessageLabel,
                    ]}
                  >
                    {message.sender === 'user' ? 'YOU' : 'STAGE 1 PREVIEW'}
                  </Text>
                  <Text
                    style={[
                      styles.messageText,
                      message.sender === 'user'
                        ? styles.userMessageText
                        : styles.noticeMessageText,
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.composerContainer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Write a message or choose a suggestion..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={2000}
            style={styles.input}
            accessibilityLabel="Write a message to the AI Assistant"
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add message to preview"
            disabled={!draft.trim()}
            onPress={sendMessage}
            style={({ pressed }) => [
              styles.sendButton,
              !draft.trim() && styles.sendButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="arrow-up" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <Text style={styles.disclaimer}>
          Stage 1 preview. Messages are not sent to an AI service or saved.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  keyboardArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EDF5',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1FF',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: '#64748B',
    marginBottom: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#172033',
  },
  assistantIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2459A9',
  },
  conversation: {
    flex: 1,
  },
  conversationContent: {
    padding: 18,
    paddingBottom: 24,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 21,
    borderWidth: 1,
    borderColor: '#E8EDF5',
    marginBottom: 25,
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1FF',
    marginBottom: 15,
  },
  introTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 9,
  },
  introDescription: {
    fontSize: 13,
    lineHeight: 21,
    color: '#64748B',
  },
  statusNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F6FF',
    padding: 11,
    borderRadius: 11,
    marginTop: 17,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D97706',
    marginRight: 9,
  },
  statusText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#2459A9',
  },
  suggestionsSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172033',
    marginBottom: 5,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    borderRadius: 15,
    padding: 14,
  },
  suggestionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F1FF',
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    paddingRight: 8,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#172033',
  },
  suggestionDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
    marginTop: 4,
  },
  messagesSection: {
    gap: 12,
  },
  messageBubble: {
    maxWidth: '90%',
    borderRadius: 16,
    padding: 14,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2459A9',
    borderBottomRightRadius: 5,
  },
  noticeMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    borderBottomLeftRadius: 5,
  },
  messageLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  userMessageLabel: {
    color: '#BBD6FF',
  },
  noticeMessageLabel: {
    color: '#2459A9',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  noticeMessageText: {
    color: '#475569',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8EDF5',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    backgroundColor: '#F5F7FB',
    borderWidth: 1,
    borderColor: '#E8EDF5',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#172033',
    marginRight: 10,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#2459A9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A8B8D0',
  },
  pressed: {
    opacity: 0.75,
  },
  disclaimer: {
    backgroundColor: '#FFFFFF',
    color: '#94A3B8',
    fontSize: 10,
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});
