const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const scrapingDir = path.join(__dirname, 'scraping');
const files = fs.readdirSync(scrapingDir).filter(f => f.endsWith('.html'));

const recipes = [];

files.forEach(file => {
  const filePath = path.join(scrapingDir, file);
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);

  const id = file.replace('recipe_', '').replace('.html', '');

  
  const name = $("h1").text().trim();
  const instructions = $("[itemprop=recipeInstructions]").text().trim();
  
  const ratingStr = $("[itemprop=ratingValue]").attr("content");
  const rating = ratingStr ? parseFloat(ratingStr) : 0;
  
  const comment = $('[itemprop="description"]').text().trim();
  const garnishHeading = $('h3:contains("Garnish:"), h2:contains("Garnish:")');
  const garnish = garnishHeading.length > 0 ? garnishHeading.closest('tr').next('tr').find('.review__text').text().trim() : '';
  
  
  const ingredients = [];
  $('#cocktails_recipe_ingredients_table tr').each((_, element) => {
    // skip the glass row which usually contains "Serve in"
    const hasGlass = $(element).has('td.cocktails_recipe_glass').length > 0;
    if (!hasGlass) {
      const ingredient = $(element).text().replace(/\s+/g, ' ').trim();
      if (ingredient) {
        ingredients.push(ingredient);
      }
    }
  });
  
  const containsWhisky = ingredients.some(ing => ing.toLowerCase().includes('whisk'));

  if (name && rating >= 4 && !containsWhisky) {
    recipes.push({
      name,
      rating,
      ingredients,
      instructions,
      garnish,
      comment,
    });
  }
});

recipes.sort((a, b) => b.rating - a.rating);

console.log(
  JSON.stringify(recipes, null, 2).replace(/Difford/gi, 'D')
);
