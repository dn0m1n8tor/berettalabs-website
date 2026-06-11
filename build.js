/* ============================================================
   Berettalabs static-site generator
   Run:  node build.js
   Outputs flat .html pages sharing one header/footer.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const OUT = __dirname;

/* ---------- Icons (reused across pages) ---------- */
const ICONS = {
  web: '<path d="M3 5h18v12H3z M3 9h18 M7 21h10 M9 17v4 M15 17v4" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  mobile: '<rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M11 18h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  api: '<path d="M8 9l-4 3 4 3 M16 9l4 3-4 3 M13 6l-2 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 010-9 6 6 0 0111.7 1.5A4 4 0 0118 18H7z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  network: '<rect x="3" y="4" width="7" height="6" rx="1" stroke="currentColor" stroke-width="1.6"/><rect x="14" y="14" width="7" height="6" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M10 7h7v7" stroke="currentColor" stroke-width="1.6"/>',
  code: '<path d="M9 8l-4 4 4 4 M15 8l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  wifi: '<path d="M5 13a10 10 0 0114 0 M8 16a6 6 0 018 0 M12 19h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  red: '<path d="M12 3l2 4 4.5.5-3.3 3.2.8 4.5L12 13l-4 2.2.8-4.5L5.5 7.5 10 7l2-4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 15v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  iot: '<rect x="8" y="8" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.6"/><path d="M9 4v3M12 4v3M15 4v3M9 17v3M12 17v3M15 17v3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  sdlc: '<path d="M12 3a9 9 0 109 9 M12 3v9h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  web3: '<path d="M6 10l6-7 6 7-6 11-6-11z M6 10h12 M12 3v18" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  shield: '<path d="M12 2L3 6v6c0 5.25 3.84 9.74 9 11 5.16-1.26 9-5.75 9-11V6l-9-4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
};
const svg = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">${ICONS[k]}</svg>`;

