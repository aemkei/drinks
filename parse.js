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

  if (name && rating >= 4.5 && !containsWhisky) {
    recipes.push({
      name,
      instructions,
      rating,
      ratingStr,
      comment,
      garnish,
      ingredients
    });
  }
});

recipes.sort((a, b) => b.rating - a.rating);

recipes.forEach(recipe => {
  console.log(`### ${recipe.name}\n`);
  
  if (recipe.ratingStr) console.log(`(Rating: ${recipe.ratingStr} / 5)\n`);

  if (recipe.comment) console.log(`**Comment:** ${recipe.comment}\n`);

  if (recipe.ingredients.length > 0) {
    recipe.ingredients.forEach(ing => console.log(`* ${ing}`));
  }
  if (recipe.garnish) console.log(`* Garnish: ${recipe.garnish}`);

  console.log(`\n**Instructions:** ${recipe.instructions}`);
  console.log('\n---\n');
});
