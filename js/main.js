// ============================================================
// Berettalabs — interactions
// ============================================================

// ---------- Sticky header ----------
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------- Mobile nav ----------
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

navToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

mainNav.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);

// ---------- Services dropdown (click / accordion) ----------
const dropdown = document.querySelector('.nav-dropdown');
const dropToggle = dropdown && dropdown.querySelector('.dropdown-toggle');

if (dropToggle) {
  dropToggle.addEventListener('click', e => {
    e.preventDefault();
    const open = dropdown.classList.toggle('open');
    dropToggle.setAttribute('aria-expanded', open);
  });
  // close when clicking outside (desktop)
  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
      dropToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ---------- Active nav link on scroll ----------
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');

// Only the home page uses in-page hash anchors for nav highlighting.
const hashLinks = [...navLinks].filter(l => (l.getAttribute('href') || '').startsWith('#'));

if (hashLinks.length) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      hashLinks.forEach(l =>
        l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`)
      );
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => sectionObserver.observe(s));
}

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---------- Animated counters ----------
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    counterObserver.unobserve(entry.target);

    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start = performance.now();

    // Drive the surrounding progress ring (if present)
    const ringWrap = el.closest('.stat-ring');
    const ring = ringWrap && ringWrap.querySelector('.ring-fg');
    if (ring) {
      const C = 2 * Math.PI * 52; // r = 52
      const pct = parseFloat(ringWrap.dataset.pct) || 100;
      ring.style.strokeDashoffset = C * (1 - pct / 100);
    }

    const tick = now => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ---------- Terminal typing effect ----------
const terminalText = document.getElementById('terminalText');

const SCRIPT = [
  { text: '$ ./berettalabs --engage target.client.com\n', delay: 28 },
  { text: '[+] Initializing security assessment...\n', delay: 14 },
  { text: '[+] Scope confirmed. Rules of engagement loaded.\n', delay: 14 },
  { text: '[*] Enumerating attack surface............ done\n', delay: 12 },
  { text: '[*] Testing authentication flows.......... done\n', delay: 12 },
  { text: '[*] Probing API authorization............. done\n', delay: 12 },
  { text: '[!] CRITICAL: IDOR in /api/v1/accounts\n', delay: 16 },
  { text: '[!] HIGH: JWT signature bypass detected\n', delay: 16 },
  { text: '[+] 14 findings documented with PoC\n', delay: 14 },
  { text: '[+] Report delivered. Re-assessment scheduled.\n', delay: 14 },
  { text: '\n>> Your shield is only as strong as its last test.\n', delay: 22 },
];

function typeTerminal(lineIdx = 0, charIdx = 0) {
  if (lineIdx >= SCRIPT.length) {
    setTimeout(() => { terminalText.textContent = ''; typeTerminal(); }, 6000);
    return;
  }
  const line = SCRIPT[lineIdx];
  terminalText.textContent += line.text[charIdx];

  if (charIdx + 1 < line.text.length) {
    setTimeout(() => typeTerminal(lineIdx, charIdx + 1), line.delay);
  } else {
    setTimeout(() => typeTerminal(lineIdx + 1, 0), 220);
  }
}

if (terminalText && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  typeTerminal();
} else if (terminalText) {
  terminalText.textContent = SCRIPT.map(l => l.text).join('');
}

// ---------- Contact form ----------
const form = document.getElementById('contactForm');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Quote Request — ${data.get('service')}`);
    const body = encodeURIComponent(
      `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nService: ${data.get('service')}\n\n${data.get('message')}`
    );
    window.location.href = `mailto:info@berettalabs.com?subject=${subject}&body=${body}`;
  });
}

// ---------- FAQ accordion ----------
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const open = item.classList.toggle('open');
    a.style.maxHeight = open ? a.scrollHeight + 'px' : null;
  });
});

