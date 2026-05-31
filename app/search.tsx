import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, Pressable, StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RecipeCard } from '@/components/RecipeCard';
import { useColors } from '@/hooks/use-colors';
import { RECIPES, searchRecipes, MealType, TasteTag, DietTag } from '@/lib/data/recipes';
import { addMealToPlan } from '@/lib/store';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const MEAL_FILTERS: { label: string; value: MealType }[] = [
  { label: '🌅 Breakfast', value: 'breakfast' },
  { label: '☀️ Lunch', value: 'lunch' },
  { label: '🌙 Dinner', value: 'dinner' },
  { label: '🍿 Snack', value: 'snack' },
  { label: '🍰 Dessert', value: 'dessert' },
];

const TASTE_FILTER_LIST: { label: string; value: TasteTag }[] = [
  { label: '🌶 Spicy', value: 'spicy' },
  { label: '😊 Mild', value: 'not-spicy' },
  { label: '🍯 Sweet', value: 'sweet' },
  { label: '🧂 Savory', value: 'savory' },
];

const DIET_FILTERS: { label: string; value: DietTag }[] = [
  { label: '🌱 Vegan', value: 'vegan' },
  { label: '🥗 Vegetarian', value: 'vegetarian' },
  { label: '🥑 Keto', value: 'keto' },
  { label: 'Gluten-Free', value: 'gluten-free' },
  { label: 'Dairy-Free', value: 'dairy-free' },
  { label: '💪 High Protein', value: 'high-protein' },
];

