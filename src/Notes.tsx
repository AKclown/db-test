import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { decodeNotes, type Note } from './noteData';
import { Button, color, type } from './ui';

const storageKey = 'relex.notes.v1';
const dateFormat = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' });

export default function Notes({ startWriting, onBack }: { startWriting: boolean; onBack: () => void }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [editing, setEditing] = useState<Note | null | undefined>(startWriting ? null : undefined);
  const [body, setBody] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<'delete' | 'discard' | null>(null);
  const pending = useRef(false);
  const dirty = body !== (editing?.body ?? '') || next !== (editing?.next ?? '');

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(storageKey).then((value) => {
      if (active) setNotes(decodeNotes(value));
    }).catch(() => {
      if (active) setError('暂时读不到心事，请重试。');
    });
    return () => { active = false; };
  }, [attempt]);

  function closeEditor() {
    setConfirm(null);
    setError('');
    if (startWriting && editing === null && !notes?.length) onBack();
    else setEditing(undefined);
  }

  function goBack() {
    if (pending.current) return;
    if (confirm) setConfirm(null);
    else if (editing === undefined || notes === null) onBack();
    else if (dirty) setConfirm('discard');
    else closeEditor();
  }

  useEffect(() => {
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => back.remove();
  });

  function openEditor(note: Note | null) {
    setBody(note?.body ?? '');
    setNext(note?.next ?? '');
    setError('');
    setEditing(note);
  }

  async function persist(updated: Note[], message: string) {
    if (pending.current) return;
    pending.current = true;
    setSaving(true);
    setError('');
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
      setNotes(updated);
      setEditing(undefined);
      setConfirm(null);
    } catch {
      setError(message);
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  function save() {
    if (notes === null || editing === undefined || !body.trim()) return;
    const fields = { body: body.trim(), next: next.trim() };
    const createdAt = Date.now();
    let id = String(createdAt);
    while (notes.some((note) => note.id === id)) id += '-';
    const updated = editing
      ? notes.map((note) => note.id === editing.id ? { ...note, ...fields } : note)
      : [{ id, createdAt, ...fields }, ...notes];
    void persist(updated, '没能保存，刚写的内容还在。请重试。');
  }

  const heading = editing === undefined ? '我的心事' : editing ? '编辑心事' : '记下心事';

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>
        <View style={styles.top}>
          <Button kind="quiet" label={editing === undefined || notes === null ? '返回首页' : '返回'} disabled={saving} onPress={goBack} />
        </View>
        <Text accessibilityRole="header" style={type.title}>{heading}</Text>

        {notes === null ? (
          error ? <Button kind="secondary" label="重试" onPress={() => { setError(''); setAttempt(attempt + 1); }} />
            : <Text accessibilityLiveRegion="polite" style={type.body}>正在读取心事…</Text>
        ) : editing === undefined ? (
          <>
            {notes.length === 0 && <Text style={type.body}>还没有记录。想写的时候，写一句就好。</Text>}
            <Button label="记下心事" onPress={() => openEditor(null)} />
            {notes.map((note) => (
              <Pressable accessibilityRole="button" key={note.id} onPress={() => openEditor(note)}
                style={({ pressed }) => [styles.card, pressed && { opacity: 0.65 }]}>
                <Text style={styles.date}>{dateFormat.format(note.createdAt)}</Text>
                <Text style={styles.note} numberOfLines={3}>{note.body}</Text>
                {!!note.next && <Text style={type.body} numberOfLines={2}>下一步 · {note.next}</Text>}
              </Pressable>
            ))}
          </>
        ) : (
          <>
            <View style={styles.field}>
              <Text style={styles.label}>现在有什么事挂在心上？</Text>
              <TextInput accessibilityLabel="心事" multiline editable={!saving && !confirm} value={body}
                onChangeText={setBody} placeholder="可以只写一句。" placeholderTextColor={color.muted}
                style={[styles.input, styles.mainInput]} />
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>下一步（选填）</Text>
              <TextInput accessibilityLabel="下一步（选填）" editable={!saving && !confirm} value={next}
                onChangeText={setNext} multiline placeholder="比如：下午三点再确认进度" placeholderTextColor={color.muted} style={styles.input} />
            </View>
            {confirm ? (
              <View style={styles.card}>
                <Text accessibilityLiveRegion="polite" style={styles.label}>
                  {confirm === 'delete' ? '确定删除这条心事？' : '要放弃这次没保存的内容吗？'}
                </Text>
                <Button kind="secondary" label={confirm === 'delete' ? '取消' : '继续写'} disabled={saving} onPress={() => { setConfirm(null); setError(''); }} />
                <Button kind="danger" label={confirm === 'delete' ? '确认删除' : '放弃更改'} disabled={saving} onPress={() => {
                  if (confirm === 'discard') closeEditor();
                  else if (editing) void persist(notes.filter((note) => note.id !== editing.id), '没能删除，请重试。');
                }} />
              </View>
            ) : (
              <>
                <Button label={saving ? '正在保存…' : '保存'} disabled={saving || !body.trim()} onPress={save} />
                {editing && <Button kind="quiet" label="删除心事" disabled={saving} onPress={() => { setError(''); setConfirm('delete'); }} />}
              </>
            )}
            <Text style={type.body}>心事保存在这台设备上。</Text>
          </>
        )}
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flexGrow: 1, gap: 16, paddingHorizontal: 24, paddingBottom: 24 },
  top: { alignItems: 'flex-start' },
  field: { gap: 8 },
  label: { fontSize: 16, fontWeight: '600', color: color.ink },
  input: {
    minHeight: 52, padding: 14, borderWidth: 1, borderRadius: 16, borderColor: color.line,
    backgroundColor: color.white, fontSize: 16, color: color.ink, textAlignVertical: 'top',
  },
  mainInput: { minHeight: 128 },
  card: {
    backgroundColor: color.white, padding: 16, borderRadius: 16, gap: 8,
    borderWidth: 1, borderColor: color.line,
  },
  note: { color: color.ink, fontSize: 16, lineHeight: 24 },
  date: { color: color.muted, fontSize: 13 },
  error: { color: color.danger, fontSize: 15, lineHeight: 23 },
});
