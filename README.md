# Shape Swarm

A single-player, endless wave survival game in the style of Brotato, drawn entirely with simple glowing shapes. It runs in any modern browser on phone or PC, with no build step and no dependencies.

## How to play

- Your core fires automatically at the nearest enemy. You only move.
- Survive each wave while collecting coins and XP from defeated enemies.
- After every wave, pick free level-up upgrades, then spend coins in the shop.
- Waves never end. Enemies get tougher and spawn faster each wave, and a boss appears every 10th wave.
- Your best wave is saved in the browser.

## Controls

The game switches automatically based on what you used last.

| Device | Control |
| --- | --- |
| Phone or tablet | Fixed on-screen joystick in the bottom-left. Touch anywhere in the left half of the screen to use it. |
| PC | `W` `A` `S` `D` or the arrow keys |

## Enemies

| Shape | Behavior |
| --- | --- |
| Red circle | Chases you |
| Yellow triangle | Fast |
| Purple square | Slow and tough |
| Pink hexagon | Keeps its distance and shoots |
| Large red octagon | Boss. Fires rings of bullets |

Enemies are solid. They block you, push each other apart and knock you back on contact.

## Upgrades

Upgrades come in four rarities: Common, Rare, Epic and Legendary. Higher rarities give bigger bonuses and cost more, and Luck and wave number make them more likely.

Stats you can raise: damage, fire rate, bolts, range, bolt speed, pierce, crit chance, crit damage, max HP, regen, armor, dodge, speed, pickup range, leech, thorns, knockback, blast radius, coin bonus, XP bonus and luck.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page structure. Must stay lowercase so GitHub Pages opens it by default. |
| `Style.css` | Menus, shop cards and overlays |
| `Game.js` | All game logic and drawing |
| `Readme.md` | This file |

## Deploy on GitHub Pages

1. Create a repository and upload all files to the root.
2. Open Settings, then Pages.
3. Under Build and deployment, choose Deploy from a branch, select `main` and `/ (root)`, then save.
4. After a minute or two the game is live at `https://YOUR-USERNAME.github.io/REPO-NAME/`.

## Make the QR code

1. Copy your live Pages link.
2. Paste it into any QR code generator.
3. Download the image and print or share it. Scanning it opens the game directly.

Test the link on a phone before printing.

## Tuning

Most balance values are near the top of `Game.js`.

- Wave length: `WaveLength()`
- Enemy stats: `EnemyTypes`
- Upgrades and their values: `Items`
- Stat limits: `StatCaps`
- Rarity strength and price: `TierMult` and `CostMult`
- Starting stats: inside `NewRun()`

## Notes

- The game needs an internet connection only to load the Chakra Petch font. It falls back to the device font if that fails.
- Best wave is stored with `localStorage`. If the browser blocks storage, the game still works but will not remember your score.
