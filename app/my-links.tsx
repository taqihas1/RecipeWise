import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet, TextInput, Alert,
  Linking, ScrollView, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export interface RecipeLink {
  id: string;
  url: string;
  title: string;
  source: 'youtube' | 'instagram' | 'tiktok' | 'pinterest' | 'website' | 'other';
  notes: string;
  tags: string[];
  createdAt: string;
  favicon?: string;
}

const SOURCE_META: Record<string, { name: string; emoji: string; color: string; domain: string }> = {
  youtube: { name: 'YouTube', emoji: '▶️', color: '#FF0000', domain: 'youtube.com' },
  instagram: { name: 'Instagram', emoji: '📸', color: '#E1306C', domain: 'instagram.com' },
  tiktok: { name: 'TikTok', emoji: '🎵', color: '#010101', domain: 'tiktok.com' },
  pinterest: { name: 'Pinterest', emoji: '📌', color: '#E60023', domain: 'pinterest.com' },
  website: { name: 'Website', emoji: '🌐', color: '#6B7280', domain: '' },
  other: { name: 'Other', emoji: '🔗', color: '#6B7280', domain: '' },
};

const LINKS_STORAGE_KEY = 'recipewise_my_links';

function detectSource(url: string): RecipeLink['source'] {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) return 'pinterest';
  return 'website';
}

export async function getSavedLinks(): Promise<RecipeLink[]> {
  try {
    const raw = await AsyncStorage.getItem(LINKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveLink(link: RecipeLink): Promise<void> {
  const existing = await getSavedLinks();
  await AsyncStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify([link, ...existing]));
}

export async function deleteLink(id: string): Promise<void> {
  const existing = await getSavedLinks();
  await AsyncStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(existing.filter(l => l.id !== id)));
}

export async function updateLink(updated: RecipeLink): Promise<void> {
  const existing = await getSavedLinks();
  await AsyncStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(
    existing.map(l => l.id === updated.id ? updated : l)
  ));
}

export default function MyLinksScreen() {
  const colors = useColors();
  const router = useRouter();
  const [links, setLinks] = useState<RecipeLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    const data = await getSavedLinks();
    setLinks(data);
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = !searchQuery.trim() ||
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSource = !selectedSource || link.source === selectedSource;
    return matchesSearch && matchesSource;
  });

  const handleOpenLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Cannot Open', 'This link cannot be opened on your device.');
    }
  };

  const handleDelete = (link: RecipeLink) => {
    Alert.alert(
      'Delete Link?',
      `"${link.title}" will be removed from your collection.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLink(link.id);
            await loadLinks();
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const sourceCounts = links.reduce((acc, link) => {
    acc[link.source] = (acc[link.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>My Recipe Links</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {links.length} saved {links.length === 1 ? 'link' : 'links'}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => router.push('/add-link' as any)}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search your links..."
          placeholderTextColor={colors.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={16} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Source Filter Chips */}
      {links.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <Pressable
            style={({ pressed }) => [
              styles.filterChip,
              {
                backgroundColor: selectedSource === null ? colors.primary : colors.surface,
                borderColor: selectedSource === null ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => setSelectedSource(null)}
          >
            <Text style={[styles.filterChipText, { color: selectedSource === null ? '#fff' : colors.foreground }]}>
              All
            </Text>
          </Pressable>
          {Object.entries(SOURCE_META).map(([key, meta]) => (
            sourceCounts[key] > 0 && (
              <Pressable
                key={key}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: selectedSource === key ? meta.color : colors.surface,
                    borderColor: selectedSource === key ? meta.color : colors.border,
                  },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => setSelectedSource(selectedSource === key ? null : key)}
              >
                <Text style={{ fontSize: 12 }}>{meta.emoji}</Text>
                <Text style={[styles.filterChipText, { color: selectedSource === key ? '#fff' : colors.foreground }]}>
                  {meta.name} ({sourceCounts[key]})
                </Text>
              </Pressable>
            )
          ))}
        </ScrollView>
      )}

      {/* Links List */}
      {links.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No saved links yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted, textAlign: 'center', paddingHorizontal: 40 }]}>
            Save recipe links from YouTube, Instagram, TikTok, Pinterest, or any website to keep them all in one place.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.emptyAddBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => router.push('/add-link' as any)}
          >
            <Text style={styles.emptyAddBtnText}>Add Your First Link</Text>
          </Pressable>
        </View>
      ) : filteredLinks.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No matches found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Try a different search or filter
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLinks}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const meta = SOURCE_META[item.source] || SOURCE_META.other;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.linkCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => handleOpenLink(item.url)}
                onLongPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  }
                  handleDelete(item);
                }}
              >
                <View style={[styles.sourceBadge, { backgroundColor: meta.color + '15' }]}>
                  <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
                </View>
                <View style={styles.linkContent}>
                  <Text style={[styles.linkTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {item.title || 'Untitled Link'}
                  </Text>
                  <Text style={[styles.linkUrl, { color: colors.muted }]} numberOfLines={1}>
                    {item.url}
                  </Text>
                  {item.notes ? (
                    <Text style={[styles.linkNotes, { color: colors.muted }]} numberOfLines={2}>
                      {item.notes}
                    </Text>
                  ) : null}
                  {item.tags.length > 0 && (
                    <View style={styles.tagRow}>
                      {item.tags.map(tag => (
                        <View key={tag} style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
                          <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Pressable
                  style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.6 }]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                >
                  <IconSymbol name="trash" size={16} color={colors.error} />
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  pageTitle: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginBottom: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingTop: 60,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, lineHeight: 20 },
  emptyAddBtn: {
    paddingHorizontal: 24, paddingVertical: 14,
    borderRadius: 16, marginTop: 8,
  },
  emptyAddBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  linkCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 16, borderWidth: 1,
    padding: 14, marginBottom: 10,
  },
  sourceBadge: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  linkContent: { flex: 1, gap: 4 },
  linkTitle: { fontSize: 15, fontWeight: '700' },
  linkUrl: { fontSize: 12 },
  linkNotes: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  tagText: { fontSize: 10, fontWeight: '600' },
  deleteBtn: { padding: 4, marginTop: 2 },
});
