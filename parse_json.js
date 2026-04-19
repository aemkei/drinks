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

  const getSectionText = (htmlContent, anchorId) => {
    // Look for id="anchorId" with a space before to avoid matching data-anchor-id
    const idStr = ` id="${anchorId}"`;
    const anchorIdx = htmlContent.indexOf(idStr);
    if (anchorIdx === -1) return '';
    
    const pStart = htmlContent.indexOf('<p>', anchorIdx);
    // Be generous to allow headings between the id and the paragraph
    if (pStart === -1 || pStart - anchorIdx > 500) return '';
    
    const pEnd = htmlContent.indexOf('</p>', pStart);
    if (pEnd === -1) return '';
    
    let text = htmlContent.substring(pStart + 3, pEnd);
    // remove html tags
    return text.replace(/<[^>]+>/g, '').trim();
  };

  if (recipeData) {
    const name = recipeData.name || '';
    const rating = recipeData.aggregateRating ? parseFloat(recipeData.aggregateRating.ratingValue) : 0;
    
    let description = recipeData.description || '';
    if (description.startsWith('Discover how to make')) {
      description = '';
    }
    
    const review = getSectionText(html, 'anchor-review');
    const history = getSectionText(html, 'anchor-history');
    
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

    const instructions = instructionsSteps;
    
    const containsWhisky = ingredients.some(ing => ing.toLowerCase().includes('whisk'));

    if (name && rating >= 4 && !containsWhisky) {
      recipes.push({
        id,
        name,
        rating,
        ingredients,
        instructions,
        garnish,
        review,
        history,
        comment: description,
      });
    }
  }
});

recipes.sort((a, b) => b.rating - a.rating);

const outputJson = JSON.stringify(recipes, null, 2).replace(/Difford\'s Guide|Difford/gi, 'D');

fs.writeFileSync(path.join(__dirname, 'public', 'all.json'), outputJson);
console.log(`Generated public/all.json with ${recipes.length} recipes.`);
