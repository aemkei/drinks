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
    fetch('/all.json')
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
    if (!query.trim()) return [];
    return allRecipes.filter(r => 
      r.name.toLowerCase().includes(query.toLowerCase().trim())
    ).slice(0, 20);
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
        <input
          type="text"
          id="search-input"
          placeholder="Search for a drink..."
          autoComplete="off"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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
