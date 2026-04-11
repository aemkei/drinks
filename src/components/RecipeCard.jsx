import React from 'react';

const highlightText = (text, query) => {
  if (!query.trim()) return text;
  const terms = query.split(/\s+/).filter(t => t.length > 0);
  if (terms.length === 0) return text;
  
  const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // Match only if the term starts at a word boundary
  const regex = new RegExp(`(\\b${escapedTerms.join('|\\b')})`, 'gi');
  
  const parts = text.split(regex);
  return parts.map((part, i) => 
    regex.test(part) ? `<mark class="highlight">${part}</mark>` : part
  ).join('');
};

export default function RecipeCard({ recipe, query, isBookmarked, onToggleBookmark }) {
  return (
    <div className="recipe-card">
      <button 
        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
        onClick={onToggleBookmark}
        title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      >
        <svg viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
      <div 
        className="recipe-title" 
        dangerouslySetInnerHTML={{ __html: highlightText(recipe.name, query) }} 
      />
      <div className="rating">{recipe.rating} / 5</div>
      
      <div className="section-title">Ingredients</div>
      <ul className="ingredients-list">
        {recipe.ingredients.map((ing, idx) => {
          // First handle the "shot" formatting, then highlight
          const formatted = ing.replace(/ shot /g, ' <small>shot</small> ');
          const highlighted = highlightText(formatted, query);
          return (
            <li key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} />
          );
        })}
        {recipe.garnish && (
          <li dangerouslySetInnerHTML={{ 
            __html: `<small>Garnish:</small> ${highlightText(recipe.garnish, query)}` 
          }} />
        )}
      </ul>

      <div className="section-title">Instructions</div>
      <div className="instructions">{recipe.instructions}</div>
      {recipe.comment && <div className="comment">{recipe.comment}</div>}
    </div>
  );
}
