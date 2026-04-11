(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[];async function t(){try{let t=await fetch(`/all.json`);if(!t.ok)throw Error(`Failed to fetch recipes`);e=await t.json()}catch(e){console.error(`Error loading recipes:`,e);let t=document.getElementById(`results-container`);t&&(t.innerHTML=`<div class="empty-state">Error loading recipes. Make sure all.json exists.</div>`)}}function n(e){let t=document.getElementById(`results-container`);if(t){if(e.length===0){t.innerHTML=`<div class="empty-state">No matches found.</div>`;return}t.innerHTML=e.slice(0,20).map(e=>`
        <div class="recipe-card">
            <div class="recipe-title">${e.name}</div>
            <div class="rating">${e.rating} / 5</div>
            
            <div class="section-title">Ingredients</div>
            <ul class="ingredients-list">
                ${e.ingredients.map(e=>`<li>${e.replace(/ shot /g,` <small>shot</small> `)}</li>`).join(``)}
                ${e.garnish?`<li><small>Garnish:</small> ${e.garnish}</li>`:``}
            </ul>

            <div class="section-title">Instructions</div>
            <div class="instructions">${e.instructions}</div>
            ${e.comment?`<div class="comment">${e.comment}</div>`:``}
        </div>
    `).join(``)}}function r(){let r=document.getElementById(`search-input`),i=document.getElementById(`results-container`);r&&i&&r.addEventListener(`input`,t=>{let r=t.target.value.toLowerCase().trim();if(!r){i.innerHTML=`<div class="empty-state">Start typing to find recipes</div>`;return}n(e.filter(e=>e.name.toLowerCase().includes(r)))}),t(),window.addEventListener(`load`,()=>{setTimeout(()=>{r&&r.focus()},10)}),`serviceWorker`in navigator&&window.addEventListener(`load`,()=>{navigator.serviceWorker.register(`/sw.js`).then(e=>console.log(`Service Worker registered`,e)).catch(e=>console.error(`Service Worker registration failed`,e))})}r();