/* ---------- Services data ---------- */
const SERVICES = [
  {
    slug: 'web-app-penetration-testing', icon: 'web',
    name: 'Web Application Penetration Testing',
    short: 'Deep manual testing against the OWASP Top 10 and beyond — auth flaws, injection, business-logic abuse and broken access control.',
    tagline: 'Find the flaws in your web apps before attackers weaponize them.',
    overview: 'Web applications are the front door to your business — and the most attacked surface you own. Our certified engineers go far beyond automated scanners, manually probing authentication, session management, access control and business logic to surface the vulnerabilities that actually lead to breaches.',
    focus: ['Authentication & session management flaws', 'SQL / NoSQL / command injection', 'Cross-site scripting (XSS) & CSRF', 'Broken access control & IDOR', 'Business-logic abuse', 'Server-side request forgery (SSRF)', 'Insecure deserialization', 'Security misconfiguration'],
  },
  {
    slug: 'mobile-app-penetration-testing', icon: 'mobile',
    name: 'Mobile Application Penetration Testing',
    short: 'Android & iOS assessments covering insecure storage, weak crypto, API abuse, reverse-engineering resistance and runtime tampering.',
    tagline: 'Secure your mobile apps against reverse engineering and runtime attacks.',
    overview: 'Mobile apps ship with secrets, talk to sensitive APIs and run on devices you do not control. We assess Android and iOS apps against the OWASP MASVS standard — testing local storage, cryptography, network communication, and resistance to tampering and reverse engineering.',
    focus: ['Insecure local data storage', 'Weak or broken cryptography', 'Insecure API & network communication', 'Hardcoded secrets & keys', 'Reverse-engineering & code-tampering resistance', 'Runtime instrumentation (Frida/Objection)', 'Insecure deep-link & IPC handling', 'Authentication & session weaknesses'],
  },
  {
    slug: 'api-security-testing', icon: 'api',
    name: 'API Security Testing (APIST)',
    short: 'REST, GraphQL and gRPC testing for BOLA/IDOR, broken authentication, mass assignment, rate-limit gaps and data over-exposure.',
    tagline: 'Lock down the APIs that power your apps, partners and integrations.',
    overview: 'APIs are where modern data flows — and the OWASP API Top 10 exists because they fail in predictable ways. We map your full API surface, then systematically test every endpoint and role for authorization gaps, mass assignment, and data over-exposure.',
    focus: ['Broken object-level authorization (BOLA/IDOR)', 'Broken function-level authorization (BFLA)', 'Broken authentication & JWT flaws', 'Mass assignment', 'Excessive data exposure', 'Lack of rate limiting / resource abuse', 'GraphQL introspection & batching abuse', 'Improper inventory & shadow APIs'],
  },
  {
    slug: 'cloud-security-assessment', icon: 'cloud',
    name: 'Cloud Security Assessment',
    short: 'AWS, Azure & GCP configuration reviews — IAM privilege-escalation paths, exposed storage, network segmentation and logging gaps.',
    tagline: 'Harden your cloud before a single misconfiguration becomes a breach.',
    overview: 'Most cloud breaches come down to misconfiguration, not zero-days. We review your AWS, Azure or GCP environment against CIS benchmarks and real-world attack paths — focusing on identity, exposed services, and the privilege-escalation chains that turn a foothold into full compromise.',
    focus: ['IAM misconfiguration & privilege escalation', 'Publicly exposed storage (S3/Blob/GCS)', 'Network segmentation & security-group review', 'Secrets management & key exposure', 'Logging, monitoring & detection gaps', 'Serverless & container security', 'Misconfigured identity federation', 'CIS benchmark compliance gaps'],
  },
  {
    slug: 'network-penetration-testing', icon: 'network',
    name: 'Network Penetration Testing',
    short: 'Internal & external network testing — exposed services, lateral movement, Active Directory attacks and segmentation bypasses.',
    tagline: 'Test your network the way a real intruder would — inside and out.',
    overview: 'Whether an attacker starts from the internet or from a compromised laptop, your network defenses decide how far they get. We perform external and internal network penetration testing — enumerating exposed services, exploiting weaknesses, and demonstrating lateral movement and privilege escalation.',
    focus: ['External attack-surface enumeration', 'Exposed & vulnerable services', 'Active Directory attack paths', 'Lateral movement & pivoting', 'Network segmentation bypass', 'Credential attacks & relay', 'Patch & configuration weaknesses', 'Firewall & egress filtering review'],
  },
  {
    slug: 'source-code-review', icon: 'code',
    name: 'Source Code Review (SCR)',
    short: 'Line-by-line security audit of your codebase to catch injection sinks, hardcoded secrets, crypto misuse and logic flaws scanners miss.',
    tagline: 'Catch vulnerabilities at the source — in the code itself.',
    overview: 'Black-box testing finds what is reachable; source-code review finds the root cause. Our engineers combine static analysis with manual review to trace untrusted data from source to sink, uncovering injection flaws, authentication gaps, secret leakage and insecure design that runtime testing alone would miss.',
    focus: ['Injection sinks (SQL, command, template)', 'Authentication & authorization logic', 'Hardcoded secrets & credentials', 'Cryptographic misuse', 'Insecure deserialization paths', 'Input validation & output encoding', 'Dependency & supply-chain risk', 'Business-logic & design flaws'],
  },
  {
    slug: 'wireless-security-testing', icon: 'wifi',
    name: 'Wireless Security Testing',
    short: 'Assessment of Wi-Fi infrastructure — rogue AP detection, WPA2/WPA3 attacks, captive-portal bypasses and guest-network isolation.',
    tagline: 'Make sure your wireless network is not an open door.',
    overview: 'Wireless extends your network beyond your walls. We assess your Wi-Fi infrastructure for weak encryption, rogue access points, and isolation failures — testing whether an attacker in the parking lot can reach your crown jewels.',
    focus: ['WPA2 / WPA3 attack resistance', 'Rogue & evil-twin access-point detection', 'Captive-portal & guest-network bypass', 'Wireless client attacks', 'Network isolation & segmentation', 'Enterprise auth (802.1X/EAP) review', 'Encryption & key-management review', 'Signal-leakage assessment'],
  },
  {
    slug: 'red-teaming-exercise', icon: 'red',
    name: 'Red Teaming Exercise',
    short: 'Full-scope adversary simulation — phishing, physical, network and application vectors combined to test real-world detection and response.',
    tagline: 'Simulate a real adversary and test your detection and response.',
    overview: 'A penetration test finds vulnerabilities; a red team tests whether you can detect and respond to a determined attacker. We emulate real threat-actor TTPs across phishing, network, physical and application vectors to measure your blue team\'s readiness against a goal-oriented intrusion.',
    focus: ['Goal-oriented adversary simulation', 'Phishing & social engineering', 'Initial access & payload delivery', 'Command-and-control & persistence', 'Lateral movement & privilege escalation', 'Data-exfiltration simulation', 'Detection & response evaluation (purple team)', 'MITRE ATT&CK mapped reporting'],
  },
  {
    slug: 'iot-security-testing', icon: 'iot',
    name: 'IoT Security Testing',
    short: 'Firmware analysis, hardware interfaces, radio protocols and companion-app testing for connected devices and embedded systems.',
    tagline: 'Secure connected devices from firmware to cloud.',
    overview: 'IoT devices blend hardware, firmware, radio and cloud — each a potential entry point. We test the full ecosystem: extracting and analyzing firmware, probing hardware debug interfaces, intercepting radio and network traffic, and assessing the companion apps and cloud APIs that control your devices.',
    focus: ['Firmware extraction & analysis', 'Hardware interfaces (UART/JTAG/SPI)', 'Radio protocol analysis (BLE/Zigbee/RF)', 'Companion mobile-app security', 'Device-to-cloud API security', 'Secure boot & update mechanisms', 'Hardcoded secrets in firmware', 'Physical tamper resistance'],
  },
  {
    slug: 'sdlc-consulting', icon: 'sdlc',
    name: 'Secure Development Life Cycle',
    short: 'Consulting to shift security left — threat modeling, secure design reviews, CI/CD pipeline hardening and developer training.',
    tagline: 'Build security in from day one — not bolt it on at the end.',
    overview: 'Fixing a vulnerability in production costs far more than preventing it in design. We help you embed security across your development life cycle — from threat modeling and secure design reviews to CI/CD security gates and hands-on developer training.',
    focus: ['Threat modeling & secure design review', 'Secure coding standards & training', 'CI/CD pipeline security gates', 'SAST / DAST / SCA tooling integration', 'Security requirements & user stories', 'Dependency & supply-chain governance', 'Security champions program', 'Maturity assessment (BSIMM/SAMM)'],
  },
  {
    slug: 'web3-audits', icon: 'web3',
    name: 'Web3 Audits',
    short: 'Smart-contract and protocol audits — reentrancy, oracle manipulation, access-control flaws, economic exploits and bridge security.',
    tagline: 'Audit your smart contracts before they go on-chain — and irreversible.',
    overview: 'On-chain, code is law and bugs are permanent. We audit smart contracts and DeFi protocols line by line — combining manual review with automated tooling to catch reentrancy, access-control flaws, oracle manipulation and the economic exploits that drain protocols.',
    focus: ['Reentrancy & call-flow attacks', 'Access-control & privilege flaws', 'Oracle & price manipulation', 'Integer overflow / underflow', 'Economic & flash-loan exploits', 'Bridge & cross-chain security', 'Gas optimization & DoS vectors', 'Upgradeability & proxy risks'],
  },
];

/* ---------- Case studies ---------- */
const CASES = [
  {
    slug: 'e-commerce-platform-penetration-testing', tag: 'E-Commerce',
    name: 'E-Commerce Platform Penetration Testing',
    short: 'Uncovered critical payment-flow and account-takeover vulnerabilities in a high-traffic storefront before peak season.',
    challenge: 'A fast-growing e-commerce platform was preparing for its biggest sales season yet. With millions in transactions on the line, they needed assurance that their checkout, payment and account systems could withstand a determined attacker.',
    approach: 'Our team performed a full web application penetration test across the storefront, customer accounts, payment integration and admin panel — combining manual testing with targeted business-logic abuse cases around discounts, refunds and order manipulation.',
    results: ['Critical account-takeover chain via password-reset flaw — fixed & re-verified', 'Payment-flow manipulation allowing price tampering at checkout', 'Multiple IDORs exposing other customers\' order history', 'All findings remediated and confirmed before the sales season launch'],
  },
  {
    slug: 'crm-web-application-data-protection', tag: 'SaaS / CRM',
    name: 'CRM Web Application Data Protection',
    short: 'Hardened a multi-tenant CRM against cross-tenant data leakage, securing sensitive customer records for thousands of end users.',
    challenge: 'A B2B SaaS CRM stored sensitive customer data for hundreds of client organizations in a shared multi-tenant architecture. A single cross-tenant flaw could expose one client\'s data to another — a catastrophic trust and compliance failure.',
    approach: 'We focused on tenant-isolation boundaries — systematically testing every data-access path across object-level and function-level authorization, and verifying that no API or UI route allowed one tenant to reach another\'s records.',
    results: ['Identified cross-tenant data-access flaws in core API endpoints', 'Demonstrated unauthorized access to other tenants\' contact records', 'Provided isolation-hardening guidance adopted across the platform', 'Re-test confirmed complete remediation of all tenant-isolation issues'],
  },
  {
    slug: 'fintech-app-api-penetration-testing', tag: 'Fintech',
    name: 'Fintech App API Penetration Testing',
    short: 'Identified broken object-level authorization in core banking APIs, preventing unauthorized access to financial transactions.',
    challenge: 'A fintech startup\'s mobile app was backed by a set of REST APIs handling transfers, balances and statements. Regulatory and customer trust demanded that these APIs be bulletproof against authorization abuse.',
    approach: 'We mapped the complete API surface from the mobile app, then ran a cross-account authorization matrix — testing every endpoint as one user against another user\'s objects to surface BOLA and BFLA flaws.',
    results: ['Critical BOLA exposing other users\' transactions and balances', 'Function-level authorization gaps on admin-only endpoints', 'JWT validation weaknesses in the authentication layer', 'Full remediation verified prior to the app\'s public launch'],
  },
];

