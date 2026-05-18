// Navigation
const navToggle = document.querySelector('.nav-toggle');
const drawer = document.querySelector('.nav-drawer');
const nav = document.querySelector('.nav');

if (navToggle && drawer) {
  navToggle.addEventListener('click', () => {
    const isOpen = drawer.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    playWhoosh('soft');
  });

  drawer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Current page state
const links = document.querySelectorAll('.nav-links a, .nav-drawer a, .footer-links a');
const current = location.pathname.split('/').pop() || 'index.html';
links.forEach(link => {
  if (link.getAttribute('href') === current) link.classList.add('active');
});

window.addEventListener('load', () => {
  document.body.classList.add('page-ready');
});

// Scroll progress
const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.prepend(progress);

function updateScrollEffects() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = pct + '%';
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 18);
}
window.addEventListener('scroll', updateScrollEffects, { passive: true });
updateScrollEffects();

// Reveal animations
const reveals = document.querySelectorAll('.reveal, .timeline-item, .topic, .achievement-card');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('up');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -55px 0px' });

reveals.forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// Pointer light tracking
const hoverables = document.querySelectorAll('.card, .topic, .achievement-card');
hoverables.forEach(item => {
  item.addEventListener('mousemove', e => {
    const rect = item.getBoundingClientRect();
    item.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    item.style.setProperty('--my', `${e.clientY - rect.top}px`);
  });
});

const canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

if (canHover) {
  document.querySelectorAll('.card, .achievement-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 5;
      const rotateX = ((0.5 - y / rect.height)) * 5;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.14}px, ${y * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  document.body.classList.add('cursor-ready');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  }, { passive: true });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .card, .topic, .achievement-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// Hero parallax
const heroTitle = document.querySelector('.hero h1');
const heroYear = document.querySelector('.hero-year-fixed');
if (heroTitle) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroTitle.style.transform = `translateY(${y * 0.03}px)`;
    if (heroYear) heroYear.style.transform = `translateY(${y * 0.12}px)`;
  }, { passive: true });
}

// Loader
(function createLoader(){
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  const loader = document.createElement('div');
  loader.className = 'motion-loader';
  loader.setAttribute('aria-hidden', 'true');
  const word = 'Portfolio';
  loader.innerHTML = `
    <span class="loader-shape one"></span>
    <span class="loader-shape two"></span>
    <span class="loader-shape three"></span>
    <div class="loader-word">${[...word].map((ch, i) => `<span style="--i:${i}">${ch}</span>`).join('')}</div>
    <div class="loader-sub">loading · ics4u · portfolio</div>`;
  document.body.prepend(loader);
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('done'), 420);
    setTimeout(() => loader.remove(), 1450);
  });
})();

// Subtle kinetic type only for inner page heroes, not the homepage title.
(function splitPageHeroTitles(){
  function splitKineticTitle(el){
    if (!el || el.dataset.splitDone) return;
    const walk = node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        const text = node.textContent;
        let index = 0;
        text.split(/(\s+)/).forEach(part => {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          const wordSpan = document.createElement('span');
          wordSpan.className = 'word';
          [...part].forEach(ch => {
            const char = document.createElement('span');
            char.className = 'char';
            char.style.setProperty('--char-index', index++);
            char.textContent = ch;
            wordSpan.appendChild(char);
          });
          frag.appendChild(wordSpan);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        [...node.childNodes].forEach(walk);
      }
    };
    [...el.childNodes].forEach(walk);
    el.dataset.splitDone = 'true';
  }
  splitKineticTitle(document.querySelector('.page-hero h1'));
})();

// Interaction ripple feedback
function addRipple(event, target) {
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'interaction-ripple';
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  target.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
}

document.querySelectorAll('.btn, .card, .topic, .nav-links a, .footer-links a, .achievement-card').forEach(item => {
  item.addEventListener('click', e => {
    addRipple(e, item);
    playWhoosh('normal');
  });
});

// Smooth page transitions for internal links
const internalLinks = document.querySelectorAll('a[href$=".html"]');
internalLinks.forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (link.target === '_blank') return;
    e.preventDefault();
    document.body.classList.add('page-leaving');
    setTimeout(() => { window.location.href = href; }, 250);
  });
});

// Optional subtle whoosh sound effect.
let audioContext = null;
function ensureAudio() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioContext = new Ctx();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

function playWhoosh(type = 'normal') {
  const ctx = ensureAudio();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = type === 'soft' ? 0.22 : 0.32;

  // Smooth descending filtered noise for a calm whoosh instead of a click.
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize;
    const envelope = Math.sin(Math.PI * t) * Math.pow(1 - t, 0.35);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(type === 'soft' ? 1800 : 2400, now);
  filter.frequency.exponentialRampToValueAtTime(type === 'soft' ? 420 : 360, now + duration);
  filter.Q.setValueAtTime(0.55, now);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(3600, now);
  lowpass.frequency.exponentialRampToValueAtTime(1300, now + duration);

  const gain = ctx.createGain();
  const peak = type === 'soft' ? 0.012 : 0.018;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.055);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (pan) {
    pan.pan.setValueAtTime(-0.12, now);
    pan.pan.linearRampToValueAtTime(0.12, now + duration);
  }

  source.connect(filter);
  filter.connect(lowpass);
  if (pan) {
    lowpass.connect(pan);
    pan.connect(gain);
  } else {
    lowpass.connect(gain);
  }
  gain.connect(ctx.destination);

  source.playbackRate.setValueAtTime(0.95, now);
  source.playbackRate.linearRampToValueAtTime(1.08, now + duration);

  source.start(now);
  source.stop(now + duration);
}

