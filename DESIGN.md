# fondant — design brief

Reference: the WebLove short "POV: you mastered 3D websites (the flavour trick)"
(https://youtu.be/quA_sJ6PdJo). The video shows a lip-tint site where the whole
page recolours as each flavour scrolls into view, with ingredient cut-outs
drifting at different speeds for depth. This site is an original brand built
with the same technique, not a copy of the one in the video.

## Subject, audience, job

- Subject: **fondant**, a small-batch lip balm that tastes like dessert.
  Three flavours: noisette (hazelnut + cocoa), abricot (apricot + honey),
  cassis (blackcurrant).
- Audience: people who buy beauty on feel and flavour, mostly on a phone.
- The page's single job: get the visitor to add one flavour, or the trio,
  to the bag.

## Tokens

Palettes (one per scene; the root `data-flavour` attribute picks one):

| scene    | bg      | ink     | accent  | card    |
|----------|---------|---------|---------|---------|
| cream    | #F5EFE6 | #2B1B14 | #A86B3C | #FBF7F1 |
| noisette | #EADFCF | #4A2C1A | #A86B3C | #F7EFE4 |
| abricot  | #F8DFC2 | #8C3D1C | #EB8E4A | #FDF0E2 |
| cassis   | #E6D6E4 | #3E1A3A | #8C3D7E | #F6ECF4 |
| cocoa    | #2B1B14 | #F3E6D8 | #D9A86C | #3A2820 |

Type:

- Display: **Fraunces** (variable: opsz, wght, SOFT, WONK). The wordmark is
  weight 900 at SOFT 100, so it reads chubby and melty, like the name.
- Body and UI: **Instrument Sans**.
- Receipt: the system monospace stack. No extra download for one element.

Layout:

```
nav      fondant ........ Flavours · The trio ........ [Bag 0]

hero     eyebrow / tagline / sub          (three tubes float, tilted,
         f o n d a n t  (giant, bleeds)    following the pointer)

noisette [card]                 tint note      name: 900 SOFT, lowercase, left
abricot        tint note  [card]               name: italic WONK, right
cassis              [card]      tint note      name: 700 uppercase, centred

trio     Take all three.      [bag with tubes peeking] [receipt]
footer
```

Each flavour section is 170vh tall with a sticky 100vh scene inside it, so
the composition holds still while the ingredients drift through it and the
palette melts into the next flavour.

## Signature

The melt. Colour, type and ingredients all change together as you scroll:
the page background and ink cross-fade over 600 ms, and each flavour name is
set in a different voice of the same typeface (chubby, wonky italic, hard
uppercase) so the typography changes personality along with the colour.

## Self-critique against the generic default

- Cream + serif + terracotta is the current AI default. The reference pins
  cream and warm palettes, so they stay, but the third flavour deliberately
  leaves the warm range (lilac + plum), and the finale goes to dark cocoa.
- No "01 / 02 / 03" numbering: the flavours are not a sequence. The eyebrow
  above each note states the tint colour instead, which is real information.
- Motion is spent in two places only: the hang-tag on load and the scroll
  melt. Hover effects are small and functional.
- Copy says what things do: "Add to bag", "Add the trio", "Checkout isn't
  connected in this demo". No slogans.

## Technique, as in the video

1. Each flavour section has an id: `noisette`, `abricot`, `cassis`.
2. One palette per flavour on `:root[data-flavour="…"]`.
3. `IntersectionObserver` with `rootMargin: "-50% 0px -50% 0px"`.
4. On intersect, set `document.documentElement.dataset.flavour`.
5. `body { transition: background-color 600ms, color 600ms }`.
6. Seven ingredient layers per flavour, speeds 0.2 to 0.6 of the scroll.
7. Small layers slow and blurred, big layers fast and sharp.
8. Buttons use `--ink` and `--bg`, so they always match the flavour on screen.

Ingredients are inline SVG symbols rather than PNG cut-outs, so the site has
no image assets to host. Swapping a layer to a PNG is a one-line change in
`main.js` (see README).