/* ---------- Blog ---------- */
const POSTS = [
  {
    slug: 'llm-security-owasp-top-10', tag: 'AI Security', date: 'Feb 4, 2025',
    title: 'LLM Security: OWASP Top 10',
    excerpt: 'Prompt injection, data leakage, insecure plugin design — what the OWASP Top 10 for LLMs means for your AI features.',
    body: [
      'Large Language Models are being bolted onto products everywhere — chatbots, copilots, RAG search, autonomous agents. But the security community is still catching up, and the OWASP Top 10 for LLM Applications is the clearest map we have of where these systems break.',
      'Prompt injection sits at number one for good reason. When user input — or worse, content the model reads from a document or web page — can override your system instructions, an attacker can make the model ignore its guardrails, leak its context, or misuse any tool you have connected to it.',
      'Beyond injection, the list covers insecure output handling (treating model output as trusted), training-data poisoning, model denial of service, supply-chain risks in the model ecosystem, sensitive-information disclosure, insecure plugin and tool design, excessive agency, overreliance, and model theft.',
      'The takeaway: treat your LLM like any other untrusted, internet-facing component. Validate its inputs, sanitize its outputs, scope its tool permissions tightly, and never assume the model will respect a boundary that you have not technically enforced.',
    ],
  },
  {
    slug: 'jwt-json-web-token', tag: 'AppSec', date: 'Jan 2025',
    title: 'Get a Feel of JWT (JSON Web Token)',
    excerpt: 'From alg=none to key confusion — how JSON Web Tokens get broken in the wild and how to implement them safely.',
    body: [
      'JSON Web Tokens are everywhere in modern authentication — and they are a frequent source of critical vulnerabilities when implemented carelessly. A JWT is just three base64url-encoded parts: a header, a payload, and a signature.',
      'The classic attack is alg=none. If the server trusts the algorithm field in the token header, an attacker can set it to "none", strip the signature, and forge any payload they like — including elevating themselves to admin.',
      'Then there is key confusion: a server expecting an RS256 (asymmetric) token can sometimes be tricked into verifying an HS256 (symmetric) token using its public key as the HMAC secret — a key the attacker already knows.',
      'Defend by pinning the expected algorithm server-side, never trusting the header, keeping secrets long and random, validating every claim (issuer, audience, expiry), and rotating keys properly. Treat the token as attacker-controlled data until the signature is verified.',
    ],
  },
  {
    slug: 'bug-bounty-automation', tag: 'Automation', date: '2025',
    title: 'A Notification System for Your Bug Bounty Automation',
    excerpt: 'Building recon pipelines that surface real attack surface — and knowing when manual testing has to take over.',
    body: [
      'Recon is the foundation of any good security engagement, and automation lets you cover far more ground than manual enumeration alone. But automation is only useful if it tells you when something interesting changes.',
      'A solid pipeline continuously enumerates subdomains, resolves live hosts, fingerprints technologies, and crawls for new endpoints and JavaScript. The key is diffing: comparing today\'s results against yesterday\'s, and alerting only on what is new.',
      'A notification layer — pushing new subdomains, changed JS files, or fresh endpoints to Slack, Discord or Telegram — turns a passive pipeline into an active early-warning system. You hear about new attack surface the moment it appears.',
      'But automation finds surface, not bugs. The real vulnerabilities — business-logic abuse, complex authorization flaws, chained exploits — still require a human who understands the application. The best results come from automation that frees you to focus your manual testing where it matters.',
    ],
  },
];

/* ============================================================
   Shared layout
   ============================================================ */
function head(title, desc, depth = 0) {
  const root = depth === 0 ? '' : '../'.repeat(depth);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Ubuntu+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${root}css/style.css" />
</head>
<body>
  <div class="preloader" id="preloader" aria-hidden="true">
    <div class="preloader-shield">${svg('shield')}<div class="preloader-scan"></div></div>
    <p class="preloader-text mono">INITIALIZING<span class="dots"></span></p>
  </div>
  <div class="scroll-progress" id="scrollProgress" aria-hidden="true"></div>
  <div class="bg-grid" aria-hidden="true"></div>
  <div class="bg-glow" aria-hidden="true"></div>`;
}

function header(active = '', depth = 0) {
  const r = depth === 0 ? '' : '../'.repeat(depth);
  const cls = name => active === name ? ' active' : '';
  const serviceLinks = SERVICES.map(s =>
    `<a href="${r}services/${s.slug}.html" class="dropdown-link">${svg(s.icon, 'dd-icon')}<span>${s.name}</span></a>`
  ).join('\n          ');

  return `
  <header class="site-header" id="header">
    <div class="container nav-wrap">
      <a href="${r}index.html" class="logo" aria-label="Berettalabs home">
        <span class="logo-mark">${svg('shield')}</span>
        <span class="logo-text">BERETTA<span class="accent">LABS</span></span>
      </a>

      <nav class="main-nav" id="mainNav" aria-label="Main navigation">
        <a href="${r}index.html" class="nav-link${cls('home')}">Home</a>
        <a href="${r}about.html" class="nav-link${cls('about')}">About</a>

        <div class="nav-dropdown">
          <button class="nav-link dropdown-toggle${cls('services')}" aria-expanded="false">
            Services <svg class="caret" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="dropdown-menu">
            <a href="${r}services.html" class="dropdown-link dropdown-all">${svg('shield', 'dd-icon')}<span>All Services</span></a>
            ${serviceLinks}
          </div>
        </div>

        <a href="${r}case-studies.html" class="nav-link${cls('cases')}">Case Studies</a>
        <a href="${r}blog.html" class="nav-link${cls('blog')}">Blog</a>
        <a href="${r}faq.html" class="nav-link${cls('faq')}">FAQ</a>
        <a href="${r}contact.html" class="nav-link${cls('contact')}">Contact</a>
        <a href="${r}contact.html" class="btn btn-primary nav-cta">Get a Quote</a>
      </nav>

      <button class="nav-toggle" id="navToggle" aria-label="Toggle menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;
}

