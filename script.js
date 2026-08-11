/* ============================================================
   Portfolio | interactions

   Nothing here knows about a specific project. Behaviour that
   differs per project comes from the registry in projects.js:
   the `art`, `anim`, `size` and `study` keys pick which
   generator and which hover system a card gets.

   1.  Helpers
   2.  Theme system
   3.  Boot sequence
   4.  Kinetic role line
   5.  Nav, progress, active section
   6.  Reveals and section seams
   7.  Artwork generators
   8.  Hover systems
   9.  Card rendering and filtering
   10. Pointer: cursor ring and magnetic cards
   11. Case study dialog
   12. Console and easter eggs
   13. Hero canvas
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. Helpers ---------- */
  const root = document.documentElement;
  const $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  const $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };

  const esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  /* A tiny seeded PRNG. Artwork should look organic but never
     change between reloads, so Math.random is not an option. */
  function seeded(seed) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) % 233280;
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  const toast = (function () {
    const el = $('#toast');
    let timer = null;
    return function (msg) {
      if (!el) return;
      el.textContent = msg;
      el.classList.add('is-on');
      clearTimeout(timer);
      timer = setTimeout(function () { el.classList.remove('is-on'); }, 2600);
    };
  })();

  /* ---------- 2. Theme system ---------- */
  const THEMES = ['system', 'terminal', 'neural'];
  const THEME_NOTE = {
    system: 'SYSTEM online. Clean signal.',
    terminal: 'TERMINAL. Amber phosphor, no Matrix.',
    neural: 'NEURAL. Weights warm, activations lit.'
  };

  const themeBox = $('#themes');
  const themeOpts = $$('.themes__opt', themeBox);
  const themeThumb = $('#themesThumb');

  function paintTheme(name, announce) {
    root.setAttribute('data-theme', name);
    const meta = $('meta[name="theme-color"]');
    themeOpts.forEach(function (btn, i) {
      const on = btn.dataset.themeValue === name;
      btn.setAttribute('aria-checked', String(on));
      btn.tabIndex = on ? 0 : -1;
      if (on && themeThumb) themeThumb.style.setProperty('--tx', (i * 36) + 'px');
    });
    // Keep the browser chrome in step with the palette.
    if (meta) {
      meta.setAttribute('content',
        getComputedStyle(root).getPropertyValue('--bg').trim() || '#08090e');
    }
    if (announce) toast(THEME_NOTE[name]);
  }

  function setTheme(name, announce) {
    if (THEMES.indexOf(name) === -1) return;
    paintTheme(name, announce);
    store.set('theme', name);
  }

  themeOpts.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setTheme(btn.dataset.themeValue, true);
    });
  });

  // Arrow keys move through the radiogroup, as a radiogroup should.
  if (themeBox) {
    themeBox.addEventListener('keydown', function (e) {
      const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      const at = THEMES.indexOf(root.getAttribute('data-theme'));
      const next = (at + dir + THEMES.length) % THEMES.length;
      setTheme(THEMES[next], true);
      themeOpts[next].focus();
    });
  }

  paintTheme(THEMES.indexOf(store.get('theme')) > -1 ? store.get('theme') : 'system', false);

  /* ---------- 3. Boot sequence ---------- */
  /* One beat, roughly 1.4s, once per session. Reduced motion skips it,
     and so does any repeat visit within the same tab. */
  (function boot() {
    const box = $('#boot');
    if (!box) return;

    const seen = (function () {
      try { return sessionStorage.getItem('booted') === '1'; } catch (e) { return false; }
    })();

    function finish() {
      box.classList.add('is-done');
      setTimeout(function () { box.remove(); }, 600);
      try { sessionStorage.setItem('booted', '1'); } catch (e) { /* ignore */ }
    }

    if (seen || reduceMotion) { box.remove(); return; }

    const lines = $$('li', $('#bootLines'));
    const bar = $('#bootBar');
    const ready = $('#bootReady');
    const step = 300;

    lines.forEach(function (li, i) {
      setTimeout(function () { li.classList.add('is-on'); }, i * step);
      setTimeout(function () { li.classList.add('is-ok'); }, i * step + 220);
      setTimeout(function () {
        if (bar) bar.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
      }, i * step + 120);
    });

    setTimeout(function () { if (ready) ready.classList.add('is-on'); }, lines.length * step + 60);
    setTimeout(finish, lines.length * step + 480);

    // Never trap anyone. Any key or click ends it early.
    ['keydown', 'pointerdown'].forEach(function (ev) {
      box.addEventListener(ev, finish, { once: true });
      document.addEventListener(ev, finish, { once: true });
    });
  })();

  /* ---------- 4. Kinetic role line ---------- */
  (function roles() {
    const slot = $('#roleSlot');
    if (!slot) return;

    const words = ['ENGINEER', 'BUILDER', 'ML DEVELOPER', 'PROBLEM SOLVER'];
    let at = 0;
    let current = null;

    function show(word) {
      const el = document.createElement('span');
      el.className = 'hero__role-word';
      el.setAttribute('aria-hidden', 'true');
      el.textContent = word;
      slot.appendChild(el);
      // Next frame, so the entry transition actually runs.
      requestAnimationFrame(function () { el.classList.add('is-in'); });
      if (current) {
        const old = current;
        old.classList.remove('is-in');
        old.classList.add('is-out');
        setTimeout(function () { old.remove(); }, 700);
      }
      current = el;
    }

    show(words[0]);

    if (reduceMotion) return;
    setInterval(function () {
      at = (at + 1) % words.length;
      show(words[at]);
    }, 2400);
  })();

  /* ---------- 5. Nav, progress, active section ---------- */
  const nav = $('#nav');
  const navProgress = $('#navProgress');

  const onScroll = function () {
    const y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 20);
    if (navProgress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      navProgress.style.setProperty('--p', max > 0 ? Math.min(y / max, 1).toFixed(4) : 0);
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  (function mobileNav() {
    const burger = $('#burger');
    const links = $('#navLinks');
    if (!burger || !links) return;

    function close() {
      links.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    }

    burger.addEventListener('click', function () {
      const open = links.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  })();

  (function activeSection() {
    const ids = ['work', 'writing', 'skills', 'about', 'contact'];
    const anchors = $$('.nav__links a');
    if (!('IntersectionObserver' in window)) return;

    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        anchors.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { threshold: 0.3, rootMargin: '-72px 0px -45% 0px' });

    ids.map(function (id) { return document.getElementById(id); })
      .filter(Boolean)
      .forEach(function (s) { spy.observe(s); });
  })();

  /* ---------- 6. Reveals and section seams ---------- */
  function observeReveals(scope) {
    const items = $$('.reveal:not(.is-in)', scope || document);
    const seams = $$('.section__seam:not(.is-in)', scope || document);

    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      seams.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        setTimeout(function () { el.classList.add('is-in'); }, i * 70);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    items.concat(seams).forEach(function (el) { io.observe(el); });
  }

  /* ---------- 7. Artwork generators ---------- */
  /* Each project gets a visual signature drawn from its own subject
     matter: a network for the framework, a bitboard for the engine,
     a spectrogram for the audio classifier. These are the fallback,
     so a card is never an empty rectangle or a broken image icon.
     Set `image` on a registry entry to layer a real screenshot on top. */

  const ART = {
    network: function (p) {
      const rnd = seeded(p.id);
      const layers = [4, 6, 6, 3];
      const pts = [];
      layers.forEach(function (n, li) {
        const x = 66 + li * 90;
        const col = [];
        for (let i = 0; i < n; i++) {
          col.push({ x: x, y: 100 + (i - (n - 1) / 2) * (150 / Math.max(n, 5)) });
        }
        pts.push(col);
      });

      let wires = '';
      for (let li = 0; li < pts.length - 1; li++) {
        pts[li].forEach(function (a) {
          pts[li + 1].forEach(function (b) {
            const o = (0.06 + rnd() * 0.2).toFixed(3);
            wires += '<line x1="' + a.x + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x +
              '" y2="' + b.y.toFixed(1) + '" stroke="var(--accent)" stroke-width="0.7" opacity="' + o + '"/>';
          });
        });
      }

      let dots = '';
      pts.forEach(function (col, li) {
        col.forEach(function (a) {
          const r = li === 0 || li === pts.length - 1 ? 4.6 : 3.8;
          dots += '<circle cx="' + a.x + '" cy="' + a.y.toFixed(1) + '" r="' + r +
            '" fill="var(--accent)" opacity="' + (0.4 + rnd() * 0.5).toFixed(2) + '"/>';
        });
      });

      // A 3x3 kernel at the input edge, since this one is convolutional.
      let kernel = '';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          kernel += '<rect x="' + (14 + c * 12) + '" y="' + (76 + r * 12) +
            '" width="10" height="10" rx="1.5" fill="var(--accent-2)" opacity="' +
            (0.15 + rnd() * 0.55).toFixed(2) + '"/>';
        }
      }

      return wires + kernel + dots;
    },

    board: function (p) {
      const rnd = seeded(p.id);
      const s = 22, x0 = 112, y0 = 12;
      let sq = '';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const dark = (r + c) % 2 === 1;
          sq += '<rect x="' + (x0 + c * s) + '" y="' + (y0 + r * s) + '" width="' + s +
            '" height="' + s + '" fill="' + (dark ? 'var(--accent)' : 'var(--accent-2)') +
            '" opacity="' + (dark ? 0.16 : 0.05) + '"/>';
        }
      }
      // A scattered occupancy mask, which is what a bitboard really is.
      let bits = '';
      for (let i = 0; i < 64; i++) {
        if (rnd() > 0.72) {
          const c = i % 8, r = Math.floor(i / 8);
          bits += '<circle cx="' + (x0 + c * s + s / 2) + '" cy="' + (y0 + r * s + s / 2) +
            '" r="5" fill="var(--accent-3)" opacity="' + (0.35 + rnd() * 0.5).toFixed(2) + '"/>';
        }
      }
      // The same board as the 64-bit integer it is stored in.
      let word = '';
      for (let i = 0; i < 16; i++) {
        word += '<rect x="18" y="' + (16 + i * 11) + '" width="' + (rnd() > 0.5 ? 62 : 30) +
          '" height="6" rx="1" fill="var(--accent)" opacity="' + (0.12 + rnd() * 0.3).toFixed(2) + '"/>';
      }
      return sq + bits + word;
    },

    waveform: function (p) {
      const rnd = seeded(p.id);
      let bars = '';
      for (let i = 0; i < 34; i++) {
        const h = 12 + Math.abs(Math.sin(i * 0.7) * 52) * (0.5 + rnd() * 0.6);
        bars += '<rect x="' + (16 + i * 5.4) + '" y="' + (100 - h / 2) + '" width="3" height="' +
          h.toFixed(1) + '" rx="1.5" fill="var(--accent-2)" opacity="' + (0.4 + rnd() * 0.5).toFixed(2) + '"/>';
      }
      // The waveform resolves into lines of a document on the right.
      let doc = '';
      for (let i = 0; i < 7; i++) {
        doc += '<rect x="222" y="' + (46 + i * 15) + '" width="' + (60 + rnd() * 100).toFixed(0) +
          '" height="5" rx="2.5" fill="var(--accent)" opacity="' + (0.2 + rnd() * 0.35).toFixed(2) + '"/>';
      }
      const arrow = '<path d="M196 100h16m-5-5 5 5-5 5" stroke="var(--accent-3)" ' +
        'stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>';
      return bars + arrow + doc;
    },

    spectrogram: function (p) {
      const rnd = seeded(p.id);
      let cols = '';
      for (let c = 0; c < 48; c++) {
        for (let r = 0; r < 12; r++) {
          const energy = Math.max(0, Math.sin(c * 0.28 + r * 0.5) * 0.6 + rnd() * 0.6 - r * 0.03);
          if (energy < 0.12) continue;
          cols += '<rect x="' + (10 + c * 8.1) + '" y="' + (176 - r * 14) +
            '" width="7" height="13" fill="var(--accent)" opacity="' +
            Math.min(energy, 0.85).toFixed(2) + '"/>';
        }
      }
      const box = '<rect x="128" y="52" width="118" height="92" rx="3" fill="none" ' +
        'stroke="var(--accent-2)" stroke-width="1.6" opacity=".85"/>' +
        '<rect x="128" y="38" width="66" height="14" rx="2" fill="var(--accent-2)" opacity=".85"/>';
      return cols + box;
    },

    attention: function (p) {
      const rnd = seeded(p.id);
      const n = 12, s = 14, x0 = 116, y0 = 16;
      let cells = '';
      for (let r = 0; r < n; r++) {
        for (let c = 0; c <= r; c++) {
          // Causal mask: a token only attends to itself and what came before.
          const w = (c === r ? 0.85 : 0.1 + rnd() * 0.55 * (1 - (r - c) / n));
          cells += '<rect x="' + (x0 + c * s) + '" y="' + (y0 + r * s) + '" width="' + (s - 1.5) +
            '" height="' + (s - 1.5) + '" rx="1.5" fill="var(--accent)" opacity="' + w.toFixed(2) + '"/>';
        }
      }
      let toks = '';
      for (let i = 0; i < 6; i++) {
        toks += '<rect x="18" y="' + (30 + i * 24) + '" width="' + (24 + rnd() * 46).toFixed(0) +
          '" height="12" rx="3" fill="var(--accent-2)" opacity="' + (0.2 + rnd() * 0.4).toFixed(2) + '"/>';
      }
      return toks + cells;
    },

    tree: function (p) {
      const rnd = seeded(p.id);
      // Root: the 3x3 board Hexapawn is played on.
      let boardArt = '';
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          boardArt += '<rect x="' + (16 + c * 18) + '" y="' + (73 + r * 18) +
            '" width="17" height="17" fill="var(--accent)" opacity="' +
            ((r + c) % 2 ? 0.2 : 0.07) + '"/>';
        }
      }
      boardArt += '<circle cx="24.5" cy="81.5" r="4" fill="var(--accent-3)" opacity=".8"/>' +
        '<circle cx="60.5" cy="117.5" r="4" fill="var(--accent-2)" opacity=".8"/>';

      // Branches: three plies of search fanning right.
      let edges = '', nodes = '';
      const plies = [[100, [100]], [180, [46, 100, 154]], [262, [22, 62, 84, 118, 140, 178]],
        [344, [14, 40, 66, 92, 118, 144, 170, 190]]];
      for (let i = 0; i < plies.length - 1; i++) {
        const ax = plies[i][0], bx = plies[i + 1][0];
        plies[i][1].forEach(function (ay, ai) {
          plies[i + 1][1].forEach(function (by, bi) {
            if (Math.abs(bi / plies[i + 1][1].length - ai / plies[i][1].length) > 0.34) return;
            edges += '<line x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by +
              '" stroke="var(--accent)" stroke-width="0.8" opacity="' + (0.15 + rnd() * 0.3).toFixed(2) + '"/>';
          });
        });
      }
      plies.forEach(function (pl, i) {
        pl[1].forEach(function (y) {
          nodes += '<circle cx="' + pl[0] + '" cy="' + y + '" r="' + (i === 0 ? 5 : 3.4) +
            '" fill="var(--accent-2)" opacity="' + (0.35 + rnd() * 0.55).toFixed(2) + '"/>';
        });
      });
      return boardArt + edges + nodes;
    },

    chart: function (p) {
      const rnd = seeded(p.id);
      let candles = '', pts = [];
      let v = 120;
      for (let i = 0; i < 30; i++) {
        const prev = v;
        v = Math.max(40, Math.min(160, v + (rnd() - 0.46) * 22));
        const x = 18 + i * 12.6;
        const up = v < prev;
        const top = Math.min(v, prev), bot = Math.max(v, prev);
        candles += '<rect x="' + (x - 3) + '" y="' + top.toFixed(1) + '" width="6" height="' +
          Math.max(bot - top, 2).toFixed(1) + '" rx="1" fill="' +
          (up ? 'var(--accent-2)' : 'var(--accent-3)') + '" opacity="' + (0.3 + rnd() * 0.35).toFixed(2) + '"/>';
        pts.push(x + ',' + v.toFixed(1));
      }
      const line = '<polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--accent)" ' +
        'stroke-width="1.8" stroke-linejoin="round" opacity=".9"/>';
      // The forward step the model is actually asked about.
      const ahead = '<line x1="396" y1="20" x2="396" y2="180" stroke="var(--accent-3)" ' +
        'stroke-width="1.2" stroke-dasharray="4 4" opacity=".7"/>' +
        '<circle cx="396" cy="' + v.toFixed(1) + '" r="4.5" fill="none" stroke="var(--accent-3)" stroke-width="1.6"/>';
      return candles + line + ahead;
    }
  };

  function artFor(p) {
    const make = ART[p.art] || ART.network;
    return '<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" ' +
      'role="img" aria-label="' + esc(p.alt) + '">' + make(p) + '</svg>';
  }

  /* ---------- 8. Hover systems ---------- */
  /* One per subject, chosen by the registry's `anim` key. A chess card
     wakes its board, an audio card moves its waveform, the transformer
     lights its attention matrix. No card just scales up. */

  const FX = {
    neural: function (p) {
      const rnd = seeded(p.id + 'fx');
      const layers = [3, 5, 5, 2];
      let html = '<div class="fx-net">';
      let wires = '';
      layers.forEach(function (n, li) {
        html += '<span class="fx-net__layer">';
        for (let i = 0; i < n; i++) {
          html += '<i style="--d:' + (li * 130 + i * 40) + 'ms"></i>';
        }
        html += '</span>';
      });
      // Wires sit behind the nodes and never animate, to keep the frame cheap.
      for (let li = 0; li < layers.length - 1; li++) {
        for (let a = 0; a < layers[li]; a++) {
          for (let b = 0; b < layers[li + 1]; b++) {
            if (rnd() > 0.62) continue;
            const x1 = 16 + li * 22.6, x2 = 16 + (li + 1) * 22.6;
            const y1 = 50 + (a - (layers[li] - 1) / 2) * (56 / Math.max(layers[li], 4));
            const y2 = 50 + (b - (layers[li + 1] - 1) / 2) * (56 / Math.max(layers[li + 1], 4));
            wires += '<line x1="' + x1 + '" y1="' + y1.toFixed(1) + '" x2="' + x2 +
              '" y2="' + y2.toFixed(1) + '"/>';
          }
        }
      }
      html += '<svg class="fx-net__wires" viewBox="0 0 100 100" preserveAspectRatio="none" ' +
        'aria-hidden="true"><g stroke="var(--accent)" stroke-width=".4" opacity=".3">' +
        wires + '</g></svg>';
      return html + '</div>';
    },

    chess: function (p) {
      // A real knight tour opening, so the highlighted squares are legal moves.
      const path = [[7, 3], [5, 4], [3, 3], [4, 1], [2, 2], [0, 3]];
      const key = {};
      path.forEach(function (sq, i) { key[sq[0] + ':' + sq[1]] = i; });

      let html = '<div class="fx-chess">';
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const hit = key[r + ':' + c];
          const diag = (r + c) * 26;
          if (hit !== undefined) {
            html += '<i class="is-path" style="--d:' + (300 + hit * 110) + 'ms"></i>';
          } else {
            html += '<i style="--d:' + diag + 'ms;--o:' +
              ((r + c) % 2 ? 0.16 : 0.05).toFixed(2) + '"></i>';
          }
        }
      }
      return html + '</div>';
    },

    audio: function (p) {
      const rnd = seeded(p.id + 'fx');
      let html = '<div class="fx-wave">';
      for (let i = 0; i < 26; i++) {
        const h = 14 + Math.abs(Math.sin(i * 0.62)) * 52 * (0.5 + rnd() * 0.6);
        html += '<i style="--h:' + h.toFixed(0) + '%;--d:' + (i * 26) + 'ms"></i>';
      }
      return html + '<span class="fx-wave__line"></span></div>';
    },

    spectrogram: function (p) {
      const rnd = seeded(p.id + 'fx');
      let html = '<div class="fx-spec">';
      for (let i = 0; i < 30; i++) {
        const h = 18 + Math.abs(Math.sin(i * 0.4 + 1)) * 62 * (0.55 + rnd() * 0.5);
        html += '<i style="--h:' + h.toFixed(0) + '%;--d:' + (i * 22) + 'ms"></i>';
      }
      return html + '<span class="fx-spec__box"></span></div>';
    },

    attention: function (p) {
      const rnd = seeded(p.id + 'fx');
      let html = '<div class="fx-attn">';
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          // Same causal mask as the artwork, so the two agree.
          const o = c > r ? 0 : (c === r ? 0.8 : 0.12 + rnd() * 0.45);
          html += '<i style="--o:' + o.toFixed(2) + ';--d:' + (r * 70 + c * 30) + 'ms"></i>';
        }
      }
      return html + '</div>';
    },

    tree: function (p) {
      const cols = [[50, [50]], [140, [22, 50, 78]], [230, [10, 30, 44, 58, 70, 90]]];
      let paths = '', dots = '';
      for (let i = 0; i < cols.length - 1; i++) {
        const ax = cols[i][0], bx = cols[i + 1][0];
        cols[i][1].forEach(function (ay, ai) {
          cols[i + 1][1].forEach(function (by, bi) {
            const span = cols[i + 1][1].length / cols[i][1].length;
            if (Math.floor(bi / span) !== ai) return;
            const len = Math.hypot(bx - ax, by - ay).toFixed(0);
            paths += '<path d="M' + ax + ' ' + ay + 'L' + bx + ' ' + by +
              '" style="--len:' + len + ';--d:' + (i * 240) + 'ms"/>';
          });
        });
      }
      cols.forEach(function (col, i) {
        col[1].forEach(function (y) {
          dots += '<circle cx="' + col[0] + '" cy="' + y + '" r="2.6" style="--d:' +
            (i * 240 + 180) + 'ms"/>';
        });
      });
      return '<svg class="fx-tree" viewBox="0 0 280 100" preserveAspectRatio="xMidYMid meet" ' +
        'aria-hidden="true">' + paths + dots + '</svg>';
    },

    chart: function (p) {
      const rnd = seeded(p.id + 'fx');
      let pts = [], v = 60;
      for (let i = 0; i < 24; i++) {
        v = Math.max(18, Math.min(82, v + (rnd() - 0.44) * 16));
        pts.push((10 + i * 11.3).toFixed(1) + ',' + v.toFixed(1));
      }
      const line = pts.join(' ');
      return '<svg class="fx-chart" viewBox="0 0 280 100" preserveAspectRatio="none" aria-hidden="true">' +
        '<polygon class="fx-chart__fill" points="10,100 ' + line + ' 269.9,100"/>' +
        '<polyline class="fx-chart__line" points="' + line + '"/>' +
        '<g class="fx-chart__mark"><line x1="272" y1="6" x2="272" y2="94"/>' +
        '<circle cx="272" cy="' + v.toFixed(1) + '" r="5"/></g></svg>';
    },

    window: function () {
      let rows = '';
      [86, 62, 74, 44].forEach(function (w, i) {
        rows += '<i style="--w:' + w + '%;--d:' + (200 + i * 110) + 'ms"></i>';
      });
      return '<div class="fx-window"><div class="fx-window__bar"><i></i><i></i><i></i></div>' +
        '<div class="fx-window__rows">' + rows + '</div></div>';
    }
  };

  function fxFor(p) {
    const make = FX[p.anim];
    if (!make) return '';
    return '<div class="pcard__fx" aria-hidden="true">' + make(p) + '</div>';
  }

  /* ---------- 9. Card rendering and filtering ---------- */
  const grid = $('#projectGrid');
  const gridEmpty = $('#gridEmpty');
  const registry = (typeof PROJECTS !== 'undefined' && PROJECTS) || [];

  function cardHTML(p) {
    const badge = p.badge
      ? '<span class="pcard__badge' + (p.badgeAlt ? ' pcard__badge--alt' : '') + '">' +
        esc(p.badge) + '</span>'
      : '';
    const metric = p.metric ? '<span class="pcard__metric">' + esc(p.metric) + '</span>' : '';
    const detail = p.detail
      ? '<p class="pcard__detail"><svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>' +
        esc(p.detail) + '</p>'
      : '';
    const tags = p.tech.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
    const demo = p.demo
      ? '<a class="link-arrow link-arrow--muted" href="' + esc(p.demo) +
        '" target="_blank" rel="noopener">Live <span aria-hidden="true">&#8599;</span></a>'
      : '';

    // The image is optional. Artwork sits underneath as the guaranteed layer.
    const img = p.image
      ? '<img class="pcard__img" src="' + esc(p.image) + '" alt="' + esc(p.alt) +
        '" loading="lazy" decoding="async" width="800" height="400">'
      : '';

    return '' +
      '<article class="pcard pcard--' + p.size + ' reveal" data-cat="' + p.cat +
        '" data-id="' + p.id + '" style="--lang:' + p.langColor + '">' +
        '<div class="pcard__inner">' +
          '<div class="pcard__visual">' +
            '<div class="pcard__art" aria-hidden="' + (p.image ? 'true' : 'false') + '">' +
              artFor(p) + '</div>' +
            img +
            fxFor(p) +
          '</div>' +
          '<div class="pcard__body">' +
            '<div class="pcard__top">' +
              '<span class="pcard__idx">' + esc(p.idx) + '</span>' +
              badge + metric +
              '<span class="pcard__lang"><i class="lang-dot" aria-hidden="true"></i>' +
                esc(p.lang) + '</span>' +
            '</div>' +
            '<h3 class="pcard__title">' + esc(p.title) + '</h3>' +
            '<p class="pcard__tagline">' + esc(p.tagline) + '</p>' +
            '<p class="pcard__short">' + esc(p.short) + '</p>' +
            detail +
            '<ul class="tags">' + tags + '</ul>' +
            '<div class="pcard__links">' +
              '<button class="pcard__cta" type="button" data-open="' + p.id + '">' +
                esc(p.cta) + ' <span aria-hidden="true">&#8594;</span></button>' +
              '<a class="link-arrow link-arrow--muted" href="' + esc(p.github) +
                '" target="_blank" rel="noopener">Code <span aria-hidden="true">&#8599;</span></a>' +
              demo +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  if (grid && registry.length) {
    grid.innerHTML = registry.map(cardHTML).join('');
    const count = $('#statCount');
    if (count) count.textContent = String(registry.length);
  }

  // Real screenshots, when present, fade in over the artwork. If one
  // fails to load it is removed and the artwork simply stays.
  $$('.pcard__img').forEach(function (img) {
    const done = function () { img.classList.add('is-loaded'); };
    if (img.complete && img.naturalWidth) done();
    else img.addEventListener('load', done, { once: true });
    img.addEventListener('error', function () {
      const art = $('.pcard__art', img.closest('.pcard__visual'));
      if (art) art.setAttribute('aria-hidden', 'false');
      img.remove();
    }, { once: true });
  });

  // Any image carrying data-fallback hides its own container on failure,
  // so a missing file leaves a clean layout instead of a broken icon.
  $$('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      const box = document.getElementById(img.dataset.fallback);
      if (box) box.classList.add('is-missing');
      else img.remove();
    }, { once: true });
  });

  (function filters() {
    const chips = $$('.chip');
    const cards = $$('.pcard', grid);
    if (!chips.length || !cards.length) return;

    // Show the real count on each chip, so nothing claims a category it lacks.
    chips.forEach(function (chip) {
      const f = chip.dataset.filter;
      const n = f === 'all' ? cards.length
        : cards.filter(function (c) { return c.dataset.cat === f; }).length;
      chip.insertAdjacentHTML('beforeend', '<span class="chip__n">' + n + '</span>');
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        const filter = chip.dataset.filter;
        chips.forEach(function (c) {
          const on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });

        let shown = 0;
        cards.forEach(function (card) {
          const match = filter === 'all' || card.dataset.cat === filter;
          card.classList.toggle('is-hidden', !match);
          card.classList.remove('is-filtering');
          if (match) {
            shown++;
            void card.offsetWidth;
            card.classList.add('is-filtering');
          }
        });
        if (gridEmpty) gridEmpty.hidden = shown !== 0;
      });
    });
  })();

  observeReveals();

  /* ---------- 10. Pointer: cursor ring and magnetic cards ---------- */
  /* The native cursor is never hidden. This adds a ring that trails it
     and names the action underneath, which is decoration on top of a
     working pointer rather than a replacement for one. */
  if (canHover && !reduceMotion) {
    const ring = $('#cursor');
    const label = $('#cursorLabel');
    let tx = 0, ty = 0, cx = 0, cy = 0, alive = false, frame = null;

    const HOT = [
      ['.pcard__cta', 'open'],
      ['.pcard', 'inspect'],
      ['a[href^="mailto"]', 'email'],
      ['a[target="_blank"]', 'opens tab'],
      ['.themes__opt', 'theme'],
      ['button', 'click'],
      ['a', 'go']
    ];

    function loop() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      ring.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      frame = Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2 ? requestAnimationFrame(loop) : null;
    }

    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!alive) { alive = true; cx = tx; cy = ty; ring.classList.add('is-on'); }
      if (!frame) frame = requestAnimationFrame(loop);

      let hit = null;
      for (let i = 0; i < HOT.length; i++) {
        const el = e.target.closest(HOT[i][0]);
        if (el) { hit = HOT[i][1]; break; }
      }
      ring.classList.toggle('is-hot', Boolean(hit));
      if (label) label.textContent = hit || '';
    }, { passive: true });

    document.addEventListener('pointerleave', function () {
      ring.classList.remove('is-on', 'is-hot');
      alive = false;
    });
  }

  if (canHover) {
    // Cards lean toward the pointer. Small enough to feel physical,
    // never enough to make a click target move out from under you.
    $$('.pcard').forEach(function (card) {
      const inner = $('.pcard__inner', card);
      card.addEventListener('pointermove', function (e) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        if (reduceMotion || !inner) return;
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        inner.style.setProperty('--tx', (dx * 9).toFixed(2) + 'px');
        inner.style.setProperty('--ty', (dy * 7).toFixed(2) + 'px');
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        if (!inner) return;
        inner.style.setProperty('--tx', '0px');
        inner.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ---------- 11. Case study dialog ---------- */
  const modal = $('#modal');
  const modalPanel = $('#modalPanel');
  let lastFocus = null;

  function byId(id) {
    for (let i = 0; i < registry.length; i++) if (registry[i].id === id) return registry[i];
    return null;
  }

  function studyHTML(p) {
    const s = p.study || {};
    const arch = (s.architecture || []).map(function (row) {
      return '<li><b>' + esc(row[0]) + '</b><span>' + esc(row[1]) + '</span></li>';
    }).join('');
    const impl = (s.implementation || []).map(function (n) {
      return '<li>' + esc(n) + '</li>';
    }).join('');
    const body = (p.body || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');

    // Anything still marked PLACEHOLDER is flagged as unverified rather
    // than dressed up as a result.
    const isPlaceholder = /^PLACEHOLDER/i.test(s.results || '');
    const results = s.results
      ? '<div class="mblock"><h4 class="mblock__label mono">Results</h4>' +
        '<div class="callout' + (isPlaceholder ? ' callout--warn' : '') + '"><p>' +
        esc(s.results.replace(/^PLACEHOLDER:\s*/i, '')) + '</p></div></div>'
      : '';

    return '' +
      '<div class="modal__head">' +
        '<p class="modal__eyebrow"><b>Project ' + esc(p.idx) + '</b>' +
          '<span>' + esc(p.catLabel) + '</span><span>' + esc(p.lang) + '</span></p>' +
        '<h2 class="modal__title" id="modalTitle">' + esc(p.title) + '</h2>' +
        '<p class="modal__tagline">' + esc(p.tagline) + '</p>' +
        '<button class="modal__close" type="button" id="modalClose" aria-label="Close case study">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="modal__hero">' + (p.image
        ? '<img src="' + esc(p.image) + '" alt="' + esc(p.alt) + '">'
        : artFor(p)) + '</div>' +
      '<div class="modal__body">' +
        '<div class="mblock mblock--lead"><h4 class="mblock__label mono">System overview</h4>' +
          '<p>' + esc(s.overview || p.short) + '</p></div>' +
        '<div class="mgrid">' +
          '<div class="mblock"><h4 class="mblock__label mono">The problem</h4><p>' +
            esc(s.problem || '') + '</p></div>' +
          '<div class="mblock"><h4 class="mblock__label mono">Approach</h4><p>' +
            esc(s.approach || '') + '</p></div>' +
        '</div>' +
        (arch ? '<div class="mblock"><h4 class="mblock__label mono">Architecture</h4>' +
          '<ul class="arch">' + arch + '</ul></div>' : '') +
        '<div class="mblock"><h4 class="mblock__label mono">Technology</h4>' +
          '<ul class="tags">' + p.tech.map(function (t) {
            return '<li>' + esc(t) + '</li>';
          }).join('') + '</ul></div>' +
        (impl ? '<div class="mblock"><h4 class="mblock__label mono">Implementation notes</h4>' +
          '<ul class="notes">' + impl + '</ul></div>' : '') +
        results +
        (s.lessons ? '<div class="mblock"><h4 class="mblock__label mono">Lessons learned</h4><p>' +
          esc(s.lessons) + '</p></div>' : '') +
        '<div class="mblock"><h4 class="mblock__label mono">The build in more detail</h4>' +
          body + '</div>' +
        '<div class="modal__foot">' +
          '<a class="btn btn--primary" href="' + esc(p.github) + '" target="_blank" rel="noopener">' +
            'View code on GitHub <span class="btn__arrow" aria-hidden="true">&#8599;</span></a>' +
          (p.demo ? '<a class="btn btn--ghost" href="' + esc(p.demo) +
            '" target="_blank" rel="noopener">Open live app ' +
            '<span class="btn__arrow" aria-hidden="true">&#8599;</span></a>' : '') +
        '</div>' +
      '</div>';
  }

  function openStudy(id, trigger) {
    const p = byId(id);
    if (!p || !modal || !modalPanel) return;
    lastFocus = trigger || document.activeElement;
    modalPanel.innerHTML = studyHTML(p);
    modalPanel.scrollTop = 0;

    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');

    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { modal.classList.add('is-open'); });
    const close = $('#modalClose');
    if (close) close.focus();
  }

  function closeStudy() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () {
      if (typeof modal.close === 'function' && modal.open) modal.close();
      else modal.removeAttribute('open');
      if (modalPanel) modalPanel.innerHTML = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }, reduceMotion ? 0 : 260);
  }

  document.addEventListener('click', function (e) {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      openStudy(opener.dataset.open, opener);
      return;
    }
    if (e.target.closest('#modalClose')) { closeStudy(); return; }
    // Clicking the dim area outside the panel closes it.
    if (modal && modal.open && e.target.closest('.modal__shell') && !e.target.closest('.modal__panel')) {
      closeStudy();
    }
  });

  if (modal) {
    modal.addEventListener('cancel', function (e) { e.preventDefault(); closeStudy(); });
    modal.addEventListener('close', function () {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    });
    /* `cancel` covers Escape on a real <dialog>. This keydown is for the
       fallback path, where the element is only `open` and the browser
       gives us no cancel event of its own. */
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && typeof modal.showModal !== 'function') {
        e.preventDefault();
        closeStudy();
      }
    });
  }

  /* ---------- 12. Console and easter eggs ---------- */
  (function eggs() {
    const box = $('#console');
    const out = $('#consoleOut');
    const form = $('#consoleForm');
    const input = $('#consoleIn');
    if (!box || !out || !form || !input) return;

    let open = false;

    function print(html, cls) {
      const line = document.createElement('div');
      if (cls) line.className = cls;
      line.innerHTML = html;
      out.appendChild(line);
      out.scrollTop = out.scrollHeight;
    }

    function openConsole() {
      if (open) return;
      open = true;
      box.hidden = false;
      requestAnimationFrame(function () { box.classList.add('is-open'); });
      if (!out.childElementCount) {
        print('DevZro console. Type <span class="ok">help</span> for commands.');
      }
      input.focus();
    }

    function closeConsole() {
      open = false;
      box.classList.remove('is-open');
      setTimeout(function () { if (!open) box.hidden = true; }, 460);
    }

    const list = function (items) {
      return items.map(function (i) { return '&nbsp;&nbsp;' + i; }).join('<br>');
    };

    const COMMANDS = {
      help: function () {
        print('Available: <span class="ok">projects skills about contact theme resume ' +
          'open clear exit</span>');
        print('Try <span class="ok">open chess</span> or <span class="ok">theme neural</span>.');
      },
      projects: function () {
        print(list(registry.map(function (p) {
          return '<span class="ok">' + p.id + '</span> &nbsp;' + esc(p.title) +
            ' &middot; ' + esc(p.tagline);
        })));
        print('Use <span class="ok">open &lt;id&gt;</span> to read the case study.');
      },
      skills: function () {
        print(list($$('.skillgroup').map(function (g) {
          const title = $('.skillgroup__title', g).textContent;
          const items = $$('.skilllist li', g).map(function (li) {
            return li.firstChild.textContent.trim();
          }).join(', ');
          return '<span class="ok">' + esc(title) + '</span>: ' + esc(items);
        })));
      },
      about: function () {
        print('Oluwasemilore Adelaja. Data scientist and ML engineer, deep learning focus.');
        print('Mechanical Engineering at the University of Lagos. Lagos, Nigeria.');
        print('Building a bitboard chess engine. Writes about the internals.');
      },
      contact: function () {
        print('email &nbsp; <a href="mailto:danizhem99@gmail.com">danizhem99@gmail.com</a>');
        print('github &nbsp;<a href="https://github.com/DevZro" target="_blank" rel="noopener">@DevZro</a>');
        print('medium &nbsp;<a href="https://medium.com/@monsieurblue00" target="_blank" rel="noopener">@monsieurblue00</a>');
      },
      resume: function () {
        print('Opening resume.');
        window.open('Dev%20Zero.pdf', '_blank', 'noopener');
      },
      theme: function (arg) {
        if (!arg) { print('Usage: theme system | terminal | neural'); return; }
        if (THEMES.indexOf(arg) === -1) { print('No theme "' + esc(arg) + '".', 'err'); return; }
        setTheme(arg, false);
        print('Theme set to <span class="ok">' + esc(arg) + '</span>. ' + THEME_NOTE[arg]);
      },
      open: function (arg) {
        const p = byId((arg || '').toLowerCase());
        if (!p) { print('No project "' + esc(arg || '') + '". Try projects.', 'err'); return; }
        print('Opening <span class="ok">' + esc(p.title) + '</span>.');
        closeConsole();
        openStudy(p.id, input);
      },
      whoami: function () { print('guest, with excellent taste in portfolios.'); },
      clear: function () { out.innerHTML = ''; },
      exit: function () { closeConsole(); }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const raw = input.value.trim();
      input.value = '';
      if (!raw) return;
      print('&gt; ' + esc(raw), 'cmd');
      const parts = raw.split(/\s+/);
      const cmd = COMMANDS[parts[0].toLowerCase()];
      if (cmd) cmd(parts.slice(1).join(' ').toLowerCase());
      else print('Command not found: ' + esc(parts[0]) + '. Type help.', 'err');
    });

    const closeBtn = $('#consoleClose');
    if (closeBtn) closeBtn.addEventListener('click', closeConsole);

    // Backtick opens it, but never while someone is typing in a field.
    document.addEventListener('keydown', function (e) {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (e.key === '`' && !typing) { e.preventDefault(); openConsole(); return; }
      if (e.key === 'Escape' && open) { closeConsole(); }
    });

    /* Konami: a short hue sweep and the console, nothing permanent. */
    const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let at = 0;
    const hue = $('#hue');

    document.addEventListener('keydown', function (e) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      at = key === KONAMI[at] ? at + 1 : (key === KONAMI[0] ? 1 : 0);
      if (at < KONAMI.length) return;
      at = 0;
      if (hue && !reduceMotion) {
        hue.classList.remove('is-on');
        void hue.offsetWidth;
        hue.classList.add('is-on');
      }
      toast('30 lives granted. Console unlocked.');
      openConsole();
      print('<span class="ok">Konami accepted.</span> You found the back door.');
    });

    /* Secret click: three taps on the footer phrase. */
    const secret = $('#secret');
    if (secret) {
      let taps = 0, timer = null;
      const trip = function () {
        taps++;
        clearTimeout(timer);
        timer = setTimeout(function () { taps = 0; }, 1200);
        if (taps < 3) return;
        taps = 0;
        openConsole();
        print('<span class="ok">Found it.</span> Every line on this page was written by hand.');
        print('No framework, no build step, no dependencies. Try <span class="ok">projects</span>.');
      };
      secret.addEventListener('click', trip);
      secret.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trip(); }
      });
    }
  })();

  /* ---------- Back to top ---------- */
  const toTop = $('#toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 13. Hero canvas ---------- */
  /* One small particle field, retuned per theme rather than three
     separate renderers. It stops entirely when offscreen or hidden,
     and never runs at all under reduced motion. */
  (function heroCanvas() {
    const canvas = $('#netCanvas');
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = 1, nodes = [], frame = null;
    let colA = '124,140,255', colB = '57,212,196';
    let mode = 'system';

    const MODES = {
      system: { density: 19000, cap: 66, link: 146, speed: 0.26, dot: 1.7, wire: 0.26 },
      terminal: { density: 30000, cap: 40, link: 120, speed: 0.14, dot: 2.2, wire: 0.2 },
      neural: { density: 15000, cap: 84, link: 168, speed: 0.34, dot: 2.0, wire: 0.3 }
    };

    function rgbOf(name) {
      const raw = getComputedStyle(root).getPropertyValue(name).trim();
      const hex = raw.replace('#', '');
      const full = hex.length === 3 ? hex.split('').map(function (c) { return c + c; }).join('') : hex;
      const n = parseInt(full, 16);
      if (isNaN(n)) return '124,140,255';
      return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    }

    function readTheme() {
      mode = root.getAttribute('data-theme') || 'system';
      if (!MODES[mode]) mode = 'system';
      colA = rgbOf('--accent');
      colB = rgbOf('--accent-2');
      seed();
    }

    function seed() {
      const cfg = MODES[mode];
      const count = Math.min(cfg.cap, Math.max(22, Math.round((w * h) / cfg.density)));
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * cfg.speed,
          vy: (Math.random() - 0.5) * cfg.speed,
          r: Math.random() * cfg.dot + 1,
          ph: Math.random() * Math.PI * 2
        });
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    let t = 0;

    function draw() {
      const cfg = MODES[mode];
      ctx.clearRect(0, 0, w, h);
      t += 0.016;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const d = Math.hypot(dx, dy);
          if (d >= cfg.link) continue;
          const fade = (cfg.wire * (1 - d / cfg.link)).toFixed(3);
          ctx.strokeStyle = 'rgba(' + colA + ',' + fade + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          if (mode === 'terminal') {
            // Right-angle traces, like a board layout rather than a web.
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, n.y);
            ctx.lineTo(m.x, m.y);
          } else {
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
          }
          ctx.stroke();

          // Neural mode sends a signal down the shortest links.
          if (mode === 'neural' && d < cfg.link * 0.5) {
            const k = (Math.sin(t * 1.6 + i) + 1) / 2;
            ctx.fillStyle = 'rgba(' + colB + ',' + (0.5 * (1 - d / cfg.link)).toFixed(3) + ')';
            ctx.beginPath();
            ctx.arc(n.x + (m.x - n.x) * k, n.y + (m.y - n.y) * k, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        const pulse = mode === 'terminal' ? 0.35 + 0.4 * ((Math.sin(t * 2 + n.ph) + 1) / 2) : 0.55;
        ctx.fillStyle = 'rgba(' + colA + ',' + pulse.toFixed(2) + ')';
        if (mode === 'terminal') {
          ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
        } else {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      frame = requestAnimationFrame(draw);
    }

    const start = function () { if (!frame) frame = requestAnimationFrame(draw); };
    const stop = function () { if (frame) { cancelAnimationFrame(frame); frame = null; } };

    resize();
    readTheme();
    start();

    let resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 160);
    });

    new MutationObserver(readTheme).observe(root, {
      attributes: true, attributeFilter: ['data-theme']
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    // If someone turns reduced motion on mid-visit, honour it immediately.
    const onMotionChange = function () {
      reduceMotion = motionQuery.matches;
      if (reduceMotion) { stop(); canvas.style.display = 'none'; }
      else { canvas.style.display = ''; start(); }
    };
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);
    else if (motionQuery.addListener) motionQuery.addListener(onMotionChange);
  })();




})();
