import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, FlatList, Pressable, StyleSheet,
  Dimensions, ImageBackground, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RecipeCard } from '@/components/RecipeCard';
import { useColors } from '@/hooks/use-colors';
import {
  RECIPES, getFeaturedRecipes, getTrendingRecipes, getRecipesByMealType,
  getQuickRecipes, MealType, ALL_RECIPES
} from '@/lib/data/recipes';
import { getSavedRecipeIds } from '@/lib/store';
import { AdBanner } from '@/components/AdBanner';
import { resolveRecipeImage } from '@/lib/image-resolver';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.42;
const HERO_HEIGHT = 280;

const QUICK_ACTIONS = [
  { label: 'My Fridge', emoji: '🧊', route: '/fridge', color: '#3B82F6' },
  { label: 'My Links', emoji: '🔗', route: '/my-links', color: '#8B5CF6' },
  { label: 'Favorites', emoji: '❤️', route: '/profile', color: '#EF4444' },
];

const MEAL_CATEGORIES: { label: string; type: MealType; emoji: string; gradient: readonly [string, string] }[] = [
  { label: 'Breakfast', type: 'breakfast', emoji: '🌅', gradient: ['#FF9A56', '#FF6B6B'] as const },
  { label: 'Lunch', type: 'lunch', emoji: '☀️', gradient: ['#4ECDC4', '#44A08D'] as const },
  { label: 'Dinner', type: 'dinner', emoji: '🌙', gradient: ['#667EEA', '#764BA2'] as const },
  { label: 'Snacks', type: 'snack', emoji: '🍿', gradient: ['#F093FB', '#F5576C'] as const },
  { label: 'Desserts', type: 'dessert', emoji: '🍰', gradient: ['#FA709A', '#FEE140'] as const },
];

