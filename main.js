// Trailline site: gentle snowfall, scroll reveals, count-ups, the feature tour and a phone tilt.
// Every animation is slow and smooth (no flashing), and all of it stops for Reduce Motion.
(() => {
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal + count-up.
  const countUp = (el) => {
    const end = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    if (still || el.hasAttribute('data-static') || end === 0) { el.textContent = end + suffix; return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll?.('[data-count]').forEach(countUp);
      if (e.target.matches('[data-count]')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    io.observe(el);
  });

  // Feature tour: tabs swap the phone screen with a soft crossfade.
  const tabs = [...document.querySelectorAll('.tabs button')];
  const show = (name) => {
    tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === name)));
    document.querySelectorAll('.shot, .panel').forEach((el) => el.classList.toggle('active', el.dataset.tab === name));
  };
  tabs.forEach((b, i) => {
    b.addEventListener('click', () => { show(b.dataset.tab); autoplay = false; });
    b.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus(); next.click();
    });
  });
  // Step through the tour slowly until someone picks a tab.
  let autoplay = !still, idx = 0;
  setInterval(() => {
    const tour = document.getElementById('tour');
    if (!autoplay || !tour) return;
    const r = tour.getBoundingClientRect();
    if (r.top > innerHeight || r.bottom < 0) return;
    idx = (idx + 1) % tabs.length;
    show(tabs[idx].dataset.tab);
  }, 5000);

  // Hero phone tilts toward the pointer.
  const phone = document.querySelector('.tilt');
  if (phone && !still && matchMedia('(pointer: fine)').matches) {
    const hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg)`;
    });
    hero.addEventListener('pointerleave', () => { phone.style.transform = ''; });
  }

  // Snowfall: few, soft, slow flakes. "Pause snow" in the footer stops it.
  const canvas = document.getElementById('snow');
  const toggle = document.querySelector('.motion-toggle');
  if (!canvas || still) { if (toggle) toggle.hidden = true; return; }
  const ctx = canvas.getContext('2d');
  let flakes = [], running = true, raf;
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, innerWidth / 18));
    flakes = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: 0.8 + Math.random() * 2.2, v: 0.25 + Math.random() * 0.6, sway: Math.random() * Math.PI * 2,
    }));
  };
  const tick = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    ctx.fillStyle = 'rgba(238, 245, 239, 0.7)';
    for (const f of flakes) {
      f.y += f.v; f.sway += 0.01; f.x += Math.sin(f.sway) * 0.3;
      if (f.y > innerHeight + 4) { f.y = -4; f.x = Math.random() * innerWidth; }
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(tick);
  };
  size(); tick();
  addEventListener('resize', size);
  toggle?.addEventListener('click', () => {
    running = !running;
    toggle.setAttribute('aria-pressed', String(!running));
    toggle.textContent = running ? 'Pause snow' : 'Let it snow';
    if (running) tick(); else { cancelAnimationFrame(raf); ctx.clearRect(0, 0, innerWidth, innerHeight); }
  });
})();
