import React, { useState, useEffect, useMemo } from 'react';
import RecipeCard from './components/RecipeCard.jsx';
import BookmarkChips from './components/BookmarkChips.jsx';

export default function App() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const stored = localStorage.getItem('bookmarks');
      const parsed = JSON.parse(stored || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Load recipes on mount
  useEffect(() => {
    fetch('all.json')
      .then(res => res.json())
      .then(data => setAllRecipes(data))
      .catch(err => console.error('Failed to load recipes:', err));
  }, []);

  // Sync bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Filter recipes based on query
  const filteredRecipes = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const nameMatches = allRecipes.filter(r => 
      r.name.toLowerCase().includes(q)
    );

    const terms = q.split(/\s+/).filter(t => t.length > 0);
    const ingredientMatches = allRecipes.filter(r => {
      // Don't duplicate if it already matched by name
      if (r.name.toLowerCase().includes(q)) return false;
      
      // All terms in the query must match at least one ingredient
      return terms.every(term => 
        r.ingredients.some(ing => ing.toLowerCase().includes(term))
      );
    });

    return [...nameMatches, ...ingredientMatches].slice(0, 20);
  }, [allRecipes, query]);

  const toggleBookmark = (id) => {
    setBookmarks(prev => {
      if (prev.includes(id)) {
        return prev.filter(bId => bId !== id);
      }
      return [...prev, id];
    });
  };

  const handleChipClick = (name) => {
    setQuery(name);
  };

  return (
    <div className="container">
      <div className="search-container">
        <div className="input-wrapper">
          <input
            type="text"
            id="search-input"
            placeholder="Search for a drink..."
            autoComplete="off"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              className="clear-btn" 
              onClick={() => { setQuery(''); document.getElementById('search-input').focus(); }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {!query && (
          <BookmarkChips 
            bookmarks={bookmarks} 
            allRecipes={allRecipes} 
            onChipClick={handleChipClick} 
          />
        )}
      </div>

      <div id="results-container" className="results">
        {query && filteredRecipes.length === 0 && (
          <div className="empty-state">No matches found.</div>
        )}
        {!query && (
          <div className="empty-state">Start typing to find recipes</div>
        )}
        {filteredRecipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            isBookmarked={bookmarks.includes(recipe.id)}
            onToggleBookmark={() => toggleBookmark(recipe.id)}
          />
        ))}
      </div>
    </div>
  );
}