const TIME_FILTERS = [
  { label: '< 15 min', value: 15 },
  { label: '< 30 min', value: 30 },
  { label: '< 60 min', value: 60 },
];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ planner?: string; date?: string; mealType?: string }>();
  const colors = useColors();
  const [query, setQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [selectedTaste, setSelectedTaste] = useState<TasteTag | null>(null);
  const [selectedDiet, setSelectedDiet] = useState<DietTag | null>(null);
  const [maxTime, setMaxTime] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const isPlannerMode = params.planner === '1';
  const plannerDate = params.date;
  const plannerMealType = params.mealType as MealType | undefined;

  const results = useMemo(() => {
    let base = query.trim() ? searchRecipes(query) : [...RECIPES];
    if (selectedMeal) base = base.filter(r => r.mealType.includes(selectedMeal));
    if (selectedTaste) base = base.filter(r => r.tasteTags.includes(selectedTaste));
    if (selectedDiet) base = base.filter(r => r.dietTags.includes(selectedDiet));
    if (maxTime) base = base.filter(r => r.cookTimeMinutes + r.prepTimeMinutes <= maxTime);
    return base;
  }, [query, selectedMeal, selectedTaste, selectedDiet, maxTime]);

  const hasFilters = selectedMeal || selectedTaste || selectedDiet || maxTime;

  const handleAddToPlanner = async (recipeId: string) => {
    if (!plannerDate || !plannerMealType) return;
    await addMealToPlan(plannerDate, recipeId, plannerMealType);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Added!', 'Recipe added to your meal planner.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const clearFilters = () => {
    setSelectedMeal(null);
    setSelectedTaste(null);
    setSelectedDiet(null);
    setMaxTime(null);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchTitleRow}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Search Recipes</Text>
          <Pressable
            style={({ pressed }) => [
              styles.fridgeBtn,
              { backgroundColor: '#E8F5E9', borderColor: '#A5D6A7' },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => router.push('/fridge' as any)}
          >
            <Text style={styles.fridgeBtnEmoji}>🧊</Text>
            <Text style={[styles.fridgeBtnText, { color: '#2E7D32' }]}>My Fridge</Text>
          </Pressable>
        </View>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, ingredient..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
        <View style={styles.filterRow}>
          <Pressable
            style={({ pressed }) => [
              styles.filterToggleBtn,
              {
                backgroundColor: showFilters ? colors.primary : colors.surface,
                borderColor: showFilters ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => setShowFilters(f => !f)}
          >
            <IconSymbol name="slider.horizontal.3" size={16} color={showFilters ? '#fff' : colors.text} />
            <Text style={[styles.filterToggleText, { color: showFilters ? '#fff' : colors.text }]}>
              Filters {hasFilters ? '•' : ''}
            </Text>
          </Pressable>
          {hasFilters && (
            <Pressable
              style={({ pressed }) => [
                styles.clearBtn,
                { borderColor: colors.error },
                pressed && { opacity: 0.7 },
              ]}
              onPress={clearFilters}
            >
              <Text style={[styles.clearBtnText, { color: colors.error }]}>Clear all</Text>
            </Pressable>
          )}

        </View>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={[styles.filtersPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.filterGroupTitle, { color: colors.textSecondary }]}>Meal Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
            {MEAL_FILTERS.map(f => (
              <Pressable
                key={f.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedMeal === f.value ? colors.primary : colors.background,
                    borderColor: selectedMeal === f.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedMeal(selectedMeal === f.value ? null : f.value)}
              >
                <Text style={[styles.chipText, { color: selectedMeal === f.value ? '#fff' : colors.text }]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.filterGroupTitle, { color: colors.textSecondary }]}>Taste</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
            {TASTE_FILTER_LIST.map(f => (
              <Pressable
                key={f.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedTaste === f.value ? colors.primary : colors.background,
                    borderColor: selectedTaste === f.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedTaste(selectedTaste === f.value ? null : f.value)}
              >
                <Text style={[styles.chipText, { color: selectedTaste === f.value ? '#fff' : colors.text }]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.filterGroupTitle, { color: colors.textSecondary }]}>Diet</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
            {DIET_FILTERS.map(f => (
              <Pressable
                key={f.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedDiet === f.value ? colors.primary : colors.background,
                    borderColor: selectedDiet === f.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedDiet(selectedDiet === f.value ? null : f.value)}
              >
                <Text style={[styles.chipText, { color: selectedDiet === f.value ? '#fff' : colors.text }]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.filterGroupTitle, { color: colors.textSecondary }]}>Cook Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
            {TIME_FILTERS.map(f => (
              <Pressable
                key={f.value}
                style={[
                  styles.chip,
                  {
                    backgroundColor: maxTime === f.value ? colors.primary : colors.background,
                    borderColor: maxTime === f.value ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setMaxTime(maxTime === f.value ? null : f.value)}
              >
                <Text style={[styles.chipText, { color: maxTime === f.value ? '#fff' : colors.text }]}>
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <RecipeCard recipe={item} />
            {isPlannerMode && (
              <Pressable
                style={({ pressed }) => [
                  styles.addToPlanBtn,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => handleAddToPlanner(item.id)}
              >
                <IconSymbol name="plus.circle.fill" size={18} color="#fff" />
                <Text style={styles.addToPlanBtnText}>Add to {plannerMealType ? plannerMealType.charAt(0).toUpperCase() + plannerMealType.slice(1) : 'Planner'}</Text>
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No recipes found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Try different keywords or adjust your filters
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  searchHeader: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 10 },
  pageTitle: { fontSize: 24, fontWeight: '800' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterToggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  filterToggleText: { fontSize: 13, fontWeight: '600' },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  clearBtnText: { fontSize: 12, fontWeight: '600' },
  resultCount: { marginLeft: 'auto', fontSize: 12 },
  filtersPanel: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 14, borderWidth: 1, padding: 14, gap: 8,
  },
  filterGroupTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChips: { gap: 8, paddingRight: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: '600' },
  resultsList: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
  searchTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fridgeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
  },
  fridgeBtnEmoji: { fontSize: 15 },
  fridgeBtnText: { fontSize: 12, fontWeight: '700' },
  addToPlanBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: 14, marginTop: 8,
  },
  addToPlanBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
