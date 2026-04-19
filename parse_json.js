const fs = require('fs');
const path = require('path');

const scrapingDir = path.join(__dirname, 'scraping', '2026');
const files = fs.readdirSync(scrapingDir).filter(f => f.endsWith('.html'));

const recipes = [];
const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;

files.forEach(file => {
  const filePath = path.join(scrapingDir, file);
  const html = fs.readFileSync(filePath, 'utf-8');
  
  const id = file.replace('recipe_', '').replace('.html', '');

  let recipeData = null;
  
  // Use regex to find all json-ld scripts
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      if (data['@type'] === 'Recipe') {
        recipeData = data;
      } else if (Array.isArray(data)) {
        const found = data.find(item => item['@type'] === 'Recipe');
        if (found) recipeData = found;
      }
    } catch (e) {}
  }

  if (recipeData) {
    const name = recipeData.name || '';
    const rating = recipeData.aggregateRating ? parseFloat(recipeData.aggregateRating.ratingValue) : 0;
    const comment = recipeData.description || '';
    const ingredients = recipeData.recipeIngredient || [];
    
    const instructionsArr = recipeData.recipeInstructions || [];
    let garnish = '';
    const instructionsSteps = [];
    
    instructionsArr.forEach(step => {
      // Check if this step is actually the garnish instruction
      if (step.name && step.name.toLowerCase().includes('garnish')) {
        garnish = step.text;
      } else {
        instructionsSteps.push(step.text || step);
      }
    });

    const instructions = instructionsSteps.join(' ');
    
    const containsWhisky = ingredients.some(ing => ing.toLowerCase().includes('whisk'));

    if (name && rating >= 4 && !containsWhisky) {
      recipes.push({
        id,
        name,
        rating,
        ingredients,
        instructions,
        garnish,
        comment,
      });
    }
  }
});

recipes.sort((a, b) => b.rating - a.rating);

const outputJson = JSON.stringify(recipes, null, 2).replace(/Difford\'s Guide|Difford/gi, 'D');

fs.writeFileSync(path.join(__dirname, 'public', 'all.json'), outputJson);
console.log(`Generated public/all.json with ${recipes.length} recipes.`);
