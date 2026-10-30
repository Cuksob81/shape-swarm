
# Shape Swarm

**Shape Swarm** is a browser-based, top-down arena survival game. Fight through increasingly dangerous waves of geometric enemies, collect coins, choose upgrades, and see how long your core can survive.

## Play

Scan the QR code below with your mobile device to open and play Shape Swarm.

<p align="center">
  <a href="https://cuksob81.github.io/shape-swarm">
    <img src="QR.png" alt="Shape Swarm QR Code" width="250">
  </a>
  <br>
  **Scan to Play**
</p>

**Game URL:** [https://cuksob81.github.io/shape-swarm](https://cuksob81.github.io/shape-swarm)

- **Mobile:** Scan the QR code using your camera.
- **Desktop:** Open the game directly using the link above.

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
- Spend coins between waves on upgrades and reroll shop offers for an increasing cost.
- Improve offensive and defensive stats, including damage, fire rate, projectile count, critical hits, piercing, health, regeneration, and movement speed.
- Face stronger enemy types and periodic boss waves.
- Track your best wave, saved locally in your browser when storage is available.

## Sound Effects

Sound effects are synthesized in JavaScript using the **Web Audio API**, so separate audio files are not required.

Effects provide feedback for shooting, hits, enemy defeats, coin pickups, taking damage, leveling up, wave transitions, shop actions, and game over.

Press **M** to mute or unmute sound effects.

## Project Files

```text
.
├── index.html   # Complete game
└── README.md    # Project description and instructions
```

The game is designed to run from a single HTML file. Its HTML, CSS, and JavaScript are contained in `index.html`, so separate `Style.css` and `Game.js` files are not required.

## Built With

- HTML5
- CSS
- Vanilla JavaScript
- HTML Canvas for game rendering
- Web Audio API for generated sound effects
- `localStorage` for the best-wave record, when browser storage is available

No game engine, build step, or external audio assets are required. The page may optionally load the Chakra Petch font from Google Fonts, with a system-font fallback.

## GitHub Pages Setup

1. Open your repository on GitHub.
2. Navigate to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select your publishing branch, usually `main`.
5. Select the folder containing `index.html`:
   - `/ (root)` if `index.html` is in the repository root.
   - `/game` if `index.html` is inside a `game` folder.
6. Click **Save**.
7. Open the published URL provided by GitHub Pages.

### Updating the Published Game

1. Edit `index.html` in your repository.
2. Commit your changes to the publishing branch.
3. Wait for GitHub Pages to finish deploying.
4. Refresh the website. If the old version remains visible, try **Ctrl + F5**.

Make sure the filename is exactly `index.html` and that it is located in the folder selected in your Pages settings.

## Status

Shape Swarm is an ongoing project. Features, enemy behavior, and balance may change as development continues.

Test desktop keyboard controls and mobile touch controls after significant updates.

## License

No license has been specified yet. Unless a license is added, normal copyright restrictions apply to the project's code and assets.
