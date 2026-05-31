import { ImageSourcePropType } from 'react-native';

// ─── AI-GENERATED IMAGES (better matches for specific recipes) ─────────────
const AI_IMAGES: Record<string, any> = {
  'r186': require('../assets/images/r186-steak-eggs-ai.jpg'),      // Perfect steak & eggs
  'r212': require('../assets/images/r212-protein-pancakes-ai.jpg'), // Perfect protein pancakes
};

// ─── CURATED UNSPLASH IMAGES — professional food photography ───────────────
const UNSPLASH_IMAGES: Record<string, any> = {
  'r181': require('../assets/images/r181-buffalo-chicken-bowl.jpg'),
  'r182': require('../assets/images/r182-lemon-herb-chicken.jpg'),
  'r183': require('../assets/images/r183-chicken-fajita-bowl.jpg'),
  'r184': require('../assets/images/r184-chicken-tenders.jpg'),
  'r185': require('../assets/images/r185-mediterranean-chicken.jpg'),
  'r187': require('../assets/images/r187-ground-beef-bowl.jpg'),
  'r188': require('../assets/images/r188-beef-stirfry.jpg'),
  'r189': require('../assets/images/r189-meatballs.jpg'),
  'r190': require('../assets/images/r190-beef-soup.jpg'),
  'r191': require('../assets/images/r191-steak-lettuce-wraps.jpg'),
  'r192': require('../assets/images/r192-breakfast-burrito.jpg'),
  'r193': require('../assets/images/r193-garlic-butter-salmon.jpg'),
  'r194': require('../assets/images/r194-tuna-poke.jpg'),
  'r195': require('../assets/images/r195-shrimp-scampi.jpg'),
  'r196': require('../assets/images/r196-cod-foil.jpg'),
  'r197': require('../assets/images/r197-shrimp-tacos.jpg'),
  'r198': require('../assets/images/r198-salmon-patties.jpg'),
  'r199': require('../assets/images/r199-miso-cod.jpg'),
  'r200': require('../assets/images/r199-miso-cod.jpg'),
  'r201': require('../assets/images/r201-tofu-buddha.jpg'),
  'r202': require('../assets/images/r202-tofu-stirfry.jpg'),
  'r203': require('../assets/images/r203-yogurt-parfait.jpg'),
  'r204': require('../assets/images/r204-egg-scramble.jpg'),
  'r205': require('../assets/images/r205-protein-shake.jpg'),
  'r206': require('../assets/images/r206-cottage-cheese.jpg'),
  'r207': require('../assets/images/r207-turkey-wraps.jpg'),
  'r208': require('../assets/images/r208-turkey-chili.jpg'),
  'r209': require('../assets/images/r209-egg-muffins.jpg'),
  'r210': require('../assets/images/r210-lamb-chops.jpg'),
  'r211': require('../assets/images/r211-lamb-skewers.jpg'),
  'r213': require('../assets/images/r213-egg-salad.jpg'),
  'r214': require('../assets/images/r214-seared-scallops.jpg'),
  'r215': require('../assets/images/r215-overnight-oats.jpg'),
};

/**
 * Resolve recipe image source — AI images take priority for accuracy,
 * then falls back to Unsplash professional photography
 */
export function resolveRecipeImage(recipeId: string, imageUrl?: string): ImageSourcePropType {
  // AI images are more accurate for specific recipes
  if (AI_IMAGES[recipeId]) {
    return AI_IMAGES[recipeId];
  }
  
  // Curated Unsplash professional food photography
  if (UNSPLASH_IMAGES[recipeId]) {
    return UNSPLASH_IMAGES[recipeId];
  }
  
  // Fall back to remote URL
  return { uri: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600' };
}

/**
 * Check if a recipe has a local image available
 */
export function hasLocalImage(recipeId: string): boolean {
  return !!AI_IMAGES[recipeId] || !!UNSPLASH_IMAGES[recipeId];
}

/**
 * Get all local image IDs
 */
export function getLocalImageIds(): string[] {
  return [...Object.keys(AI_IMAGES), ...Object.keys(UNSPLASH_IMAGES)];
}