document.addEventListener('pointerdown', () => ensureAudio(), { once: true });


// Accordion feedback for learning page
document.querySelectorAll('.learning-item summary').forEach(summary => {
  summary.addEventListener('click', () => {
    playWhoosh('soft');
  });
  summary.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  summary.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});


// Stable custom cursor fix.
// This version is independent from any section, so it should not disappear while scrolling.
(function stableCursor(){
  const canUseCursor = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (!canUseCursor) return;

  // Remove any duplicate cursor elements left by older versions.
  document.querySelectorAll('.cursor-dot, .cursor-ring').forEach(el => el.remove());

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  document.body.classList.add('cursor-ready');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  let visible = false;

  function placeDot() {
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  }

  window.addEventListener('pointermove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    placeDot();

    if (!visible) {
      visible = true;
      document.body.classList.remove('cursor-hidden');
    }
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    document.body.classList.add('cursor-hidden');
  });

  window.addEventListener('pointerenter', () => {
    document.body.classList.remove('cursor-hidden');
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }

  placeDot();
  animateRing();

  const hoverSelector = 'a, button, summary, .btn, .card, .topic, .achievement-card, .photo-slot, pre, .learning-item';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverSelector)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverSelector)) {
      document.body.classList.remove('cursor-hover');
    }
  });
})();


// Round 12: seamless learning accordion using max-height, not native details.
(function learningAccordionFix(){
  const items = document.querySelectorAll('.learning-item');
  if (!items.length) return;

  function setPanelHeight(item) {
    const panel = item.querySelector('.learning-panel');
    if (!panel) return;
    if (item.classList.contains('open')) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    } else {
      panel.style.maxHeight = '0px';
    }
  }

  items.forEach(item => {
    const btn = item.querySelector('.learning-summary');
    const panel = item.querySelector('.learning-panel');
    if (!btn || !panel) return;

    if (item.classList.contains('open')) {
      btn.setAttribute('aria-expanded', 'true');
    } else {
      btn.setAttribute('aria-expanded', 'false');
    }
    setPanelHeight(item);

    btn.addEventListener('click', () => {
      const nowOpen = !item.classList.contains('open');
      item.classList.toggle('open', nowOpen);
      btn.setAttribute('aria-expanded', nowOpen ? 'true' : 'false');
      setPanelHeight(item);
      playWhoosh('soft');
    });
  });

  window.addEventListener('resize', () => {
    items.forEach(setPanelHeight);
  }, { passive: true });
})();

// Round 12: final stable cursor. Uses transform only and is not tied to any section.
(function finalStableCursor(){
  const canUseCursor = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (!canUseCursor) return;

  document.querySelectorAll('.cursor-dot, .cursor-ring, .portfolio-cursor-dot, .portfolio-cursor-ring').forEach(el => el.remove());

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'portfolio-cursor-dot';
  ring.className = 'portfolio-cursor-ring';
  document.documentElement.appendChild(ring);
  document.documentElement.appendChild(dot);
  document.body.classList.add('cursor-ready');

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;

  function moveDot() {
    dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
  }

  window.addEventListener('pointermove', e => {
    x = e.clientX;
    y = e.clientY;
    moveDot();
  }, { passive: true });

  function animate() {
    rx += (x - rx) * 0.22;
    ry += (y - ry) * 0.22;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }

  moveDot();
  animate();

  const hoverSelector = 'a, button, summary, .btn, .card, .topic, .achievement-card, .photo-slot, pre, .learning-item, .learning-summary';
  document.addEventListener('pointerover', e => {
    if (e.target.closest(hoverSelector)) document.body.classList.add('cursor-hover');
  }, true);
  document.addEventListener('pointerout', e => {
    if (e.target.closest(hoverSelector)) document.body.classList.remove('cursor-hover');
  }, true);
})();


// Final cleanup: recalculate open accordion heights after fonts load and after page settles.
(function finalAccordionRefresh(){
  function refreshOpenPanels(){
    document.querySelectorAll('.learning-item.open .learning-panel').forEach(panel => {
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  }
  window.addEventListener('load', () => setTimeout(refreshOpenPanels, 120));
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setTimeout(refreshOpenPanels, 80));
  }
})();

// Final cleanup: make sure hover cursor state never gets stuck.
(function finalCursorStateGuard(){
  document.addEventListener('pointermove', e => {
    const hoverSelector = 'a, button, summary, .btn, .card, .topic, .achievement-card, .photo-slot, pre, .learning-item, .learning-summary';
    document.body.classList.toggle('cursor-hover', Boolean(e.target.closest(hoverSelector)));
  }, { passive: true });
})();
