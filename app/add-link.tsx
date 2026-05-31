import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { saveLink, detectSource, RecipeLink } from './my-links';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const SOURCE_OPTIONS: { id: RecipeLink['source']; emoji: string; name: string; color: string }[] = [
  { id: 'youtube', emoji: '▶️', name: 'YouTube', color: '#FF0000' },
  { id: 'instagram', emoji: '📸', name: 'Instagram', color: '#E1306C' },
  { id: 'tiktok', emoji: '🎵', name: 'TikTok', color: '#010101' },
  { id: 'pinterest', emoji: '📌', name: 'Pinterest', color: '#E60023' },
  { id: 'website', emoji: '🌐', name: 'Website', color: '#6B7280' },
  { id: 'other', emoji: '🔗', name: 'Other', color: '#6B7280' },
];

export default function AddLinkScreen() {
  const colors = useColors();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<RecipeLink['source']>('website');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Auto-detect source when URL changes
  React.useEffect(() => {
    if (url.trim()) {
      setSource(detectSource(url));
    }
  }, [url]);

  const handleSave = async () => {
    const trimmedUrl = url.trim();
    const trimmedTitle = title.trim();

    if (!trimmedUrl) {
      Alert.alert('URL Required', 'Please paste a recipe link URL.');
      return;
    }

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      Alert.alert('Invalid URL', 'URL must start with https://');
      return;
    }

    if (!trimmedTitle) {
      Alert.alert('Title Required', 'Please give this recipe a title so you can find it later.');
      return;
    }

    setIsSaving(true);

    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

      const newLink: RecipeLink = {
        id: `link_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        url: trimmedUrl,
        title: trimmedTitle,
        source,
        notes: notes.trim(),
        tags: tagList,
        createdAt: new Date().toISOString(),
      };

      await saveLink(newLink);

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        '✅ Link Saved!',
        `"${trimmedTitle}" has been added to your recipe links.`,
        [{ text: 'Done', onPress: () => router.push('/my-links' as any) }]
      );
    } catch {
      Alert.alert('Error', 'Could not save the link. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </Pressable>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Add Recipe Link</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* URL Input */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Recipe URL</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Paste a link from YouTube, Instagram, TikTok, Pinterest, or any recipe website
          </Text>
          <View style={[styles.inputRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="https://..."
              placeholderTextColor={colors.textSecondary}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              multiline={false}
            />
          </View>
        </View>

        {/* Title Input */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Title</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Give it a name so you can find it easily
          </Text>
          <TextInput
            style={[styles.textInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            placeholder="e.g. High-Protein Chicken Stir Fry"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Source Selector */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Source</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Auto-detected from URL. Tap to change if needed.
          </Text>
          <View style={styles.sourceGrid}>
            {SOURCE_OPTIONS.map(opt => (
              <Pressable
                key={opt.id}
                style={({ pressed }) => [
                  styles.sourceChip,
                  {
                    backgroundColor: source === opt.id ? opt.color + '20' : colors.background,
                    borderColor: source === opt.id ? opt.color : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setSource(opt.id)}
              >
                <Text style={{ fontSize: 20 }}>{opt.emoji}</Text>
                <Text style={[
                  styles.sourceText,
                  { color: source === opt.id ? opt.color : colors.text },
                ]}>
                  {opt.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Notes (optional)</Text>
          <TextInput
            style={[styles.textArea, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            placeholder="e.g. Use less salt, double the chicken..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Tags */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.text }]}>Tags (optional)</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Separate with commas — e.g. high-protein, meal-prep, quick
          </Text>
          <TextInput
            style={[styles.textInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
            placeholder="high-protein, meal-prep, favorite"
            placeholderTextColor={colors.textSecondary}
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: isSaving ? colors.textSecondary : colors.primary },
            pressed && !isSaving && { opacity: 0.85 },
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? 'Saving...' : '💾 Save Recipe Link'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 60 },
  backText: { fontSize: 15, fontWeight: '600' },
  pageTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  card: {
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 8,
  },
  label: { fontSize: 16, fontWeight: '700' },
  hint: { fontSize: 12, lineHeight: 18 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
  },
  input: { flex: 1, fontSize: 14 },
  textInput: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
  },
  textArea: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    minHeight: 80, textAlignVertical: 'top',
  },
  sourceGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
  },
  sourceChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 24, borderWidth: 1,
  },
  sourceText: { fontSize: 12, fontWeight: '600' },
  saveBtn: {
    marginHorizontal: 16, marginTop: 4,
    paddingVertical: 16, borderRadius: 16, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
