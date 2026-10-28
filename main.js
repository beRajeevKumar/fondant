/* fondant — the flavour trick
   1. Each flavour section has an id and a data-flavour.
   2. The palettes live in styles.css as :root[data-flavour="…"] variables.
   3. An IntersectionObserver with rootMargin -50% fires as a section crosses
      the middle of the screen and sets document.documentElement.dataset.flavour.
   4. body transitions background-color and color, so the page melts.
   5. Ingredient layers move at 0.2–0.6× the scroll; small ones blur and lag.
*/
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------------------------------------------------------
  // Content
  // ---------------------------------------------------------------
  const PRICE = 18;
  const TRIO_DISCOUNT = 0.15;

  // Layers: x/y in % of the scene, size in px, speed as a fraction of the
  // scroll, blur in px. Speed ≥ 0.5 sits in front of the big name; slower
  // layers sit behind it. To use a PNG instead of a symbol, give a layer
  // `src: 'ingredients/hazelnut.png'` instead of `sym`.
  const FLAVOURS = {
    noisette: {
      name: 'Noisette',
      layers: [
        { sym: 'i-hazelnut',      x: 5,  y: 12, size: 170, speed: .58, rot: -18 },
        { sym: 'i-shard',         x: 74, y: 4,  size: 220, speed: .62, rot: 12 },
        { sym: 'i-hazelnut-half', x: 84, y: 56, size: 130, speed: .50, rot: -8 },
        { sym: 'i-curl',          x: 13, y: 60, size: 120, speed: .42, rot: 48, blur: .5 },
        { sym: 'i-cocoa-bean',    x: 38, y: 3,  size: 90,  speed: .32, rot: -32, blur: 1.2 },
        { sym: 'i-hazelnut',      x: 60, y: 72, size: 80,  speed: .28, rot: 30, blur: 1.6 },
        { sym: 'i-amber-drop',    x: 52, y: 28, size: 60,  speed: .22, rot: 8, blur: 2.2 },
        { sym: 'i-crumbs',        x: 28, y: 84, size: 70,  speed: .20, rot: 0, blur: 2.4 },
      ],
    },
    abricot: {
      name: 'Abricot',
      layers: [
        { sym: 'i-apricot',       x: 3,  y: 8,  size: 200, speed: .60, rot: -10 },
        { sym: 'i-apricot-slice', x: 60, y: 60, size: 150, speed: .55, rot: 20 },
        { sym: 'i-apricot-half',  x: 30, y: 46, size: 140, speed: .50, rot: -14 },
        { sym: 'i-leaf',          x: 80, y: 32, size: 110, speed: .42, rot: -30, blur: .5 },
        { sym: 'i-blossom',       x: 48, y: 4,  size: 80,  speed: .30, rot: 15, blur: 1.2 },
        { sym: 'i-almond',        x: 16, y: 76, size: 70,  speed: .28, rot: 40, blur: 1.6 },
        { sym: 'i-amber-drop',    x: 70, y: 12, size: 60,  speed: .22, rot: -6, blur: 2.2 },
        { sym: 'i-blossom',       x: 90, y: 78, size: 50,  speed: .20, rot: 0, blur: 2.5 },
      ],
    },
    cassis: {
      name: 'Cassis',
      layers: [
        { sym: 'i-currant-cluster', x: 5,  y: 6,  size: 210, speed: .60, rot: -12 },
        { sym: 'i-currant',         x: 78, y: 10, size: 150, speed: .56, rot: 10 },
        { sym: 'i-currant-half',    x: 11, y: 58, size: 120, speed: .50, rot: -20 },
        { sym: 'i-currant-leaf',    x: 84, y: 54, size: 130, speed: .44, rot: 35, blur: .5 },
        { sym: 'i-splash',          x: 40, y: 6,  size: 110, speed: .34, rot: 0, blur: 1 },
        { sym: 'i-currant',         x: 62, y: 76, size: 70,  speed: .28, rot: 0, blur: 1.6 },
        { sym: 'i-juice',           x: 30, y: 28, size: 56,  speed: .22, rot: 14, blur: 2.2 },
        { sym: 'i-currant',         x: 50, y: 86, size: 46,  speed: .20, rot: 0, blur: 2.6 },
      ],
    },
  };
  const FLAVOUR_IDS = Object.keys(FLAVOURS);

  // ---------------------------------------------------------------
  // Build the ingredient layers
  // ---------------------------------------------------------------
  for (const host of document.querySelectorAll('[data-layers]')) {
    const spec = (FLAVOURS[host.dataset.layers] || {}).layers || [];
    const frag = document.createDocumentFragment();
    for (const l of spec) {
      const el = document.createElement('div');
      el.className = 'layer';
      el.style.setProperty('--x', l.x + '%');
      el.style.setProperty('--y', l.y + '%');
      el.style.setProperty('--size', l.size + 'px');
      el.style.setProperty('--blur', (l.blur || 0) + 'px');
      el.style.setProperty('--z', l.speed >= .5 ? 3 : 1);
      el.dataset.speed = l.speed;
      el.dataset.rot = l.rot || 0;
      el.dataset.sx = l.sx || 0;
      el.innerHTML = l.src
        ? `<img src="${l.src}" alt="" draggable="false">`
        : `<svg aria-hidden="true"><use href="#${l.sym}"/></svg>`;
      frag.appendChild(el);
    }
    host.appendChild(frag);
  }

  // ---------------------------------------------------------------
  // Loader: the hang-tag swings once per session, then the page lifts in
  // ---------------------------------------------------------------
  const loader = document.getElementById('loader');
  const ready = () => {
    root.classList.add('is-ready');
    if (loader) loader.classList.add('is-done');
  };
  let seenTag = false;
  try {
    seenTag = sessionStorage.getItem('fondant-tag') === '1';
    sessionStorage.setItem('fondant-tag', '1');
  } catch (_) { /* storage blocked: show the tag every time */ }

  if (reduceMotion || seenTag) {
    if (loader) loader.remove();
    root.classList.add('is-ready');
  } else if (loader) {
    const timer = setTimeout(ready, 2400);
    loader.addEventListener('click', () => { clearTimeout(timer); ready(); });
  }

  // ---------------------------------------------------------------
  // The melt
  // ---------------------------------------------------------------
  const swatches = [...document.querySelectorAll('.swatch')];
  function setFlavour(id) {
    if (root.dataset.flavour === id) return;
    root.dataset.flavour = id;
    for (const s of swatches) s.classList.toggle('is-current', s.classList.contains('swatch--' + id));
  }
  const melt = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) setFlavour(e.target.dataset.flavour);
  }, { rootMargin: '-50% 0px -50% 0px', threshold: 0 });
  for (const s of document.querySelectorAll('[data-flavour]')) melt.observe(s);

  // ---------------------------------------------------------------
  // Parallax: ingredients drift at their own speed, the big name drifts
  // slowly, the hero wordmark sinks and the tubes lift as you scroll
  // ---------------------------------------------------------------
  const scenes = [...document.querySelectorAll('[data-parallax]')].map((section) => {
    const name = section.querySelector('.flavour__name');
    return {
      section,
      name,
      nameSpeed: name ? +(name.dataset.speed || 0) : 0,
      layers: [...section.querySelectorAll('.layer')].map((el) => ({
        el, speed: +el.dataset.speed, sx: +el.dataset.sx, rot: +el.dataset.rot,
      })),
    };
  });
  const hero = {
    el: document.querySelector('.hero'),
    word: document.querySelector('.hero__wordmark'),
    stage: document.getElementById('hero-stage'),
  };

  let ticking = false;
  function update() {
    ticking = false;
    const vh = window.innerHeight;
    for (const s of scenes) {
      const r = s.section.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      // 0 when the section's centre sits in the middle of the viewport,
      // positive while it is still below, negative once it has passed.
      const p = r.top + r.height / 2 - vh / 2;
      for (const l of s.layers) {
        l.el.style.transform = `translate3d(${(p * l.sx).toFixed(1)}px, ${(p * l.speed).toFixed(1)}px, 0) rotate(${l.rot}deg)`;
      }
      if (s.name) {
        s.name.style.transform = `translate3d(${(p * s.nameSpeed * .35).toFixed(1)}px, ${(p * s.nameSpeed).toFixed(1)}px, 0)`;
      }
    }
    const y = window.scrollY;
    if (hero.word && y < vh * 1.3) {
      hero.word.style.transform = `translate3d(0, ${(y * .28).toFixed(1)}px, 0)`;
      hero.stage.style.setProperty('--sy', (y * -.12).toFixed(1) + 'px');
    }
  }
  function requestUpdate() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  if (!reduceMotion) {
    addEventListener('scroll', requestUpdate, { passive: true });
    addEventListener('resize', requestUpdate);
    update();
  } else {
    // Keep the rotation, drop the drift.
    for (const s of scenes) for (const l of s.layers) l.el.style.transform = `rotate(${l.rot}deg)`;
  }

  // Hero tubes lean toward the pointer
  if (!reduceMotion && hero.el && hero.stage && matchMedia('(hover: hover)').matches) {
    const tubes = [...hero.stage.children];
    hero.el.addEventListener('pointermove', (e) => {
      const mx = e.clientX / innerWidth - .5;
      const my = e.clientY / innerHeight - .5;
      for (const t of tubes) {
        const d = +t.dataset.depth || 1;
        t.style.setProperty('--mx', (mx * -34 * d).toFixed(1) + 'px');
        t.style.setProperty('--my', (my * -22 * d).toFixed(1) + 'px');
      }
    });
    hero.el.addEventListener('pointerleave', () => {
      for (const t of tubes) { t.style.setProperty('--mx', '0px'); t.style.setProperty('--my', '0px'); }
    });
  }

  // ---------------------------------------------------------------
  // Bag + receipt
  // ---------------------------------------------------------------
  const bag = [];
  const countEl = document.getElementById('bag-count');
  const pill = document.getElementById('bag-pill');
  const linesEl = document.getElementById('receipt-lines');
  const emptyEl = document.getElementById('receipt-empty');
  const totalsEl = document.getElementById('receipt-totals');
  const toastEl = document.getElementById('toast');
  const fmt = (n) => '€' + n.toFixed(2);

  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2200);
  }

  function render() {
    countEl.textContent = bag.length;
    pill.classList.remove('is-bumping');
    void pill.offsetWidth; // restart the bump animation
    pill.classList.add('is-bumping');

    const qty = {};
    for (const id of bag) qty[id] = (qty[id] || 0) + 1;

    linesEl.innerHTML = FLAVOUR_IDS.filter((id) => qty[id]).map((id) =>
      `<li><span>${FLAVOURS[id].name} × ${qty[id]}</span><span>${fmt(PRICE * qty[id])}</span></li>`
    ).join('');
    emptyEl.hidden = bag.length > 0;

    if (!bag.length) { totalsEl.innerHTML = ''; return; }
    const subtotal = bag.length * PRICE;
    const sets = Math.min(...FLAVOUR_IDS.map((id) => qty[id] || 0));
    const discount = sets * FLAVOUR_IDS.length * PRICE * TRIO_DISCOUNT;
    totalsEl.innerHTML =
      `<div><span>Subtotal</span><span>${fmt(subtotal)}</span></div>` +
      (discount ? `<div><span>Trio −15%</span><span>−${fmt(discount)}</span></div>` : '') +
      `<div class="is-total"><span>Total</span><span>${fmt(subtotal - discount)}</span></div>`;
  }

  for (const b of document.querySelectorAll('[data-add]')) {
    b.addEventListener('click', () => {
      bag.push(b.dataset.add);
      render();
      toast(`${FLAVOURS[b.dataset.add].name} is in your bag`);
    });
  }
  const trioBtn = document.getElementById('add-trio');
  if (trioBtn) trioBtn.addEventListener('click', () => {
    bag.push(...FLAVOUR_IDS);
    render();
    toast('The trio is in your bag');
  });
  const checkout = document.getElementById('checkout');
  if (checkout) checkout.addEventListener('click', () => {
    toast(bag.length ? 'Checkout isn’t connected in this demo' : 'Your bag is empty');
  });

  countEl.textContent = '0';
})();
