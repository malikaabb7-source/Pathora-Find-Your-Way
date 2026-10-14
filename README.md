# Pathora — Find Your Way

A responsive, accessible pathfinding playground built with plain HTML, CSS and JavaScript. No dependencies, backend, API keys or build step.

## Open locally

Open `index.html` in a browser, or serve this folder with `python -m http.server 8000` and visit `http://localhost:8000`.

## Publish on GitHub Pages

1. Create a GitHub repository and upload `index.html`, `styles.css`, `algorithms.js`, and `app.js` to its root.
2. Open the repository's **Settings → Pages**.
3. Choose **Deploy from a branch**, choose your branch (usually `main`), select **/ (root)**, and save.
4. GitHub will display the website URL after deployment. All assets use relative paths and work under a repository subdirectory.

## Controls

- Select Draw wall or Erase and drag across the grid.
- Drag a start/finish marker, or select its tool and tap an empty cell. Markers cannot overlap or be placed inside a wall.
- Explore starts playback; Pause freezes it; Resume continues; Replay restarts a completed run.
- Step advances one visited cell or one path cell. Reset clears the exploration while preserving walls and markers.
- Change speed at any point. Selecting another algorithm resets exploration while retaining terrain.
- Generate maze makes a connected random maze and connects both markers to it. Clear all walls gives an empty grid.
- Keyboard: Tab to the grid, use arrow keys to navigate, and Enter or Space to apply the selected editing tool.

## Algorithms and measurements

Movement is four-directional and every move costs 1. BFS, Dijkstra and A* guarantee a shortest path. A* uses Manhattan distance. DFS is complete on this finite grid but does not guarantee the shortest path. Neighbor order is up, right, down, left, with deterministic ties.

Cells explored counts unique expanded cells, including start and finish when reached. Path length counts moves (edges), not cells; it is shown after path animation finishes. An unreachable finish displays “No path exists” and no path length.

The grid has 19 rows, with 31 columns on desktop or 19 columns on mobile when first opened. Resizing does not destroy the terrain. The full search is computed locally before animation; the controls step through that recorded search.

## Verification

Run `node work/verify.cjs` to verify known paths, unreachable cases, start equals finish, random-grid shortest-path comparisons, and path validity. No installation needed.
