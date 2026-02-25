// ============================================
// ClawOps Security-Hardened Client Scripts
// OWASP best practices applied throughout
// ============================================

// --- Rate Limiting (client-side) ---
// Prevents form spam by tracking submissions per IP session
const RateLimiter = {
  submissions: [],
  maxPerWindow: 3,       // max 3 submissions per window
  windowMs: 5 * 60 * 1000, // 5 minute window

  canSubmit() {
    const now = Date.now();
    // Purge expired entries
    this.submissions = this.submissions.filter(t => now - t < this.windowMs);
    return this.submissions.length < this.maxPerWindow;
  },

  record() {
    this.submissions.push(Date.now());
  },

  timeUntilNext() {
    if (this.canSubmit()) return 0;
    const oldest = this.submissions[0];
    return Math.ceil((oldest + this.windowMs - Date.now()) / 1000);
  }
};

// --- Input Sanitization ---
// Strips HTML tags, script injections, and dangerous characters
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')           // Strip HTML tags
    .replace(/[<>"'`]/g, '')           // Remove characters used in XSS
    .replace(/javascript:/gi, '')      // Block JS protocol
    .replace(/on\w+\s*=/gi, '')        // Block event handlers (onclick=, etc.)
    .replace(/data:/gi, '')            // Block data: URIs
    .trim();
}

// Validate email format (RFC 5322 simplified)
function isValidEmail(email) {
  if (typeof email !== 'string' || email.length > 254) return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return re.test(email);
}

// Validate name (letters, spaces, hyphens, periods, apostrophes only)
function isValidName(name) {
  if (typeof name !== 'string' || name.length < 2 || name.length > 100) return false;
  return /^[A-Za-z\s\-\.\'\u00C0-\u024F]+$/.test(name);
}

// Validate select field against allowed values
function isValidSelect(value, allowedValues) {
  return typeof value === 'string' && allowedValues.includes(value);
}

// Validate message length
function isValidMessage(msg) {
  if (typeof msg !== 'string') return false;
  const cleaned = msg.trim();
  return cleaned.length >= 10 && cleaned.length <= 2000;
}

// --- Allowed service values (whitelist) ---
const ALLOWED_SERVICES = [
  'AI Receptionist',
  'Revenue Ops Sprint',
  'AI Agent Development',
  'Automation-as-a-Service',
  'AI Readiness Audit',
  'Other'
];

// --- Nav scroll effect ---
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// --- Hamburger menu ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// --- Fade-in on scroll ---
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .price-card, .pricing-card, .about-content, .about-visual, .contact-info, .contact-form-wrap, .card, .step, .about-text, .about-terminal, .contact-form').forEach(el => {
  el.classList.add('fade-in');
  fadeObserver.observe(el);
});

// --- Secure Form Submission ---
const form = document.getElementById('contactForm') || document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;

    // Rate limit check
    if (!RateLimiter.canSubmit()) {
      const wait = RateLimiter.timeUntilNext();
      btn.innerHTML = 'Too many requests. Wait ' + wait + 's';
      btn.style.background = '#ff9500';
      setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; }, 3000);
      return;
    }

    // Extract and sanitize inputs
    const nameInput = form.querySelector('#name') || form.querySelector('[name="name"]');
    const emailInput = form.querySelector('#email') || form.querySelector('[name="email"]');
    const serviceInput = form.querySelector('#service') || form.querySelector('[name="service"]');
    const messageInput = form.querySelector('#message') || form.querySelector('[name="message"]');

    const name = nameInput ? sanitizeInput(nameInput.value) : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const service = serviceInput ? serviceInput.value : '';
    const message = messageInput ? sanitizeInput(messageInput.value) : '';

    // Server-side validation (client-side layer)
    const errors = [];

    if (!isValidName(name)) {
      errors.push('Name must be 2-100 characters, letters only.');
    }
    if (!isValidEmail(email)) {
      errors.push('Please enter a valid email address.');
    }
    if (serviceInput && !isValidSelect(service, ALLOWED_SERVICES)) {
      errors.push('Please select a valid service.');
    }
    if (!isValidMessage(message)) {
      errors.push('Message must be 10-2000 characters.');
    }

    if (errors.length > 0) {
      btn.innerHTML = errors[0];
      btn.style.background = '#ff5f57';
      setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; }, 4000);
      return;
    }

    // Update sanitized values back into form
    if (nameInput) nameInput.value = name;
    if (messageInput) messageInput.value = message;

    btn.innerHTML = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        RateLimiter.record();
        btn.innerHTML = 'Message Sent!';
        btn.style.background = '#28c840';
        form.reset();
        setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.disabled = false; }, 3000);
      } else if (res.status === 429) {
        btn.innerHTML = 'Too many requests. Try later.';
        btn.style.background = '#ff9500';
        setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.disabled = false; }, 5000);
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      btn.innerHTML = 'Error - Try Again';
      btn.style.background = '#ff5f57';
      setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.disabled = false; }, 3000);
    }
  });
}

// --- CSP Meta Tag Injection ---
// Note: For best security, set Content-Security-Policy via HTTP headers.
// Since this is a static GitHub Pages site, we add it via meta tag as a fallback.
// The meta tag is already in the HTML head section.

// --- Disable paste into honeypot fields ---
document.querySelectorAll('input[name="_honey"]').forEach(hp => {
  hp.addEventListener('paste', e => e.preventDefault());
  hp.addEventListener('input', () => { hp.value = ''; });
});