function footer(depth = 0) {
  const r = depth === 0 ? '' : '../'.repeat(depth);
  const svcCols = SERVICES.slice(0, 6).map(s => `<a href="${r}services/${s.slug}.html">${s.name.replace(' (APIST)', '').replace(' Penetration Testing', ' Pentest')}</a>`).join('\n        ');
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a href="${r}index.html" class="logo">
          <span class="logo-mark">${svg('shield')}</span>
          <span class="logo-text">BERETTA<span class="accent">LABS</span></span>
        </a>
        <p>Leading cybersecurity &amp; IT services firm. Expert threat detection, robust data protection, proactive defense against cyberattacks.</p>
        <div class="socials">
          <a href="https://facebook.com/berettalabs" aria-label="Facebook">FB</a>
          <a href="https://instagram.com/berettalabs" aria-label="Instagram">IG</a>
          <a href="https://linkedin.com/company/berettalabs" aria-label="LinkedIn">IN</a>
          <a href="https://twitter.com/berettalabs" aria-label="Twitter">X</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Quick Links</h4>
        <a href="${r}about.html">About Us</a>
        <a href="${r}services.html">Services</a>
        <a href="${r}case-studies.html">Case Studies</a>
        <a href="${r}blog.html">Blog &amp; News</a>
        <a href="${r}faq.html">FAQ</a>
        <a href="${r}contact.html">Contact Us</a>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        ${svcCols}
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <a href="tel:+918310223328">+91 83102 23328</a>
        <a href="mailto:info@berettalabs.com">info@berettalabs.com</a>
        <span>EON Free Zone, Kharadi,<br />Pune — MH, 411014</span>
      </div>
    </div>
    <div class="container footer-bottom">
      <p>© 2026 Berettalabs. All rights reserved.</p>
      <p class="mono">[ shield_status: <span class="accent">ACTIVE</span> ]</p>
    </div>
  </footer>

  <button class="back-to-top" id="backToTop" aria-label="Back to top">
    <svg viewBox="0 0 24 24" fill="none"><path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
  </button>

  <script src="${r}js/main.js"></script>
</body>
</html>`;
}

function page({ file, title, desc, active, depth = 0, body }) {
  const html = head(title, desc, depth) + header(active, depth) + '\n  <main>\n' + body + '\n  </main>\n' + footer(depth);
  const full = path.join(OUT, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, 'utf8');
  console.log('  ✓', file);
}

/* ---------- Reusable blocks ---------- */
function pageHero(kicker, title, sub) {
  return `
    <section class="page-hero">
      <div class="container reveal">
        <p class="kicker">// ${kicker}</p>
        <h1>${title}</h1>
        ${sub ? `<p class="page-hero-sub">${sub}</p>` : ''}
      </div>
    </section>`;
}

function ctaBanner(depth) {
  const r = depth === 0 ? '' : '../'.repeat(depth);
  return `
    <section class="cta-banner">
      <div class="container reveal">
        <h2>Your Attackers Aren't Waiting.<br /><span class="accent">Neither Should You.</span></h2>
        <a href="${r}contact.html" class="btn btn-primary btn-lg">Shield Up Today</a>
      </div>
    </section>`;
}

/* ============================================================
   HOME
   ============================================================ */
function buildHome() {
  const serviceCards = SERVICES.map(s => `
          <a href="services/${s.slug}.html" class="service-card reveal">
            <div class="service-icon">${svg(s.icon)}</div>
            <h3>${s.name}</h3>
            <p>${s.short}</p>
            <span class="text-link">Learn more →</span>
          </a>`).join('');

  const caseCards = CASES.map(c => `
          <a href="cases/${c.slug}.html" class="case-card reveal">
            <span class="case-tag">${c.tag}</span>
            <h3>${c.name}</h3>
            <p>${c.short}</p>
            <span class="text-link">Read the story →</span>
          </a>`).join('');

  const blogCards = POSTS.map(p => `
          <a href="blog/${p.slug}.html" class="blog-card reveal">
            <span class="blog-tag">${p.tag}</span>
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <span class="text-link">Read article →</span>
          </a>`).join('');

  const body = `
    <section class="hero" id="home">
      <canvas class="hero-net" id="netCanvas" aria-hidden="true"></canvas>
      <div class="container hero-grid">
        <div class="hero-content reveal">
          <p class="kicker"><span class="pulse-dot"></span> ULTIMATE CYBERSECURITY SOLUTION</p>
          <h1>We Secure Your<br /><span class="rotator accent" id="rotator" data-words="Web Apps,Mobile Apps,APIs,Cloud,Networks,Smart Contracts">Web Apps</span><br />So Attackers <span class="accent glitch" data-text="Can't.">Can't.</span></h1>
          <p class="lead">
            Berettalabs delivers expert threat detection, robust data protection and proactive
            defense against cyberattacks — powered by OSCP, CEH &amp; CISSP certified offensive
            security engineers with 8+ years in the field.
          </p>
          <div class="hero-actions">
            <a href="contact.html" class="btn btn-primary">Shield Up Today</a>
            <a href="services.html" class="btn btn-ghost">Explore Services</a>
          </div>
          <ul class="hero-badges"><li>OSCP</li><li>CEH</li><li>CISSP</li><li>CREST-aligned methodology</li></ul>
        </div>
        <div class="hero-terminal reveal" aria-hidden="true">
          <div class="terminal">
            <div class="terminal-bar">
              <span class="t-dot red"></span><span class="t-dot"></span><span class="t-dot"></span>
              <span class="terminal-title">root@berettalabs:~#</span>
            </div>
            <div class="terminal-body"><pre id="terminalText"></pre><span class="cursor">▊</span></div>
          </div>
          <div class="hero-card hero-card-1"><strong>150+</strong><span>Critical vulns found</span></div>
          <div class="hero-card hero-card-2"><strong>100%</strong><span>Manual-led testing</span></div>
        </div>
      </div>
    </section>

    <section class="stats" id="stats">
      <div class="container stats-grid">
        <div class="stat reveal"><strong class="counter" data-target="150">0</strong><span>+ Critical Vulnerabilities</span></div>
        <div class="stat reveal"><strong class="counter" data-target="230">0</strong><span>+ Assets Secured</span></div>
        <div class="stat reveal"><strong class="counter" data-target="34">0</strong><span>+ Satisfied Clients</span></div>
        <div class="stat reveal"><strong class="counter" data-target="100">0</strong><span>+ Audits Conducted</span></div>
      </div>
    </section>

    <section class="marquee-section" aria-label="Standards and frameworks we align with">
      <div class="marquee-label mono">// METHODOLOGY ALIGNED WITH INDUSTRY STANDARDS</div>
      <div class="marquee">
        <div class="marquee-track">
          ${['OWASP','PTES','NIST 800-115','MITRE ATT&CK','OSCP','CEH','CISSP','ISO 27001','OWASP MASVS','SANS','OWASP API Top 10','CREST']
            .concat(['OWASP','PTES','NIST 800-115','MITRE ATT&CK','OSCP','CEH','CISSP','ISO 27001','OWASP MASVS','SANS','OWASP API Top 10','CREST'])
            .map(x => `<span class="marquee-item">${x}</span>`).join('\n          ')}
        </div>
      </div>
    </section>

    <section class="about section" id="about">
      <div class="container about-grid">
        <div class="about-visual reveal">
          <div class="shield-frame">${svg('shield')}<div class="scan-line"></div></div>
        </div>
        <div class="about-content reveal">
          <p class="kicker">// ABOUT US</p>
          <h2>Certified Cybersecurity Expertise You Can Trust</h2>
          <p>Berettalabs is an award-winning offensive security firm based in Pune, India. Our team of certified hackers thinks like an attacker so your business never has to face one unprepared — from web apps to cloud infrastructure to smart contracts.</p>
          <ul class="check-list">
            <li>Manual, expert-led penetration testing — not just scanner output</li>
            <li>Clear, developer-friendly remediation with every finding</li>
            <li>Free re-assessment to verify your fixes actually hold</li>
            <li>OSCP, CEH &amp; CISSP certified engineers on every engagement</li>
          </ul>
          <a href="about.html" class="btn btn-primary">Know More About Us</a>
        </div>
      </div>
    </section>

    <section class="services section" id="services">
      <div class="container">
        <div class="section-head reveal">
          <p class="kicker">// OUR SERVICES</p>
          <h2>Full-Spectrum Offensive Security</h2>
          <p class="section-sub">Eleven specialized services. One goal: making your attack surface a dead end.</p>
        </div>
        <div class="services-grid">${serviceCards}</div>
      </div>
    </section>

    <section class="process section" id="process">
      <div class="container">
        <div class="section-head reveal"><p class="kicker">// HOW WE WORK</p><h2>Our Battle-Tested Process</h2></div>
        <ol class="process-grid">
          <li class="process-step reveal"><span class="step-num">01</span><h3>Pre-Engagement</h3><p>We scope your assets, define rules of engagement and align on objectives so testing is safe, legal and laser-focused.</p></li>
          <li class="process-step reveal"><span class="step-num">02</span><h3>Security Testing</h3><p>Certified engineers attack your systems with the same tools and creativity real adversaries use — manually and methodically.</p></li>
          <li class="process-step reveal"><span class="step-num">03</span><h3>Submission</h3><p>You receive a detailed report: every finding rated by severity, with proof-of-concept and step-by-step remediation.</p></li>
          <li class="process-step reveal"><span class="step-num">04</span><h3>Re-Assessment</h3><p>After your team patches, we re-test every issue to confirm the fixes hold — and certify your hardened posture.</p></li>
        </ol>
      </div>
    </section>

    <section class="cases section" id="case-studies">
      <div class="container">
        <div class="section-head reveal"><p class="kicker">// CASE STUDIES</p><h2>Real Engagements. Real Impact.</h2></div>
        <div class="cases-grid">${caseCards}</div>
      </div>
    </section>

    <section class="team section" id="team">
      <div class="container">
        <div class="section-head reveal"><p class="kicker">// THE TEAM</p><h2>Operators Behind the Shield</h2></div>
        <div class="team-grid">
          <article class="team-card reveal"><div class="avatar">KG</div><h3>Kapil G</h3><p>Founder &amp; CEO</p></article>
          <article class="team-card reveal"><div class="avatar">SG</div><h3>Shreyash G.</h3><p>Project Manager</p></article>
          <article class="team-card reveal"><div class="avatar">AS</div><h3>Anubhav S</h3><p>Product Manager</p></article>
        </div>
      </div>
    </section>

    <section class="testimonials section" id="testimonials">
      <div class="container">
        <div class="section-head reveal"><p class="kicker">// TESTIMONIALS</p><h2>What Our Clients Say</h2></div>
        <div class="carousel reveal" id="carousel">
          <div class="carousel-track" id="carouselTrack">
            <blockquote class="testimonial"><div class="quote-mark">"</div><p>Berettalabs found issues two previous vendors completely missed. Their report was the clearest we've ever received — our devs fixed everything in a week.</p><footer><span class="t-avatar">CT</span><span><strong>CTO</strong>Fintech Startup</span></footer></blockquote>
            <blockquote class="testimonial"><div class="quote-mark">"</div><p>Professional, responsive, and genuinely skilled. The free re-assessment after our fixes gave us real confidence going into our compliance audit.</p><footer><span class="t-avatar">SM</span><span><strong>Security Manager</strong>SaaS Company</span></footer></blockquote>
            <blockquote class="testimonial"><div class="quote-mark">"</div><p>They treated our product like their own. The business-logic flaws they uncovered would never show up in an automated scan.</p><footer><span class="t-avatar">CF</span><span><strong>Co-founder</strong>E-Commerce Platform</span></footer></blockquote>
            <blockquote class="testimonial"><div class="quote-mark">"</div><p>The red-team exercise was eye-opening. We discovered exactly where our detection gaps were and closed them before it mattered in the real world.</p><footer><span class="t-avatar">CO</span><span><strong>COO</strong>Logistics Platform</span></footer></blockquote>
            <blockquote class="testimonial"><div class="quote-mark">"</div><p>Fast, thorough, and easy to work with. The remediation guidance was specific enough that our engineers didn't have to guess at anything.</p><footer><span class="t-avatar">IM</span><span><strong>IT Manager</strong>Healthcare Provider</span></footer></blockquote>
            <blockquote class="testimonial"><div class="quote-mark">"</div><p>Our Web3 protocol audit gave our investors real confidence. Berettalabs caught an economic exploit path we never would have found on our own.</p><footer><span class="t-avatar">DV</span><span><strong>DevOps Lead</strong>DeFi Project</span></footer></blockquote>
          </div>
          <div class="carousel-controls">
            <button class="carousel-btn" id="carouselPrev" aria-label="Previous testimonial"><svg viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            <div class="carousel-dots" id="carouselDots"></div>
            <button class="carousel-btn" id="carouselNext" aria-label="Next testimonial"><svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
        </div>
      </div>
    </section>

    <section class="blog section" id="blog">
      <div class="container">
        <div class="section-head reveal"><p class="kicker">// BLOG &amp; NEWS</p><h2>From the Lab</h2></div>
        <div class="blog-grid">${blogCards}</div>
      </div>
    </section>
${ctaBanner(0)}`;

  page({ file: 'index.html', title: 'Berettalabs — Ultimate Cybersecurity Solution', desc: 'Berettalabs is a leading cybersecurity firm offering penetration testing, red teaming, cloud security and Web3 audits. OSCP, CEH & CISSP certified. Shield up today.', active: 'home', depth: 0, body });
}

/* ============================================================
   ABOUT
   ============================================================ */
function buildAbout() {
  const body = `${pageHero('ABOUT US', 'Certified Cybersecurity Expertise You Can Trust', 'An award-winning offensive security firm thinking like attackers so you never face one unprepared.')}

    <section class="section">
      <div class="container about-grid">
        <div class="about-visual reveal"><div class="shield-frame">${svg('shield')}<div class="scan-line"></div></div></div>
        <div class="about-content reveal">
          <p class="kicker">// WHO WE ARE</p>
          <h2>8+ Years on the Offensive Side of Security</h2>
          <p>Berettalabs is a cybersecurity and IT services firm based in Pune, India, founded on a simple belief: the best way to defend a system is to attack it first. Our certified engineers have spent years finding the flaws that automated tools miss — and helping organizations fix them before they become breaches.</p>
          <p>From startups to enterprises, across web, mobile, cloud, network and Web3, we deliver manual, expert-led security assessments with clear, actionable reporting and a free re-assessment on every engagement.</p>
          <ul class="check-list">
            <li>Manual, expert-led testing on every engagement</li>
            <li>OSCP, CEH &amp; CISSP certified team</li>
            <li>Developer-friendly remediation guidance</li>
            <li>Free re-assessment to verify your fixes</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="container stats-grid">
        <div class="stat reveal"><strong class="counter" data-target="150">0</strong><span>+ Critical Vulnerabilities</span></div>
        <div class="stat reveal"><strong class="counter" data-target="230">0</strong><span>+ Assets Secured</span></div>
        <div class="stat reveal"><strong class="counter" data-target="34">0</strong><span>+ Satisfied Clients</span></div>
        <div class="stat reveal"><strong class="counter" data-target="100">0</strong><span>+ Audits Conducted</span></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal"><p class="kicker">// WHY CHOOSE US</p><h2>What Sets Berettalabs Apart</h2></div>
        <div class="features-grid">
          <div class="feature-card reveal"><div class="service-icon">${svg('shield')}</div><h3>Proven Expertise</h3><p>8+ years and 100+ audits across every major attack surface. Our team holds the industry's most respected offensive-security certifications.</p></div>
          <div class="feature-card reveal"><div class="service-icon">${svg('code')}</div><h3>Manual-Led Testing</h3><p>Scanners find the obvious. We find the business-logic flaws, chained exploits and authorization gaps that only a human attacker would.</p></div>
          <div class="feature-card reveal"><div class="service-icon">${svg('sdlc')}</div><h3>Free Re-Assessment</h3><p>Once you've patched, we re-test every finding at no extra cost — so you know your fixes actually hold up.</p></div>
          <div class="feature-card reveal"><div class="service-icon">${svg('api')}</div><h3>Clear Reporting</h3><p>Every finding comes with severity, proof-of-concept and developer-friendly remediation steps your team can act on immediately.</p></div>
        </div>
      </div>
    </section>

    <section class="team section">
      <div class="container">
        <div class="section-head reveal"><p class="kicker">// THE TEAM</p><h2>Operators Behind the Shield</h2></div>
        <div class="team-grid">
          <article class="team-card reveal"><div class="avatar">KG</div><h3>Kapil G</h3><p>Founder &amp; CEO</p></article>
          <article class="team-card reveal"><div class="avatar">SG</div><h3>Shreyash G.</h3><p>Project Manager</p></article>
          <article class="team-card reveal"><div class="avatar">AS</div><h3>Anubhav S</h3><p>Product Manager</p></article>
        </div>
      </div>
    </section>
${ctaBanner(0)}`;

  page({ file: 'about.html', title: 'About Us — Berettalabs', desc: 'Berettalabs is an award-winning, OSCP/CEH/CISSP certified offensive security firm in Pune with 8+ years and 100+ audits.', active: 'about', depth: 0, body });
}

/* ============================================================
   SERVICES OVERVIEW
   ============================================================ */
function buildServicesIndex() {
  const cards = SERVICES.map(s => `
          <a href="services/${s.slug}.html" class="service-card reveal">
            <div class="service-icon">${svg(s.icon)}</div>
            <h3>${s.name}</h3>
            <p>${s.short}</p>
            <span class="text-link">Learn more →</span>
          </a>`).join('');

  const body = `${pageHero('OUR SERVICES', 'Full-Spectrum Offensive Security', 'Eleven specialized services covering every layer of your attack surface — web, mobile, API, cloud, network, wireless, IoT and Web3.')}

    <section class="section">
      <div class="container">
        <div class="services-grid">${cards}</div>
      </div>
    </section>

    <section class="process section">
      <div class="container">
        <div class="section-head reveal"><p class="kicker">// HOW WE WORK</p><h2>Our Battle-Tested Process</h2></div>
        <ol class="process-grid">
          <li class="process-step reveal"><span class="step-num">01</span><h3>Pre-Engagement</h3><p>We scope your assets, define rules of engagement and align on objectives.</p></li>
          <li class="process-step reveal"><span class="step-num">02</span><h3>Security Testing</h3><p>Certified engineers attack your systems manually and methodically.</p></li>
          <li class="process-step reveal"><span class="step-num">03</span><h3>Submission</h3><p>A detailed report with severity, PoC and remediation for every finding.</p></li>
          <li class="process-step reveal"><span class="step-num">04</span><h3>Re-Assessment</h3><p>We re-test every issue after you patch — free of charge.</p></li>
        </ol>
      </div>
    </section>
${ctaBanner(0)}`;

  page({ file: 'services.html', title: 'Our Services — Berettalabs', desc: 'Eleven offensive security services: web, mobile, API, cloud, network, source code review, wireless, red teaming, IoT, SDLC and Web3 audits.', active: 'services', depth: 0, body });
}

/* ============================================================
   INDIVIDUAL SERVICE PAGES  (services/<slug>.html, depth 1)
   ============================================================ */
function buildServicePages() {
  SERVICES.forEach((s, i) => {
    const focus = s.focus.map(f => `<li>${f}</li>`).join('\n            ');
    const others = SERVICES.filter(o => o.slug !== s.slug).slice(0, 3).map(o =>
      `<a href="${o.slug}.html" class="related-card"><div class="service-icon">${svg(o.icon)}</div><h4>${o.name}</h4></a>`
    ).join('\n          ');

    const body = `
    <section class="page-hero service-detail-hero">
      <div class="container reveal">
        <div class="service-detail-icon">${svg(s.icon)}</div>
        <p class="kicker">// SERVICE</p>
        <h1>${s.name}</h1>
        <p class="page-hero-sub">${s.tagline}</p>
        <a href="../contact.html" class="btn btn-primary">Get a Quote</a>
      </div>
    </section>

    <section class="section">
      <div class="container service-body-grid">
        <div class="service-main reveal">
          <h2>Overview</h2>
          <p>${s.overview}</p>

          <h2>What We Test</h2>
          <ul class="check-list two-col">
            ${focus}
          </ul>

          <h2>Our Methodology</h2>
          <ol class="mini-process">
            <li><strong>Scope &amp; Plan</strong><span>We define targets, rules of engagement and objectives before any testing begins.</span></li>
            <li><strong>Test &amp; Exploit</strong><span>Manual, certified-engineer testing combined with targeted tooling to find and safely validate flaws.</span></li>
            <li><strong>Report</strong><span>A clear report with severity ratings, proof-of-concept and developer-friendly remediation.</span></li>
            <li><strong>Re-Assess</strong><span>After you patch, we re-test every finding to confirm the fixes hold — free of charge.</span></li>
          </ol>
        </div>

        <aside class="service-aside reveal">
          <div class="aside-card">
            <h3>Ready to start?</h3>
            <p>Tell us about your scope and we'll respond within one business day with a tailored proposal.</p>
            <a href="../contact.html" class="btn btn-primary btn-block">Request This Service</a>
            <ul class="aside-contact">
              <li><span>Email</span><a href="mailto:info@berettalabs.com">info@berettalabs.com</a></li>
              <li><span>Phone</span><a href="tel:+918310223328">+91 83102 23328</a></li>
            </ul>
          </div>
          <div class="aside-card">
            <h3>Deliverables</h3>
            <ul class="check-list">
              <li>Executive summary</li>
              <li>Technical findings with PoC</li>
              <li>Severity &amp; risk ratings</li>
              <li>Remediation guidance</li>
              <li>Free re-assessment</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>

    <section class="section related-section">
      <div class="container">
        <div class="section-head reveal"><p class="kicker">// EXPLORE MORE</p><h2>Related Services</h2></div>
        <div class="related-grid">
          ${others}
        </div>
      </div>
    </section>
${ctaBanner(1)}`;

    page({ file: `services/${s.slug}.html`, title: `${s.name} — Berettalabs`, desc: s.short, active: 'services', depth: 1, body });
  });
}

/* ============================================================
   CASE STUDIES
   ============================================================ */
function buildCasesIndex() {
  const cards = CASES.map(c => `
          <a href="cases/${c.slug}.html" class="case-card reveal">
            <span class="case-tag">${c.tag}</span>
            <h3>${c.name}</h3>
            <p>${c.short}</p>
            <span class="text-link">Read the story →</span>
          </a>`).join('');

  const body = `${pageHero('CASE STUDIES', 'Real Engagements. Real Impact.', 'A look at how we have helped organizations across e-commerce, SaaS and fintech secure what matters most.')}
    <section class="section">
      <div class="container"><div class="cases-grid">${cards}</div></div>
    </section>
${ctaBanner(0)}`;

  page({ file: 'case-studies.html', title: 'Case Studies — Berettalabs', desc: 'Real Berettalabs engagements across e-commerce, SaaS/CRM and fintech — critical findings, remediated and re-verified.', active: 'cases', depth: 0, body });
}

function buildCasePages() {
  CASES.forEach(c => {
    const results = c.results.map(r => `<li>${r}</li>`).join('\n            ');
    const body = `
    <section class="page-hero">
      <div class="container reveal">
        <span class="case-tag">${c.tag}</span>
        <h1>${c.name}</h1>
        <p class="page-hero-sub">${c.short}</p>
      </div>
    </section>

    <section class="section">
      <div class="container narrow">
        <div class="reveal">
          <h2>The Challenge</h2>
          <p>${c.challenge}</p>
          <h2>Our Approach</h2>
          <p>${c.approach}</p>
          <h2>Key Results</h2>
          <ul class="check-list">
            ${results}
          </ul>
          <a href="../contact.html" class="btn btn-primary" style="margin-top:1.5rem">Start Your Engagement</a>
        </div>
      </div>
    </section>
${ctaBanner(1)}`;

    page({ file: `cases/${c.slug}.html`, title: `${c.name} — Case Study — Berettalabs`, desc: c.short, active: 'cases', depth: 1, body });
  });
}

/* ============================================================
   BLOG
   ============================================================ */
function buildBlogIndex() {
  const cards = POSTS.map(p => `
          <a href="blog/${p.slug}.html" class="blog-card reveal">
            <span class="blog-tag">${p.tag}</span>
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <span class="text-link">Read article →</span>
          </a>`).join('');

  const body = `${pageHero('BLOG &amp; NEWS', 'From the Lab', 'Research, write-ups and practical security guidance from the Berettalabs team.')}
    <section class="section">
      <div class="container"><div class="blog-grid">${cards}</div></div>
    </section>
${ctaBanner(0)}`;

  page({ file: 'blog.html', title: 'Blog & News — Berettalabs', desc: 'Security research and practical guidance from Berettalabs — LLM security, JWT attacks, bug-bounty automation and more.', active: 'blog', depth: 0, body });
}

function buildBlogPages() {
  POSTS.forEach(p => {
    const paras = p.body.map(b => `<p>${b}</p>`).join('\n          ');
    const body = `
    <section class="page-hero">
      <div class="container reveal">
        <span class="blog-tag">${p.tag} • ${p.date}</span>
        <h1>${p.title}</h1>
      </div>
    </section>

    <section class="section">
      <div class="container narrow article-body reveal">
        ${paras}
        <a href="../blog.html" class="text-link" style="display:inline-block;margin-top:1.5rem">← Back to all articles</a>
      </div>
    </section>
${ctaBanner(1)}`;

    page({ file: `blog/${p.slug}.html`, title: `${p.title} — Berettalabs Blog`, desc: p.excerpt, active: 'blog', depth: 1, body });
  });
}

/* ============================================================
   FAQ
   ============================================================ */
function buildFaq() {
  const faqs = [
    ['What is the difference between a vulnerability scan and a penetration test?', 'A scan is automated and finds known, surface-level issues. A penetration test is performed by certified human experts who manually exploit and chain vulnerabilities — including business-logic flaws and authorization gaps that scanners cannot find.'],
    ['How long does an engagement take?', 'It depends on scope. A focused web-app test may take 1–2 weeks, while a full red-team or large cloud assessment can run several weeks. We give you a clear timeline in the proposal after scoping.'],
    ['Do you offer re-testing after we fix the issues?', 'Yes — a free re-assessment is included in every engagement. Once your team patches the findings, we re-test each one to confirm the fixes actually hold.'],
    ['Will testing disrupt our production systems?', 'We agree rules of engagement up front and test carefully to avoid disruption. Where appropriate, we work against staging environments or schedule intrusive tests during agreed windows.'],
    ['What certifications does your team hold?', 'Our engineers hold industry-recognized certifications including OSCP, CEH and CISSP, backed by 8+ years of hands-on offensive security experience.'],
    ['How do you handle the sensitive data you find?', 'All findings and data are handled under strict confidentiality, encrypted in transit and at rest, and securely destroyed after the engagement per our data-handling policy and any NDA in place.'],
    ['What do we receive at the end?', 'A detailed report with an executive summary, every finding rated by severity, proof-of-concept evidence, and clear, developer-friendly remediation guidance — plus a re-assessment once you have patched.'],
  ];
  const items = faqs.map(([q, a]) => `
          <div class="faq-item reveal">
            <button class="faq-q">${q}<span class="faq-icon">+</span></button>
            <div class="faq-a"><p>${a}</p></div>
          </div>`).join('');

  const body = `${pageHero('FAQ', 'Frequently Asked Questions', 'Everything you need to know about working with Berettalabs.')}
    <section class="section">
      <div class="container narrow">
        <div class="faq-list">${items}</div>
      </div>
    </section>
${ctaBanner(0)}`;

  page({ file: 'faq.html', title: 'FAQ — Berettalabs', desc: 'Answers to common questions about Berettalabs penetration testing engagements, timelines, re-testing, certifications and reporting.', active: 'faq', depth: 0, body });
}

/* ============================================================
   CONTACT
   ============================================================ */
function buildContact() {
  const opts = SERVICES.map(s => `<option>${s.name}</option>`).join('\n              ');
  const body = `${pageHero('CONTACT US', 'Make an Appointment', 'Tell us about your assets and threat model — we\'ll respond within one business day with a scoped proposal.')}

    <section class="section">
      <div class="container contact-grid">
        <div class="contact-info reveal">
          <p class="kicker">// GET IN TOUCH</p>
          <h2>Let's Talk Security</h2>
          <p>Whether you need a one-off penetration test or an ongoing security partner, we're ready to help you shield up.</p>
          <ul class="contact-list">
            <li><span class="ci-label">Phone</span><a href="tel:+918310223328">+91 83102 23328</a></li>
            <li><span class="ci-label">Email</span><a href="mailto:info@berettalabs.com">info@berettalabs.com</a></li>
            <li><span class="ci-label">Office</span><span>EON Free Zone, Kharadi, Pune — MH, 411014</span></li>
          </ul>
          <div class="socials">
            <a href="https://facebook.com/berettalabs" aria-label="Facebook">FB</a>
            <a href="https://instagram.com/berettalabs" aria-label="Instagram">IG</a>
            <a href="https://linkedin.com/company/berettalabs" aria-label="LinkedIn">IN</a>
            <a href="https://twitter.com/berettalabs" aria-label="Twitter">X</a>
          </div>
        </div>

        <form class="contact-form reveal" id="contactForm" action="mailto:info@berettalabs.com" method="post">
          <div class="form-row">
            <label>Name<input type="text" name="name" placeholder="Your name" required /></label>
            <label>Email<input type="email" name="email" placeholder="you@company.com" required /></label>
          </div>
          <label>Service
            <select name="service">
              ${opts}
            </select>
          </label>
          <label>Message<textarea name="message" rows="5" placeholder="Tell us about your project..." required></textarea></label>
          <button type="submit" class="btn btn-primary btn-lg">Send Request</button>
        </form>
      </div>
    </section>`;

  page({ file: 'contact.html', title: 'Contact Us — Berettalabs', desc: 'Get in touch with Berettalabs for penetration testing, red teaming and security audits. Phone +91 83102 23328, info@berettalabs.com, Pune.', active: 'contact', depth: 0, body });
}

/* ============================================================
   RUN
   ============================================================ */
console.log('Building Berettalabs site...');
buildHome();
buildAbout();
buildServicesIndex();
buildServicePages();
buildCasesIndex();
buildCasePages();
buildBlogIndex();
buildBlogPages();
buildFaq();
buildContact();
console.log('Done. ' + (2 + SERVICES.length + 1 + 1 + CASES.length + 1 + POSTS.length + 1 + 1) + ' pages generated.');
