const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('scraping/recipe_3.html', 'utf-8');
const $ = cheerio.load(html);

const title = $("h1").text();
const rating = $("[itemprop=ratingValue]").attr("content");
const image = $('.cocktails_image_wrapper img').attr('src');
const table = $('#cocktails_recipe_ingredients_table tr');

console.log('\n---------');
console.log(title);
console.log(`${rating} stars`);
console.log(image);

table.each((index, element) => {
  const glassSelector = 'td.cocktails_recipe_glass a';
  const hasGlass = $(element).has(glassSelector).length;

  if (hasGlass) {
    const glass = $(element).find(glassSelector).text();
    console.log(glass, hasGlass);
  } else {

    const ingredient = $(element).text()
      .replace(/^\s+/, '')
      .replace(/\s+/g, ' ');

    console.log('-', ingredient);
  }
});

const instructions = $("[itemprop=recipeInstructions]").text();

console.log(instructions);