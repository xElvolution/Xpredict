import { useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Send, Sparkles } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { env } from '../../lib/env';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'What\'s Real Madrid\'s recent form?',
  'How does Champions League seeding work?',
  'Explain implied probability simply.',
  'Bitcoin price action this week?'
];

export default function CoachScreen() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hey, I\'m Coach. I provide context and stats — never recommendations. What do you want to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput('');
    const newMessages: Msg[] = [...messages, { role: 'user', content: q }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${env.API_BASE_URL}/api/coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, marketQuestion: '', messages: newMessages })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply ?? 'Coach is offline.' }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Couldn\'t reach Coach. Try again.' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={sharedStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: spacing.s4, gap: spacing.s3, paddingBottom: spacing.s8 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={[sharedStyles.row, { gap: spacing.s2, marginBottom: spacing.s2 }]}>
          <Sparkles size={14} color={colors.accentBright} />
          <Text style={{ color: colors.accentBright, fontSize: 11, fontWeight: '600', letterSpacing: 1.2 }}>
            COACH AI
          </Text>
        </View>

        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              styles.bubble,
              m.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant
            ]}
          >
            <Text
              style={{
                color: m.role === 'user' ? '#fff' : colors.text,
                fontSize: 14,
                lineHeight: 20
              }}
            >
              {m.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View style={[styles.bubble, styles.bubbleAssistant, { flexDirection: 'row', gap: spacing.s2 }]}>
            <ActivityIndicator size="small" color={colors.accentBright} />
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Thinking…</Text>
          </View>
        )}

        {messages.length === 1 && (
          <View style={{ gap: spacing.s2, marginTop: spacing.s4 }}>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: '600' }}>SUGGESTIONS</Text>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => send(s)} style={styles.suggestion}>
                <Text style={{ color: colors.textDim, fontSize: 13 }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask Coach anything..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onSubmitEditing={() => send()}
          editable={!loading}
        />
        <Pressable
          onPress={() => send()}
          style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
          disabled={!input.trim() || loading}
        >
          <Send size={16} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '85%',
    padding: spacing.s3,
    borderRadius: radii.lg,
    borderWidth: 1
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderColor: colors.accent
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderColor: colors.border
  },
  suggestion: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.s3
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.s2,
    padding: spacing.s4,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgElevated
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s3,
    color: colors.text,
    fontSize: 14
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.accent,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
