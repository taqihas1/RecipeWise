import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { RECIPES } from '@/lib/data/recipes';
import { RecipeCard } from '@/components/RecipeCard';
import {
  getMealPlan, saveMealPlan, addMealToPlan, removeMealFromPlan,
  type MealPlanDay, type MealType
} from '@/lib/store';
import * as Haptics from 'expo-haptics';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

function getWeekDates(): string[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export default function MealPlannerScreen() {
  const router = useRouter();
  const colors = useColors();
  const [plan, setPlan] = useState<MealPlanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const weekDates = getWeekDates();

  useEffect(() => {
    loadPlan();
  }, []);

  async function loadPlan() {
    const data = await getMealPlan();
    setPlan(data);
    setLoading(false);
  }

  function getDayPlan(date: string): MealPlanDay | undefined {
    return plan.find(d => d.date === date);
  }

  async function addRecipe(date: string, mealType: MealType) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to search with pre-filled meal type
    router.push({ pathname: '/search', params: { planner: '1', date, mealType } });
  }

  async function removeMeal(date: string, recipeId: string, mealType: MealType) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await removeMealFromPlan(date, recipeId, mealType);
    const updated = await getMealPlan();
    setPlan(updated);
  }

  if (loading) {
    return (
      <ScreenContainer>
        <View style={[styles.loading, { backgroundColor: colors.background }]}>
          <Text style={{ color: colors.foreground }}>Loading planner...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const selectedDate = weekDates[selectedDay];
  const dayPlan = getDayPlan(selectedDate);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Meal Planner</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={[styles.subtitle, { color: colors.muted }]}>
        Plan your week, hit your protein goals
      </Text>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {DAYS.map((day, index) => {
          const isSelected = index === selectedDay;
          const dateNum = new Date(weekDates[index]).getDate();
          return (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(index)}
              style={[
                styles.dayPill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.dayPillDay, { color: isSelected ? '#fff' : colors.muted }]}>
                {day}
              </Text>
              <Text style={[styles.dayPillDate, { color: isSelected ? '#fff' : colors.foreground }]}>
                {dateNum}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Selected Day Summary */}
        <View style={[styles.dayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.dayCardTitle, { color: colors.foreground }]}>
            {FULL_DAYS[selectedDay]}
          </Text>

          {MEAL_TYPES.map(mealType => {
            const meals = dayPlan?.meals.filter(m => m.mealType === mealType) || [];
            return (
              <View key={mealType} style={styles.mealSection}>
                <View style={styles.mealHeader}>
                  <Text style={[styles.mealTypeLabel, { color: colors.muted }]}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </Text>
                  {meals.length === 0 && (
                    <Pressable
                      onPress={() => addRecipe(selectedDate, mealType)}
                      style={[styles.addBtn, { backgroundColor: colors.primary + '15' }]}
                    >
                      <IconSymbol name="plus" size={14} color={colors.primary} />
                      <Text style={[styles.addBtnText, { color: colors.primary }]}>Add</Text>
                    </Pressable>
                  )}
                </View>

                {meals.length === 0 ? (
                  <Pressable
                    onPress={() => addRecipe(selectedDate, mealType)}
                    style={[styles.emptySlot, { borderColor: colors.border }]}
                  >
                    <IconSymbol name="fork.knife" size={20} color={colors.muted + '60'} />
                    <Text style={[styles.emptyText, { color: colors.muted }]}>
                      Tap to add a recipe
                    </Text>
                  </Pressable>
                ) : (
                  meals.map(slot => {
                    const recipe = RECIPES.find(r => r.id === slot.recipeId);
                    if (!recipe) return null;
                    return (
                      <View key={slot.recipeId} style={styles.recipeSlot}>
                        <RecipeCard recipe={recipe} style={{ flex: 1 }} />
                        <Pressable
                          onPress={() => removeMeal(selectedDate, slot.recipeId, mealType)}
                          style={styles.removeBtn}
                        >
                          <IconSymbol name="xmark.circle.fill" size={22} color={colors.muted} />
                        </Pressable>
                      </View>
                    );
                  })
                )}
              </View>
            );
          })}
        </View>

        {/* Weekly Protein Summary */}
        <View style={[styles.proteinCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '30' }]}>
          <View style={styles.proteinHeader}>
            <IconSymbol name="flame.fill" size={20} color={colors.primary} />
            <Text style={[styles.proteinTitle, { color: colors.foreground }]}>
              Weekly Protein Preview
            </Text>
          </View>
          <View style={styles.proteinGrid}>
            {weekDates.map((date, idx) => {
              const day = plan.find(d => d.date === date);
              const totalProtein = day?.meals.reduce((sum, m) => {
                const r = RECIPES.find(rec => rec.id === m.recipeId);
                return sum + (r?.nutrition.protein || 0);
              }, 0) || 0;
              return (
                <View key={date} style={styles.proteinDay}>
                  <Text style={[styles.proteinDayLabel, { color: colors.muted }]}>{DAYS[idx]}</Text>
                  <Text style={[styles.proteinDayValue, { color: totalProtein > 0 ? colors.primary : colors.muted }]}>
                    {totalProtein}g
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 14, marginHorizontal: 16, marginBottom: 12 },
  daySelector: { paddingHorizontal: 16, marginBottom: 12 },
  dayPill: {
    width: 52, height: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    marginRight: 10, borderWidth: 1.5,
  },
  dayPillDay: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  dayPillDate: { fontSize: 18, fontWeight: '700' },
  scroll: { flex: 1, paddingHorizontal: 16 },
  dayCard: {
    borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1,
  },
  dayCardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  mealSection: { marginBottom: 14 },
  mealHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8,
  },
  mealTypeLabel: { fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  addBtnText: { fontSize: 12, fontWeight: '600' },
  emptySlot: {
    borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed',
    paddingVertical: 24, alignItems: 'center', gap: 6,
  },
  emptyText: { fontSize: 14, fontWeight: '500' },
  recipeSlot: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  removeBtn: { padding: 4 },
  proteinCard: {
    borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 16,
  },
  proteinHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  proteinTitle: { fontSize: 16, fontWeight: '700' },
  proteinGrid: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  proteinDay: { alignItems: 'center', flex: 1 },
  proteinDayLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  proteinDayValue: { fontSize: 14, fontWeight: '700' },
});
