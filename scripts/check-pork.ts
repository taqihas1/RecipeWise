import { RECIPES } from '../lib/data/recipes';

const PORK_KEYWORDS = [
  'pork', 'ham', 'bacon', 'prosciutto', 'salami', 'pepperoni', 
  'mortadella', 'pancetta', 'guanciale', 'chorizo', 'bratwurst',
  'sausage' // Note: some sausages are chicken/turkey, we check context
];

const PORK_RECIPES: typeof RECIPES = [];

for (const recipe of RECIPES) {
  const hasPork = recipe.ingredients.some(ing => {
    const name = ing.name.toLowerCase();
    // Check for explicit pork keywords
    if (name.includes('pork') || 
        /\bham\b/.test(name) || 
        name.includes('bacon') ||
        name.includes('prosciutto') || name.includes('salami') || name.includes('pepperoni') ||
        name.includes('mortadella') || name.includes('pancetta') || name.includes('guanciale') ||
        name.includes('chorizo') || name.includes('bratwurst')) {
      return true;
    }
    // For sausage, check if it's not chicken or turkey
    if (name.includes('sausage') && !name.includes('chicken') && !name.includes('turkey')) {
      return true;
    }
    return false;
  });
  
  if (hasPork) {
    PORK_RECIPES.push(recipe);
  }
}

console.log(`🐷 ACTUAL PORK RECIPES FOUND: ${PORK_RECIPES.length}\n`);
PORK_RECIPES.forEach(r => {
  const porkIngredients = r.ingredients.filter(ing => {
    const name = ing.name.toLowerCase();
    return name.includes('pork') || /\bham\b/.test(name) || name.includes('bacon') ||
           name.includes('prosciutto') || name.includes('salami') || name.includes('pepperoni') ||
           name.includes('mortadella') || name.includes('pancetta') || name.includes('guanciale') ||
           name.includes('chorizo') || name.includes('bratwurst') ||
           (name.includes('sausage') && !name.includes('chicken') && !name.includes('turkey'));
  }).map(i => i.name);
  
  console.log(`  - ${r.id}: ${r.title}`);
  console.log(`    Pork ingredients: ${porkIngredients.join(', ')}\n`);
});
