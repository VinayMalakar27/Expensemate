import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { sendAIChat } from '../services/api';

export default function AIChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      text: "Hi! I'm your ExpenseMate AI 🤖\nAsk me anything about your expenses!",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now().toString(), role: 'user', text: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = updatedMessages
        .slice(1)
        .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

      const res = await sendAIChat(userMessage.text, chatHistory);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: res.data.reply,
      }]);
    } catch (err) {
  const msg = err.response?.data?.message || 'Something went wrong!';
  setMessages(prev => [...prev, {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    text: msg,
  }]);
} finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const QUICK_QUESTIONS = [
    "How much did I spend this month?",
    "Where is most of my money going?",
    "How can I save more?",
    "Show my top expenses",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Assistant 🤖</Text>
        <Text style={styles.headerSubtitle}>Powered by Gemini</Text>
      </View>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <View style={styles.quickContainer}>
          <Text style={styles.quickTitle}>Quick Questions:</Text>
          <View style={styles.quickGrid}>
            {QUICK_QUESTIONS.map((q, i) => (
              <TouchableOpacity
                key={i}
                style={styles.quickBtn}
                onPress={() => { setInput(q); }}
              >
                <Text style={styles.quickText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.role === 'user' ? styles.userBubble : styles.aiBubble
          ]}>
            {item.role === 'assistant' && (
              <Text style={styles.aiLabel}>🤖 AI</Text>
            )}
            <Text style={[
              styles.messageText,
              item.role === 'user' ? styles.userText : styles.aiText
            ]}>
              {item.text}
            </Text>
          </View>
        )}
      />

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingBubble}>
          <ActivityIndicator size="small" color="#6C63FF" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about your expenses..."
          placeholderTextColor="#666"
          value={input}
          onChangeText={setInput}
          multiline
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E2E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6C63FF',
    marginTop: 2,
  },
  quickContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  quickTitle: {
    color: '#999',
    fontSize: 13,
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickBtn: {
    backgroundColor: '#1E1E2E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  quickText: {
    color: '#6C63FF',
    fontSize: 12,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  userBubble: {
    backgroundColor: '#6C63FF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#1E1E2E',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  aiLabel: {
    fontSize: 11,
    color: '#6C63FF',
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#FFFFFF',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  loadingText: {
    color: '#999',
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E1E2E',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1E1E2E',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#2E2E3E',
  },
  sendBtn: {
    backgroundColor: '#6C63FF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#2E2E3E',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});