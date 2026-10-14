/* Pure search functions, shared by the website and the verification suite. */
(function (root) {
  'use strict';
  function search({ rows, cols, walls, start, finish, algorithm }) {
    const total = rows * cols;
    if (!['bfs', 'dfs', 'dijkstra', 'astar'].includes(algorithm)) throw new Error('Unknown algorithm');
    if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1 || !Number.isInteger(start) || !Number.isInteger(finish) || start < 0 || finish < 0 || start >= total || finish >= total) throw new Error('Invalid grid');
    const blocked = new Set(walls);
    if (blocked.has(start) || blocked.has(finish)) return { visited: [], path: [], found: false };
    const neighbors = id => {
      const r = Math.floor(id / cols), c = id % cols, result = [];
      if (r > 0) result.push(id - cols);
      if (c < cols - 1) result.push(id + 1);
      if (r < rows - 1) result.push(id + cols);
      if (c > 0) result.push(id - 1);
      return result.filter(n => !blocked.has(n));
    };
    const heuristic = id => Math.abs(Math.floor(id / cols) - Math.floor(finish / cols)) + Math.abs(id % cols - finish % cols);
    const parent = new Map(), visited = [], discovered = new Set([start]);
    if (algorithm === 'bfs' || algorithm === 'dfs') {
      const frontier = [start]; let head = 0;
      while (algorithm === 'dfs' ? frontier.length : head < frontier.length) {
        const current = algorithm === 'dfs' ? frontier.pop() : frontier[head++];
        visited.push(current);
        if (current === finish) break;
        const next = neighbors(current);
        if (algorithm === 'dfs') next.reverse();
        for (const n of next) if (!discovered.has(n)) {
          discovered.add(n); parent.set(n, current); frontier.push(n);
        }
      }
    } else {
      const distance = new Map([[start, 0]]), closed = new Set();
      const frontier = [{ id: start, score: algorithm === 'astar' ? heuristic(start) : 0, order: 0 }];
      let order = 1;
      while (frontier.length) {
        frontier.sort((a, b) => a.score - b.score || a.order - b.order);
        const current = frontier.shift().id;
        if (closed.has(current)) continue;
        closed.add(current); visited.push(current);
        if (current === finish) break;
        for (const n of neighbors(current)) {
          const cost = distance.get(current) + 1;
          if (!closed.has(n) && cost < (distance.get(n) ?? Infinity)) {
            distance.set(n, cost); parent.set(n, current);
            frontier.push({ id: n, score: cost + (algorithm === 'astar' ? heuristic(n) : 0), order: order++ });
          }
        }
      }
    }
    const found = visited[visited.length - 1] === finish, path = [];
    if (found) { let current = finish; while (current !== undefined) { path.push(current); current = parent.get(current); } path.reverse(); }
    return { visited, path, found };
  }
  root.PathoraSearch = search;
  if (typeof module !== 'undefined' && module.exports) module.exports = search;
})(typeof globalThis !== 'undefined' ? globalThis : window);
