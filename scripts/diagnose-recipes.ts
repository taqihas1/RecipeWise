import { RECIPES } from '../lib/data/recipes';

const issues = {
  missingSteps: [] as string[],
  emptySteps: [] as string[],
  missingImages: [] as string[],
  missingNutrition: [] as string[],
  missingIngredients: [] as string[],
  porkRecipes: [] as string[],
};

for (const recipe of RECIPES) {
  // Check steps
  if (!recipe.steps || recipe.steps.length === 0) {
    issues.emptySteps.push(`${recipe.id}: ${recipe.title}`);
  }
  
  // Check for pork/ham
  const hasPork = recipe.ingredients.some(i => 
    /pork|ham|bacon|sausage|chorizo|prosciutto|salami|pepperoni|mortadella|pancetta|guanciale/i.test(i.name)
  );
  if (hasPork) {
    issues.porkRecipes.push(`${recipe.id}: ${recipe.title}`);
  }
  
  // Check image
  if (!recipe.imageUrl) {
    issues.missingImages.push(`${recipe.id}: ${recipe.title}`);
  }
  
  // Check nutrition
  if (!recipe.nutrition || recipe.nutrition.protein === undefined) {
    issues.missingNutrition.push(`${recipe.id}: ${recipe.title}`);
  }
  
  // Check ingredients
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    issues.missingIngredients.push(`${recipe.id}: ${recipe.title}`);
  }
}

console.log('\n🔍 RECIPEWISE DIAGNOSTIC REPORT\n');
console.log(`Total recipes: ${RECIPES.length}\n`);

console.log(`❌ Missing/Empty Steps (${issues.emptySteps.length}):`);
issues.emptySteps.forEach(r => console.log(`  - ${r}`));

console.log(`\n🐷 Pork/Ham Recipes (${issues.porkRecipes.length}):`);
issues.porkRecipes.forEach(r => console.log(`  - ${r}`));

console.log(`\n❌ Missing Images (${issues.missingImages.length}):`);
issues.missingImages.forEach(r => console.log(`  - ${r}`));

console.log(`\n❌ Missing Nutrition (${issues.missingNutrition.length}):`);
issues.missingNutrition.forEach(r => console.log(`  - ${r}`));

console.log(`\n❌ Missing Ingredients (${issues.missingIngredients.length}):`);
issues.missingIngredients.forEach(r => console.log(`  - ${r}`));

console.log('\n✅ High-Protein Recipes:', RECIPES.filter(r => r.dietTags.includes('high-protein')).length);
console.log('✅ Featured Recipes:', RECIPES.filter(r => r.isFeatured).length);
console.log('✅ Trending Recipes:', RECIPES.filter(r => r.isTrending).length);
