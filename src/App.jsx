import React, { useState, useEffect, useMemo } from 'react';
import RecipeCard from './components/RecipeCard.jsx';
import BookmarkChips from './components/BookmarkChips.jsx';

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default function App() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
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
    const version = import.meta.env.VITE_APP_VERSION || '1.1.0';
    fetch(`all.json?v=${version}`)
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

    const nameMatches = allRecipes.filter(r => {
      const regex = new RegExp(`\\b${escapeRegExp(q)}`, 'i');
      return regex.test(r.name);
    });

    const terms = q.split(/\s+/).filter(t => t.length > 0);
    const ingredientMatches = allRecipes.filter(r => {
      // Don't duplicate if it already matched by name
      const nameRegex = new RegExp(`\\b${escapeRegExp(q)}`, 'i');
      if (nameRegex.test(r.name)) return false;
      
      // All terms in the query must match at least one ingredient's word-start
      return terms.every(term => {
        const termRegex = new RegExp(`\\b${escapeRegExp(term)}`, 'i');
        return r.ingredients.some(ing => termRegex.test(ing));
      });
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
    <div className={`container ${query ? 'search-active' : ''}`}>
      <header className="main-header">
        <h1>Sip</h1>
        <small>Find your perfect drink!</small>
      </header>

      <div className="search-section">
        <div className="search-row">
          <div className="search-container">
            <div className="input-wrapper">
              <input
                type="text"
                id="search-input"
                placeholder="Find a cocktail..."
                autoComplete="off"
                autoFocus
                value={query}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
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
          </div>
          
          {!query && (
            <div className="favorites-container">
              <BookmarkChips 
                bookmarks={bookmarks} 
                allRecipes={allRecipes} 
                onChipClick={handleChipClick} 
              />
            </div>
          )}
        </div>
      </div>

      <div id="results-container" className="results">
        {query && filteredRecipes.length === 0 && (
          <div className="empty-state">No matches found.</div>
        )}
        {filteredRecipes.map(recipe => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            query={query}
            isBookmarked={bookmarks.includes(recipe.id)}
            onToggleBookmark={() => toggleBookmark(recipe.id)}
          />
        ))}
      </div>
      <footer className="footer">
        v{import.meta.env.VITE_APP_VERSION || '1.1.0'}
      </footer>
    </div>
  );
}
