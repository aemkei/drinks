import React, { useMemo } from 'react';

export default function BookmarkChips({ bookmarks, allRecipes, onChipClick }) {
  const bookmarkedRecipes = useMemo(() => {
    if (!bookmarks.length || !allRecipes.length) return [];
    return bookmarks
      .map(id => allRecipes.find(r => String(r.id) === String(id)))
      .filter(r => r && r.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [bookmarks, allRecipes]);

  if (bookmarkedRecipes.length === 0) return null;

  return (
    <div className="bookmark-chips">
      {bookmarkedRecipes.map((recipe, index) => (
        <div 
          key={recipe.id || index} 
          className="chip" 
          onClick={() => onChipClick(recipe.name)}
        >
          {recipe.name}
        </div>
      ))}
    </div>
  );
}
