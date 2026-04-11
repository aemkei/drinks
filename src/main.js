/**
 * Simple Cocktail Search App
 * Modular Refactoring with Best Practices
 */

import './style.css';

// In-memory store for all recipes loaded from the JSON data
let allRecipes = [];

/**
 * Loads the recipe data from the server.
 * In production/Vite, all.json is served from the public/ directory.
 */
async function loadRecipes() {
    try {
        const response = await fetch('/all.json');
        if (!response.ok) throw new Error('Failed to fetch recipes');
        allRecipes = await response.json();
    } catch (error) {
        console.error('Error loading recipes:', error);
        const container = document.getElementById('results-container');
        if (container) {
            container.innerHTML = 
                '<div class="empty-state">Error loading recipes. Make sure all.json exists.</div>';
        }
    }
}

/**
 * Renders a list of recipes into the DOM.
 * @param {Array} recipes - Array of recipe objects to render.
 */
function renderRecipes(recipes) {
    const container = document.getElementById('results-container');
    if (!container) return;

    if (recipes.length === 0) {
        container.innerHTML = '<div class="empty-state">No matches found.</div>';
        return;
    }

    // Limit to top 20 matches as per recent user request
    container.innerHTML = recipes.slice(0, 20).map(recipe => `
        <div class="recipe-card">
            <div class="recipe-title">${recipe.name}</div>
            <div class="rating">${recipe.rating} / 5</div>
            
            <div class="section-title">Ingredients</div>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ing => `<li>${
                    ing.replace(/ shot /g, ' <small>shot</small> ')
                }</li>`).join('')}
                ${recipe.garnish ? `<li><small>Garnish:</small> ${recipe.garnish}</li>` : ''}
            </ul>

            <div class="section-title">Instructions</div>
            <div class="instructions">${recipe.instructions}</div>
            ${recipe.comment ? `<div class="comment">${recipe.comment}</div>` : ''}
        </div>
    `).join('');
}

/**
 * Initializes the application:
 * 1. Sets up the search event listener.
 * 2. Loads the data.
 * 3. Handles auto-focus and service worker registration.
 */
function init() {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');

    if (searchInput && resultsContainer) {
        // Handle input changes with basic filtering
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                resultsContainer.innerHTML = 
                    '<div class="empty-state">Start typing to find recipes</div>';
                return;
            }

            const matches = allRecipes.filter(recipe => 
                recipe.name.toLowerCase().includes(query)
            );

            renderRecipes(matches);
        });
    }

    // Trigger initial data load
    loadRecipes();

    // Best-effort to open keyboard on startup by forcing focus
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (searchInput) searchInput.focus();
        }, 10);
    });

    // Register Service Worker for offline support and caching
    // sw.js is served from the public directory in Vite
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered', reg))
                .catch(err => console.error('Service Worker registration failed', err));
        });
    }
}

// Start the app
init();
