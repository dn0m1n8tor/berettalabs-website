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
