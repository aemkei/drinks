import React from 'react';

const mlToShot = (ml) => {
  const shots = ml / 30;
  const whole = Math.floor(shots);
  const fraction = shots - whole;
  
  let fracStr = '';
  if (fraction > 0.02) {
    const fractions = [
      { val: 1/8, str: '⅛' }, { val: 1/6, str: '⅙' }, { val: 1/4, str: '¼' },
      { val: 1/3, str: '⅓' }, { val: 3/8, str: '⅜' }, { val: 1/2, str: '½' },
      { val: 5/8, str: '⅝' }, { val: 2/3, str: '⅔' }, { val: 3/4, str: '¾' },
      { val: 5/6, str: '⅚' }, { val: 7/8, str: '⅞' }, { val: 1, str: '1' }
    ];
    let closest = fractions[0];
    let minDiff = Math.abs(fraction - closest.val);
    for (let i = 1; i < fractions.length; i++) {
        const diff = Math.abs(fraction - fractions[i].val);
        if (diff < minDiff) {
            closest = fractions[i];
            minDiff = diff;
        }
    }
    if (closest.val === 1) {
      return `${whole + 1}`;
    }
    // Only map to fraction if distance is small enough (to avoid mapping weird numbers incorrectly)
    if (minDiff < 0.05) {
      fracStr = closest.str;
    }
  }

  let result = '';
  if (whole > 0) result += whole;
  if (fracStr) result += fracStr;
  
  // If it didn't map well to a fraction and wasn't whole, fallback to roughly 1 decimal place format
  if (!result) return Number(shots.toFixed(2)).toString();
  
  return result;
};

const replaceMlWithShots = (text) => {
  return text.replace(/(\d+(?:\.\d+)?)\s*ml\b/gi, (match, p1) => {
    const ml = parseFloat(p1);
    if (isNaN(ml)) return match;
    const shotVal = mlToShot(ml);
    const label = shotVal === '1' ? 'shot' : 'shots';
    return `${shotVal} <small>${label}</small>`;
  });
};

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

const Scale = ({ label, value, leftLabel, rightLabel }) => {
  if (value === null || value === undefined) return null;
  const percentage = (value / 10) * 100;
  return (
    <div className="scale-container">
      <div className="scale-header">
        <span className="scale-label">{label}</span>
        <span className="scale-value">{value}/10</span>
      </div>
      <div className="scale-bar-wrapper">
        <div className="scale-bar-bg">
          <div className="scale-bar-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>
      <div className="scale-footer">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

export default function RecipeCard({ recipe, query, isBookmarked, onToggleBookmark }) {
  const [showMore, setShowMore] = React.useState(false);

  return (
    <div 
      className={`recipe-card ${!showMore ? 'clickable' : ''}`}
      onClick={() => !showMore && setShowMore(true)}
      style={{ cursor: !showMore ? 'pointer' : 'default' }}
    >
      <button 
        className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleBookmark();
        }}
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
      <div className="rating-row">
        <div className="rating">{recipe.rating} / 5</div>
      </div>
      
      <div className="section-title">Ingredients</div>
      <ul className="ingredients-list">
        {recipe.ingredients.map((ing, idx) => {
          // First handle ML to Shot conversion
          const withShots = replaceMlWithShots(ing);
          // Then handle existing "shot" formatting and highlighting
          const formatted = withShots.replace(/ shot /g, ' <small>shot</small> ');
          const highlighted = highlightText(formatted, query);
          return (
            <li key={idx} dangerouslySetInnerHTML={{ __html: highlighted }} />
          );
        })}
        {recipe.garnish && (
          <li dangerouslySetInnerHTML={{ 
            __html: `<small>Garnish:</small> ${highlightText(replaceMlWithShots(recipe.garnish), query)}` 
          }} />
        )}
      </ul>

      {!showMore && (recipe.strength !== null || recipe.taste !== null || recipe.review || recipe.history) && (
        <button 
          className="more-info-btn"
          onClick={() => setShowMore(true)}
        >
          More Info
        </button>
      )}

      {showMore && (
        <div className="extra-info-container">
          <div className="section-title">Instructions</div>
          <ol className="instructions-list" style={{ paddingLeft: '1.25rem', margin: '0.5rem 0' }}>
            {Array.isArray(recipe.instructions) ? (
              recipe.instructions.map((step, idx) => (
                <li style={{ marginBottom: '0.5rem' }} key={idx} dangerouslySetInnerHTML={{ 
                  __html: highlightText(replaceMlWithShots(step), query) 
                }} />
              ))
            ) : (
              <li style={{ marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ 
                __html: highlightText(replaceMlWithShots(recipe.instructions), query) 
              }} />
            )}
          </ol>

          {(recipe.strength !== null || recipe.taste !== null) && (
            <div className="metrics-row" style={{ marginTop: '20px', borderTop: '1px solid #f0f0f0', paddingTop: '15px' }}>
              <Scale 
                label="Strength" 
                value={recipe.strength} 
                leftLabel="Weak" 
                rightLabel="Boozy" 
              />
              <Scale 
                label="Taste" 
                value={recipe.taste} 
                leftLabel="Sweet" 
                rightLabel="Sour" 
              />
            </div>
          )}
          {recipe.review && (
            <div className="section-title">Review</div>
          )}
          {recipe.review && (
            <div className="review-box" dangerouslySetInnerHTML={{
              __html: highlightText(replaceMlWithShots(recipe.review), query)
            }} />
          )}
          {recipe.history && (
            <div className="section-title">History</div>
          )}
          {recipe.history && (
            <div className="history-box" dangerouslySetInnerHTML={{
              __html: highlightText(replaceMlWithShots(recipe.history), query)
            }} />
          )}
          {recipe.comment && !recipe.review && !recipe.history && (
            <div className="comment" dangerouslySetInnerHTML={{
              __html: highlightText(replaceMlWithShots(recipe.comment), query)
            }} />
          )}
        </div>
      )}
    </div>
  );
}
