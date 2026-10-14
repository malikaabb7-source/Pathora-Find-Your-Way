(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  // Keep the terrain stable when resizing or rotating the device.
  const rows = 19, cols = matchMedia('(max-width: 720px)').matches ? 19 : 31;
  let start = Math.floor(rows / 2) * cols + 3, finish = Math.floor(rows / 2) * cols + cols - 4;
  let walls = new Set(), algorithm = 'bfs', tool = 'wall';
  let result = null, events = [], cursor = 0, timer = null, running = false;
  let visitedCount = 0, currentCell = null, drawing = false, dragTool = null, lastEdited = null;
  const cells = [], grid = $('grid');
  const descriptions = {
    bfs: ['Meet breadth-first search.', 'Explores outward in layers, checking nearby cells before going farther. On this equal-cost grid, the first route to the finish is a shortest path.', true],
    dfs: ['Meet depth-first search.', 'Follows one branch as far as it can, then backtracks to explore others. It finds a route when one exists, but does not guarantee the shortest path.', false],
    dijkstra: ['Meet Dijkstra’s algorithm.', 'Always explores the cell with the lowest accumulated cost. It guarantees a shortest path. With every move costing one, it explores like breadth-first search.', true],
    astar: ['Meet A* search.', 'Balances the cost so far with Manhattan distance to the finish: horizontal plus vertical distance. This estimate guarantees a shortest path on this four-directional grid.', true]
  };
  const delays = [220, 110, 45, 15, 3], speeds = ['¼×', '½×', '1×', '2×', '4×'];
  grid.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  $('grid-size').textContent = `${cols} × ${rows} GRID`;
  for (let r = 0; r < rows; r++) {
    const row = document.createElement('div'); row.setAttribute('role', 'row'); row.style.display = 'contents';
    for (let c = 0; c < cols; c++) {
      const id = r * cols + c, cell = document.createElement('button');
      cell.className = 'cell'; cell.dataset.id = id; cell.setAttribute('role', 'gridcell');
      cell.tabIndex = id === start ? 0 : -1; cells.push(cell); row.append(cell);
    }
    grid.append(row);
  }
  function paint(id) {
    const cell = cells[id];
    cell.classList.toggle('wall', walls.has(id));
    cell.classList.toggle('start', id === start); cell.classList.toggle('finish', id === finish);
    cell.textContent = id === start ? '●' : id === finish ? '⚑' : '';
    const type = id === start ? 'Start' : id === finish ? 'Finish' : walls.has(id) ? 'Wall' : 'Empty';
    cell.setAttribute('aria-label', `Row ${Math.floor(id / cols) + 1}, column ${id % cols + 1}: ${type}`);
  }
  function setStatus(text, badge) { $('status').textContent = text; $('state-badge').textContent = badge; }
  function stopTimer() { if (timer !== null) clearTimeout(timer); timer = null; }
  function updatePlayback() {
    $('play').innerHTML = running ? 'Ⅱ <span>Pause</span>' : cursor === events.length && result ? '↻ <span>Replay</span>' : cursor > 0 ? '▶ <span>Resume</span>' : '▶ <span>Explore</span>';
    $('step').disabled = running || (!!result && cursor === events.length);
  }
  function resetExploration(message = 'The grid is yours. Where will you go?') {
    stopTimer(); running = false; result = null; events = []; cursor = 0; visitedCount = 0; currentCell = null;
    for (const cell of cells) cell.classList.remove('visited', 'path', 'current');
    $('visited-count').textContent = '0'; $('path-length').textContent = '—';
    setStatus(message, 'READY TO EXPLORE'); updatePlayback();
  }
  function prepare() {
    result = PathoraSearch({ rows, cols, walls, start, finish, algorithm });
    events = result.visited.map(id => ({ type: 'visited', id }));
    if (result.found) events.push(...result.path.map(id => ({ type: 'path', id })));
    cursor = 0;
  }
  function complete() {
    running = false; stopTimer();
    if (currentCell !== null) cells[currentCell].classList.remove('current');
    $('path-length').textContent = result.found ? String(result.path.length - 1) : '—';
    setStatus(result.found ? `Destination reached in ${result.path.length - 1} steps. ${algorithm === 'dfs' ? 'Try BFS or A* to compare the shortest route.' : 'You found a shortest path.'}` : 'No path exists. Erase a wall or move a marker, then try again.', result.found ? 'DESTINATION REACHED' : 'NO PATH FOUND');
    updatePlayback();
  }
  function advance() {
    if (cursor >= events.length) { complete(); return; }
    const event = events[cursor++];
    if (currentCell !== null) cells[currentCell].classList.remove('current');
    cells[event.id].classList.add(event.type, 'current'); currentCell = event.id;
    if (event.type === 'visited') { visitedCount++; $('visited-count').textContent = visitedCount; }
    setStatus(event.type === 'path' ? 'Tracing the route from start to finish…' : 'Exploring the terrain, one cell at a time…', running ? 'EXPLORING' : 'PAUSED');
    if (cursor === events.length) complete();
    else updatePlayback();
  }
  function tick() { if (!running) return; advance(); if (running) timer = setTimeout(tick, delays[Number($('speed').value) - 1]); }
  $('play').addEventListener('click', () => {
    if (running) { running = false; stopTimer(); setStatus('Take a closer look. Resume or step to continue.', 'PAUSED'); updatePlayback(); return; }
    if (result && cursor === events.length) resetExploration();
    if (!result) prepare();
    running = true; updatePlayback(); tick();
  });
  $('step').addEventListener('click', () => { if (running) return; if (!result) prepare(); advance(); });
  $('reset').addEventListener('click', () => resetExploration('Exploration reset. Your terrain is ready for another journey.'));
  $('speed').addEventListener('input', () => { $('speed-value').textContent = speeds[Number($('speed').value) - 1]; if (running) { stopTimer(); timer = setTimeout(tick, delays[Number($('speed').value) - 1]); } });
  document.querySelectorAll('[data-algorithm]').forEach(button => button.addEventListener('click', () => {
    algorithm = button.dataset.algorithm;
    document.querySelectorAll('[data-algorithm]').forEach(b => { const selected = b === button; b.classList.toggle('selected', selected); b.setAttribute('aria-pressed', selected); });
    const [title, description, shortest] = descriptions[algorithm];
    $('algo-title').textContent = title; $('algo-description').textContent = description;
    $('guarantee').textContent = shortest ? '✓ SHORTEST PATH' : '↝ SHORTEST NOT GUARANTEED'; $('guarantee').classList.toggle('no-guarantee', !shortest);
    resetExploration('New explorer selected. Your terrain stays the same.');
  }));
  document.querySelectorAll('[data-tool]').forEach(button => button.addEventListener('click', () => {
    tool = button.dataset.tool;
    document.querySelectorAll('[data-tool]').forEach(b => { const selected = b === button; b.classList.toggle('selected', selected); b.setAttribute('aria-pressed', selected); });
    $('edit-help').textContent = tool === 'start' || tool === 'finish' ? `Tap an empty cell to move the ${tool} point.` : `Drag to ${tool === 'wall' ? 'draw walls' : 'erase walls'}. Drag the markers to move them.`;
  }));
  function edit(id, selectedTool) {
    if (id === lastEdited) return;
    lastEdited = id;
    if ((selectedTool === 'wall' || selectedTool === 'erase') && (id === start || id === finish)) return;
    if ((selectedTool === 'start' || selectedTool === 'finish') && (walls.has(id) || id === (selectedTool === 'start' ? finish : start))) return;
    if (result) resetExploration('Terrain changed. Ready to find a new route.');
    if (selectedTool === 'wall') walls.add(id);
    else if (selectedTool === 'erase') walls.delete(id);
    else { const old = selectedTool === 'start' ? start : finish; if (selectedTool === 'start') start = id; else finish = id; paint(old); }
    paint(id);
  }
  grid.addEventListener('pointerdown', event => {
    const cell = event.target.closest('.cell'); if (!cell || (event.button !== 0 && event.pointerType === 'mouse')) return;
    event.preventDefault(); const id = Number(cell.dataset.id);
    drawing = true; lastEdited = null;
    dragTool = id === start ? 'start' : id === finish ? 'finish' : tool;
    cells.forEach(b => b.tabIndex = -1); cell.tabIndex = 0;
    cell.focus({ preventScroll: true }); grid.setPointerCapture(event.pointerId); edit(id, dragTool);
  });
  grid.addEventListener('pointermove', event => {
    if (!drawing) return;
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest('.cell');
    if (cell && grid.contains(cell)) edit(Number(cell.dataset.id), dragTool);
  });
  function endDrawing() { drawing = false; dragTool = null; lastEdited = null; }
  grid.addEventListener('pointerup', endDrawing); grid.addEventListener('pointercancel', endDrawing); grid.addEventListener('lostpointercapture', endDrawing);
  // Roving focus avoids hundreds of tab stops. Enter/Space applies the current tool.
  grid.addEventListener('keydown', event => {
    const cell = event.target.closest('.cell'); if (!cell) return;
    const id = Number(cell.dataset.id), r = Math.floor(id / cols), c = id % cols;
    const moves = { ArrowUp: r > 0 ? id - cols : id, ArrowDown: r < rows - 1 ? id + cols : id, ArrowLeft: c > 0 ? id - 1 : id, ArrowRight: c < cols - 1 ? id + 1 : id };
    if (event.key in moves) { event.preventDefault(); cells.forEach(b => b.tabIndex = -1); cells[moves[event.key]].tabIndex = 0; cells[moves[event.key]].focus(); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); lastEdited = null; edit(id, tool); lastEdited = null; }
  });
  $('clear-walls').addEventListener('click', () => { resetExploration('A fresh canvas. Draw your next challenge.'); walls.clear(); cells.forEach((_, id) => paint(id)); });
  $('maze').addEventListener('click', () => {
    resetExploration('A new maze awaits. There is a route between your markers.');
    // Randomized depth-first carving through odd coordinates makes a connected maze.
    walls = new Set(cells.map((_, id) => id));
    const first = cols + 1, carved = new Set([first]), stack = [first]; walls.delete(first);
    while (stack.length) {
      const id = stack[stack.length - 1], r = Math.floor(id / cols), c = id % cols;
      const options = [[r - 2, c], [r, c + 2], [r + 2, c], [r, c - 2]].filter(([nr, nc]) => nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && !carved.has(nr * cols + nc));
      if (!options.length) { stack.pop(); continue; }
      const [nr, nc] = options[Math.floor(Math.random() * options.length)], next = nr * cols + nc;
      walls.delete((id + next) / 2); walls.delete(next); carved.add(next); stack.push(next);
    }
    // Connect any relocated endpoint to an existing carved cell.
    for (const endpoint of [start, finish]) {
      let nearest = first, best = Infinity;
      for (const id of carved) { const distance = Math.abs(Math.floor(id / cols) - Math.floor(endpoint / cols)) + Math.abs(id % cols - endpoint % cols); if (distance < best) { best = distance; nearest = id; } }
      let r = Math.floor(endpoint / cols), c = endpoint % cols; const nr = Math.floor(nearest / cols), nc = nearest % cols;
      walls.delete(endpoint);
      while (r !== nr) { r += Math.sign(nr - r); walls.delete(r * cols + c); }
      while (c !== nc) { c += Math.sign(nc - c); walls.delete(r * cols + c); }
    }
    cells.forEach((_, id) => paint(id));
  });
  $('algo-description').textContent = descriptions.bfs[1]; cells.forEach((_, id) => paint(id)); updatePlayback();
})();
