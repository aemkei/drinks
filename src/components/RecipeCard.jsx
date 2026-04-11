import React from 'react';

export default function RecipeCard({ recipe, isBookmarked, onToggleBookmark }) {
  return (
    <div className="recipe-card">
      <button 
        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
        onClick={onToggleBookmark}
        title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      >
        {isBookmarked ? '★' : '☆'}
      </button>
      <div className="recipe-title">{recipe.name}</div>
      <div className="rating">{recipe.rating} / 5</div>
      
      <div className="section-title">Ingredients</div>
      <ul className="ingredients-list">
        {recipe.ingredients.map((ing, idx) => (
          <li key={idx} dangerouslySetInnerHTML={{ 
            __html: ing.replace(/ shot /g, ' <small>shot</small> ') 
          }} />
        ))}
        {recipe.garnish && (
          <li><small>Garnish:</small> {recipe.garnish}</li>
        )}
      </ul>

      <div className="section-title">Instructions</div>
      <div className="instructions">{recipe.instructions}</div>
      {recipe.comment && <div className="comment">{recipe.comment}</div>}
    </div>
  );
}
