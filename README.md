# Shape Swarm

**Shape Swarm** is a browser-based, top-down arena survival game. Fight through increasingly dangerous waves of geometric enemies, collect coins, choose upgrades, and see how long your core can survive.

## Play

- **GitHub Pages:** Add your published game URL here: `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/`
- **Run locally:** Download or clone this repository and open `index.html` in a modern browser.

## Controls

| Platform | Controls |
| --- | --- |
| Desktop | Move with **WASD** or the **arrow keys**. |
| Mobile / touch | Use the on-screen joystick near the bottom-center of the screen. |
| Sound | Press **M** to toggle sound effects. Sound starts after your first interaction, as required by most browsers. |

## Gameplay

- Survive escalating waves of geometric enemies.
- Your core automatically targets nearby enemies and fires projectiles.
- Collect coins dropped by defeated enemies.
- Choose free upgrades when you level up.
- Spend coins between waves on upgrades; reroll the shop offers for an increasing cost.
- Build up offensive and defensive stats, including damage, fire rate, projectile count, critical hits, piercing, health, regeneration, movement speed, and more.
- Face stronger enemy types and periodic boss waves.
- Track your best wave, saved locally in your browser when storage is available.

## Sound effects

Sound effects are synthesized in JavaScript with the **Web Audio API**, so the game does not need separate sound files. Effects provide feedback for shooting, hits, enemy defeats, coin pickups, taking damage, leveling up, wave transitions, shop actions, and game over. Press **M** to mute or unmute.

## Project files

```text
.
├── index.html   # HTML entry point
├── Style.css    # Layout and visual styling
├── Game.js      # Game logic, rendering, controls, and generated sound effects
└── README.md    # Project description and instructions
```

## Built with

- HTML5
- CSS
- Vanilla JavaScript
- HTML Canvas for game rendering
- Web Audio API for generated sound effects
- `localStorage` for the best-wave record (when browser storage is available)

No game engine, build step, or external audio assets are required. The page optionally loads the Chakra Petch font from Google Fonts; a system-font fallback is included.

## GitHub Pages setup

1. Keep `index.html`, `Style.css`, `Game.js`, and `README.md` in the same published directory.
2. In the repository, open **Settings → Pages**.
3. Select the branch you use (usually `main`) and the correct folder (`/ (root)` if these files are at the repository root, or `/game` if they are inside a `game` folder).
4. Save, then open the published URL. If you update files and the old version remains visible, hard-refresh with **Ctrl+F5** or check the published folder and filename casing.

## Status

This is an ongoing project. Features and balance may change as the game is developed. Test desktop keyboard controls and mobile touch controls after significant changes.

## License

No license has been specified yet. Unless a license is added, normal copyright restrictions apply to reuse of this repository's code and assets.