// ============================================================
// Dynamic / premium enhancements
// ============================================================
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Preloader ----------
const preloader = document.getElementById('preloader');
if (preloader) {
  const hide = () => preloader.classList.add('done');
  window.addEventListener('load', () => setTimeout(hide, reduceMotion ? 0 : 500));
  // Safety net so it never gets stuck.
  setTimeout(hide, 2500);
}

// ---------- Scroll progress bar ----------
const progress = document.getElementById('scrollProgress');
if (progress) {
  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ---------- Back to top ----------
const backToTop = document.getElementById('backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  );
}

// ---------- Hero rotating word ----------
const rotator = document.getElementById('rotator');
if (rotator && !reduceMotion) {
  const words = (rotator.dataset.words || '').split(',').map(w => w.trim()).filter(Boolean);
  let i = 0;
  if (words.length) {
    setInterval(() => {
      i = (i + 1) % words.length;
      rotator.innerHTML = `<span class="rot-word">${words[i]}</span>`;
    }, 2200);
  }
}

// ---------- Card spotlight + subtle 3D tilt ----------
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.service-card, .case-card, .blog-card, .feature-card').forEach(card => {
    card.classList.add('tilt');
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      card.style.setProperty('--mx', x + 'px');
      card.style.setProperty('--my', y + 'px');
      const rx = ((y / r.height) - 0.5) * -5;
      const ry = ((x / r.width) - 0.5) * 5;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ---------- Testimonials carousel ----------
const carousel = document.getElementById('carousel');
if (carousel) {
  const track = carousel.querySelector('#carouselTrack');
  const slides = [...track.children];
  const dotsWrap = carousel.querySelector('#carouselDots');
  let index = 0, timer;

  slides.forEach((_, n) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (n === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${n + 1}`);
    dot.addEventListener('click', () => { go(n); reset(); });
    dotsWrap.appendChild(dot);
  });
  const dots = [...dotsWrap.children];

  function go(n) {
    index = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }
  function reset() {
    if (reduceMotion) return;
    clearInterval(timer);
    timer = setInterval(() => go(index + 1), 5500);
  }

  carousel.querySelector('#carouselNext').addEventListener('click', () => { go(index + 1); reset(); });
  carousel.querySelector('#carouselPrev').addEventListener('click', () => { go(index - 1); reset(); });
  carousel.addEventListener('mouseenter', () => clearInterval(timer));
  carousel.addEventListener('mouseleave', reset);
  reset();
}

// ---------- Hero particle network canvas ----------
const canvas = document.getElementById('netCanvas');
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d');
  let w, h, nodes, raf;
  const COUNT = () => Math.min(70, Math.floor(window.innerWidth / 22));

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = rect.width * dpr;
    h = canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    w = rect.width; h = rect.height;
    nodes = Array.from({ length: COUNT() }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          ctx.strokeStyle = `rgba(184, 4, 4, ${0.18 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = 'rgba(233, 0, 55, 0.7)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { cancelAnimationFrame(raf); resize(); draw(); }, 200);
  });
  resize();
  draw();
}

// ---------- Magnetic primary buttons ----------
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.btn-primary, .btn-lg').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${(mx * 0.25).toFixed(1)}px, ${(my * 0.4 - 2).toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

// ---------- Subtle scroll parallax on decorative visuals ----------
if (!reduceMotion) {
  const parallaxTargets = [];
  document.querySelectorAll('.radar-sweep').forEach(el => parallaxTargets.push([el, 0.16, 'radar']));
  document.querySelectorAll('.shield-frame').forEach(el => parallaxTargets.push([el, 0.1, 'shield']));

  if (parallaxTargets.length) {
    let ticking = false;
    const apply = () => {
      const vh = window.innerHeight;
      for (const [el, speed] of parallaxTargets) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) continue;
        const off = (rect.top + rect.height / 2 - vh / 2) / vh; // -0.5..0.5
        el.style.transform = `translateY(${(-off * speed * 100).toFixed(1)}px)`;
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  }
}
