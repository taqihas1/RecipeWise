const fs = require("fs");
const path = require("path");
const baseDir = "/root/.openclaw/workspace/recipewise";

const removeIds = new Set(["r005", "r023", "r026", "r038", "r055", "r056", "r059", "r068", "r076"]);

function removeRecipesFromFile(filePath, varName) {
  const fullPath = path.join(baseDir, filePath);
  let content = fs.readFileSync(fullPath, "utf8");

  const arrayStart = content.indexOf("export const " + varName);
  if (arrayStart === -1) {
    console.log("Could not find " + varName + " in " + filePath);
    return;
  }

  const eqIdx = content.indexOf("=", arrayStart);
  const openBracket = content.indexOf("[", eqIdx);
  let bracketCount = 0;
  let closeBracket = -1;

  for (let i = openBracket; i < content.length; i++) {
    if (content[i] === "[") bracketCount++;
    if (content[i] === "]") {
      bracketCount--;
      if (bracketCount === 0) {
        closeBracket = i;
        break;
      }
    }
  }

  const arrayContent = content.substring(openBracket + 1, closeBracket);

  let recipes = [];
  let depth = 0;
  let start = -1;

  for (let i = 0; i < arrayContent.length; i++) {
    if (arrayContent[i] === "{") {
      if (depth === 0) start = i;
      depth++;
    }
    if (arrayContent[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        recipes.push(arrayContent.substring(start, i + 1));
        start = -1;
      }
    }
  }

  console.log(filePath + ": found " + recipes.length + " recipes");

  const kept = [];
  for (const r of recipes) {
    const idMatch = r.match(/id:\s*['"](r\d+)['"]/);
    if (!idMatch) {
      kept.push(r);
      continue;
    }
    const id = idMatch[1];
    if (removeIds.has(id)) {
      console.log("  REMOVING: " + id);
      continue;
    }
    kept.push(r);
  }

  console.log(filePath + ": keeping " + kept.length + " recipes");

  const newArrayContent = "\n" + kept.join(",\n") + (kept.length > 0 ? ",\n" : "\n");

  const newContent = content.substring(0, openBracket + 1) + newArrayContent + content.substring(closeBracket);
  fs.writeFileSync(fullPath, newContent, "utf8");
  console.log(filePath + ": written!\n");
}

removeRecipesFromFile("lib/data/recipes.ts", "RECIPES");
removeRecipesFromFile("lib/data/recipes-new.ts", "NEW_RECIPES");

// Also clean highprotein tips that mention pork/bacon/ham
const hpPath = path.join(baseDir, "lib/data/recipes-highprotein.ts");
let hp = fs.readFileSync(hpPath, "utf8");
// Remove tips that mention pork/ham/bacon as actual ingredients (not tempeh bacon which is plant-based)
// We need to be careful - only remove tips that suggest adding pork/ham, not the main recipes
hp = hp.replace(/\s*'Swap almond flour for crushed pork rinds for zero-carb breading\.',\n/g, "");
hp = hp.replace(/\s*'Substitute ground turkey or a beef-pork blend for different flavors\.',\n/g, "");
hp = hp.replace(/\s*'Swap in turkey sausage or bacon for a different protein profile\.',\n/g, "");
hp = hp.replace(/\s*'Add turkey sausage or chicken breast for an even bigger protein boost\.',\n/g, "");
hp = hp.replace(/\s*'Add diced ham or bacon bits for extra savory depth \(not for no-pork diets\)\.',\n/g, "");
fs.writeFileSync(hpPath, hp, "utf8");
console.log("Cleaned pork references from recipes-highprotein.ts tips");

console.log("\nDONE - All pork/ham recipes removed!");
