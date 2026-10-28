# fondant — a "flavour trick" product site

A one-page product site where the whole page changes colour as you scroll
into each flavour, and ingredient cut-outs drift at different speeds for depth.
No framework, no build step, no WebGL: one HTML file, one stylesheet, one script.

Built after the WebLove short "POV: you mastered 3D websites (the flavour
trick)" (https://youtu.be/quA_sJ6PdJo). The brand, copy and artwork here are
original; the technique is the one the video describes. `DESIGN.md` has the
brief and the token system.

## Run it

Any static server works. From this folder:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open http://127.0.0.1:4173/. Opening `index.html` straight from disk also
works, except the web fonts need a network connection either way.

## Files

| file         | what it holds                                                         |
|--------------|-----------------------------------------------------------------------|
| `index.html` | markup, plus an SVG sprite with the tube and all 21 ingredient shapes |
| `styles.css` | the five palettes, type, layout, motion                               |
| `main.js`    | layer config, the observer that swaps the palette, parallax, bag      |
| `DESIGN.md`  | design brief, tokens, self-critique                                   |

## Make it yours

**Palettes.** Each scene is five variables on the root, keyed by
`data-flavour`:

```css
:root[data-flavour="abricot"] { --bg: #F8DFC2; --ink: #8C3D1C; --accent: #EB8E4A; --card: #FDF0E2; --line: …; }
```

Change the hex values and everything on screen follows, including buttons,
the nav pill and the toast, because they all use `--ink` and `--bg`.

**Flavours.** A flavour is a `<section class="flavour" id="…" data-flavour="…">`
in `index.html`, a palette in `styles.css`, a tube colour set (`.tube--…`), a
swatch colour (`.swatch--…`), and an entry in `FLAVOURS` in `main.js`.

**Ingredients.** `FLAVOURS[id].layers` in `main.js` lists each cut-out with its
position (`x`, `y` in % of the scene), `size` in px, `speed` (0.2 slow and far,
0.6 fast and near), rotation and blur. Layers with speed ≥ 0.5 render in front
of the big flavour name; slower ones sit behind it. To use a photo cut-out
instead of a drawn shape, replace `sym: 'i-hazelnut'` with
`src: 'ingredients/hazelnut.png'`.

**Type.** The flavour names are all Fraunces, with different axis settings per
flavour (`.flavour--noisette .flavour__name` and friends in `styles.css`).

## What is and isn't wired up

- Add to bag, the bag counter, the receipt and the trio discount all work in
  memory for the current page load.
- Checkout is a button that says so. There is no backend.
- The hang-tag loader shows once per browser session, is skippable with a
  click, and is skipped entirely under `prefers-reduced-motion`, as is the
  parallax.
