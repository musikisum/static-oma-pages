(async () => {
  const nav     = document.getElementById('game-list');
  const frame   = document.getElementById('game-frame');
  const welcome = document.getElementById('welcome');
  let activeBtn = null;

  try {
    const res = await fetch('games.json');
    if (!res.ok) throw new Error();
    const games = await res.json();

    games.forEach(game => {
      const btn = document.createElement('button');
      btn.className = 'game-btn';
      btn.innerHTML =
        `<span class="game-icon">${game.icon}</span>` +
        `<div>` +
          `<div class="game-name">${game.name}</div>` +
          `<div class="game-desc">${game.description}</div>` +
        `</div>`;

      btn.addEventListener('click', () => {
        if (activeBtn) activeBtn.classList.remove('active');
        btn.classList.add('active');
        activeBtn = btn;
        frame.src = `${game.folder}/${game.entry}`;
        frame.style.display = 'block';
        welcome.style.display = 'none';
      });

      nav.appendChild(btn);
    });
  } catch {
    nav.innerHTML =
      '<p style="color:#94a3b8;padding:1rem;font-size:.82rem">' +
      'Spiele konnten nicht geladen werden.<br>' +
      '<code>games.json</code> fehlt – bitte erst deployen.</p>';
  }
})();