const PROTEIN_FILTERS = [
  { label: 'High Protein', emoji: '💪', minProtein: 30, color: '#2D9B4E' },
  { label: 'Quick Meals', emoji: '⚡', maxTime: 20, color: '#F5A623' },
  { label: 'Keto', emoji: '🥑', tag: 'keto', color: '#9B59B6' },
  { label: 'Gluten Free', emoji: '🌾', tag: 'gluten-free', color: '#3498DB' },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const fadeAnim = useState(new Animated.Value(1))[0];

  const featuredRecipes = getFeaturedRecipes().slice(0, 5);
  const trendingRecipes = getTrendingRecipes().slice(0, 6);
  const highProteinRecipes = RECIPES.filter(r => r.dietTags.includes('high-protein') && r.nutrition.protein >= 35).slice(0, 8);
  const quickRecipes = getQuickRecipes(20).slice(0, 6);

  useEffect(() => {
    getSavedRecipeIds().then(setFavoriteIds);
  }, []);

  // Auto-rotate hero
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setHeroIndex(prev => (prev + 1) % featuredRecipes.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredRecipes.length]);

  const getFilteredRecipes = () => {
    if (selectedMeal) {
      return getRecipesByMealType(selectedMeal);
    }
    if (activeFilter === 'High Protein') {
      return RECIPES.filter(r => r.nutrition.protein >= 30);
    }
    if (activeFilter === 'Quick Meals') {
      return getQuickRecipes(20);
    }
    if (activeFilter === 'Keto') {
      return RECIPES.filter(r => r.dietTags.includes('keto'));
    }
    if (activeFilter === 'Gluten Free') {
      return RECIPES.filter(r => r.dietTags.includes('gluten-free'));
    }
    return [];
  };

  const filteredRecipes = getFilteredRecipes();
  const isFiltering = selectedMeal !== null || activeFilter !== null;

  const HeroRecipe = featuredRecipes[heroIndex];

  return (
    <ScreenContainer scrollable={false}>
      <StatusBar style="light" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* ═══ HERO SECTION ═══ */}
        {HeroRecipe && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Pressable
              onPress={() => router.push(`/${HeroRecipe.id}` as any)}
              style={styles.heroContainer}
            >
              <ImageBackground
                source={resolveRecipeImage(HeroRecipe.id, HeroRecipe.imageUrl)}
                style={styles.heroImage}
                imageStyle={{ borderRadius: 0 }}
              >
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.85)']}
                  style={styles.heroGradient}
                >
                  <View style={styles.heroContent}>
                    <View style={styles.heroBadgeRow}>
                      <View style={[styles.heroBadge, { backgroundColor: '#2D9B4E' }]}>
                        <Text style={styles.heroBadgeText}>💪 {HeroRecipe.nutrition.protein}g Protein</Text>
                      </View>
                      {HeroRecipe.isFeatured && (
                        <View style={[styles.heroBadge, { backgroundColor: '#E8572A' }]}>
                          <Text style={styles.heroBadgeText}>⭐ Featured</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.heroTitle} numberOfLines={2}>{HeroRecipe.title}</Text>
                    <Text style={styles.heroSubtitle} numberOfLines={2}>{HeroRecipe.description}</Text>
                    <View style={styles.heroMeta}>
                      <IconSymbol name="clock" size={14} color="#fff" />
                      <Text style={styles.heroMetaText}>{HeroRecipe.prepTimeMinutes + HeroRecipe.cookTimeMinutes} min</Text>
                      <IconSymbol name="star.fill" size={14} color="#FFD700" />
                      <Text style={styles.heroMetaText}>{HeroRecipe.rating}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </Pressable>
          </Animated.View>
        )}

        {/* ═══ QUICK ACTIONS ═══ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            {QUICK_ACTIONS.map(action => (
              <Pressable
                key={action.label}
                onPress={() => router.push(action.route as any)}
                style={({ pressed }) => [
                  styles.quickActionBtn,
                  { backgroundColor: action.color + '15', borderColor: action.color + '30' },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
                ]}
              >
                <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                <Text style={[styles.quickActionLabel, { color: action.color }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ═══ MEAL CATEGORIES ═══ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Meal Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {MEAL_CATEGORIES.map(cat => (
              <Pressable
                key={cat.type}
                onPress={() => setSelectedMeal(selectedMeal === cat.type ? null : cat.type)}
                style={[
                  styles.categoryPill,
                  selectedMeal === cat.type && styles.categoryPillActive,
                ]}
              >
                <LinearGradient
                  colors={selectedMeal === cat.type ? cat.gradient : ['#f5f5f5', '#f5f5f5']}
                  style={styles.categoryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                  <Text style={[
                    styles.categoryLabel,
                    selectedMeal === cat.type && styles.categoryLabelActive,
                  ]}>{cat.label}</Text>
                </LinearGradient>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ═══ PROTEIN FILTERS ═══ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Protein Power</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {PROTEIN_FILTERS.map(filter => (
              <Pressable
                key={filter.label}
                onPress={() => setActiveFilter(activeFilter === filter.label ? null : filter.label)}
                style={[
                  styles.filterPill,
                  activeFilter === filter.label && { backgroundColor: filter.color, borderColor: filter.color },
                ]}
              >
                <Text style={styles.filterEmoji}>{filter.emoji}</Text>
                <Text style={[
                  styles.filterLabel,
                  activeFilter === filter.label && styles.filterLabelActive,
                ]}>{filter.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* ═══ HIGH PROTEIN GRID ═══ */}
        {!isFiltering && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>💪 High Protein Hits</Text>
                <Pressable onPress={() => setActiveFilter('High Protein')}>
                  <Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text>
                </Pressable>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={highProteinRecipes}
                keyExtractor={r => r.id}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => (
                  <View style={{ width: CARD_WIDTH, marginRight: 12 }}>
                    <RecipeCard recipe={item} />
                  </View>
                )}
              />
            </View>

            {/* ═══ TRENDING ═══ */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>🔥 Trending Now</Text>
              </View>
              <View style={styles.trendingGrid}>
                {trendingRecipes.map(recipe => (
                  <View key={recipe.id} style={{ width: CARD_WIDTH, marginBottom: 12 }}>
                    <RecipeCard recipe={recipe} />
                  </View>
                ))}
              </View>
            </View>

            {/* ═══ QUICK & EASY ═══ */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>⚡ Quick & Easy</Text>
              </View>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={quickRecipes}
                keyExtractor={r => r.id}
                contentContainerStyle={styles.horizontalList}
                renderItem={({ item }) => (
                  <View style={{ width: 260, marginRight: 12 }}>
                    <RecipeCard recipe={item} horizontal />
                  </View>
                )}
              />
            </View>
          </>
        )}

        {/* ═══ FILTERED RESULTS ═══ */}
        {isFiltering && filteredRecipes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {selectedMeal ? MEAL_CATEGORIES.find(c => c.type === selectedMeal)?.label : activeFilter} Recipes
              </Text>
              <Pressable onPress={() => { setSelectedMeal(null); setActiveFilter(null); }}>
                <Text style={[styles.seeAll, { color: colors.accent }]}>Clear</Text>
              </Pressable>
            </View>
            <View style={styles.filteredGrid}>
              {filteredRecipes.map(recipe => (
                <View key={recipe.id} style={{ width: CARD_WIDTH, marginBottom: 12 }}>
                  <RecipeCard recipe={recipe} />
                </View>
              ))}
            </View>
          </View>
        )}

        {isFiltering && filteredRecipes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🍽️</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>No recipes found</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
        <AdBanner />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 6,
  },
  quickActionEmoji: {
    fontSize: 28,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  heroContainer: {
    height: HERO_HEIGHT,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 60,
  },
  heroContent: {
    gap: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  heroMetaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginRight: 10,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingRight: 16,
    gap: 10,
  },
  categoryPill: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  categoryPillActive: {
    elevation: 6,
    shadowOpacity: 0.25,
    transform: [{ scale: 1.02 }],
  },
  categoryGradient: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  categoryEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  categoryLabelActive: {
    color: '#fff',
  },
  filterScroll: {
    paddingRight: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#f8f8f8',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  filterEmoji: {
    fontSize: 18,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
  },
  filterLabelActive: {
    color: '#fff',
  },
  horizontalList: {
    paddingRight: 16,
  },
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  filteredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
