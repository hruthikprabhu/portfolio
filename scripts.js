/* script.js
   Site behavior:
   - Theme toggle (persisted)
   - Mobile nav toggle
   - Smooth offset for anchor links (account for sticky header)
   - Fade-in-on-scroll using IntersectionObserver
   - Simple contact form validation and feedback
*/

/* ===== Utilities ===== */
const qs = (sel, ctx=document) => ctx.querySelector(sel);
const qsa = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

/* ===== Theme Toggle ===== */
const themeToggle = qs('#theme-toggle');
const root = document.documentElement;

function setTheme(theme) {
  root.setAttribute('data-theme', theme);
  try { localStorage.setItem('theme', theme); } catch (e) {}
}
function toggleTheme() {
  const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

/* ===== Mobile Nav Toggle ===== */
const mobileToggle = qs('#mobile-nav-toggle');
const mobileNav = qs('#mobile-nav');

if (mobileToggle && mobileNav) {
  mobileToggle.addEventListener('click', () => {
    const open = mobileNav.hasAttribute('hidden') ? false : true;
    if (open) {
      mobileNav.setAttribute('hidden', '');
      mobileToggle.setAttribute('aria-expanded', 'false');
    } else {
      mobileNav.removeAttribute('hidden');
      mobileToggle.setAttribute('aria-expanded', 'true');
    }
  });

  // Close mobile nav when a link is clicked
  mobileNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      mobileNav.setAttribute('hidden', '');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ===== Smooth Scroll Offset Fix (sticky header) ===== */
const header = qs('#header');
const headerHeight = () => header ? header.getBoundingClientRect().height : 0;

qsa('a[href^="#"]').forEach(a => {
  // Let native smooth scroll handle visual; we perform an offset scroll on click
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight() - 12;
    window.scrollTo({ top, behavior: 'smooth' });
    // If mobile nav is open, close it
    if (mobileNav && !mobileNav.hasAttribute('hidden')) {
      mobileNav.setAttribute('hidden', '');
      mobileToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

/* ===== Fade-in on Scroll ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      // Optional: unobserve if we don't need to animate again
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

qsa('.fade-in').forEach(el => observer.observe(el));

/* ===== Contact Form Validation ===== */
const form = qs('#contact-form');
if (form) {
  const nameInput = qs('#name', form);
  const emailInput = qs('#email', form);
  const msgInput = qs('#message', form);
  const feedback = qs('#form-feedback', form);

  const validators = {
    name: v => v.trim().length >= 2 || 'Please enter your name (2+ characters).',
    email: v => /^\S+@\S+\.\S+$/.test(v) || 'Please enter a valid email address.',
    message: v => v.trim().length >= 10 || 'Message should be at least 10 characters.'
  };

  function showError(input, message) {
    const err = qs(`#${input.id}-error`, form);
    if (err) err.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateField(input) {
    const rule = validators[input.name];
    if (!rule) return true;
    const result = rule(input.value);
    const ok = result === true;
    showError(input, ok ? '' : result);
    return ok;
  }

  [nameInput, emailInput, msgInput].forEach(i => {
    i.addEventListener('input', () => validateField(i));
    i.addEventListener('blur', () => validateField(i));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const valid = [nameInput, emailInput, msgInput].map(validateField).every(Boolean);
    if (!valid) {
      feedback.textContent = 'Please fix the errors above and try again.';
      feedback.style.color = '#ef4444';
      return;
    }

    // Simulate successful submission (replace with real endpoint or mailto if desired)
    feedback.textContent = 'Sending…';
    feedback.style.color = '';
    setTimeout(() => {
      feedback.textContent = 'Thanks — your message has been sent!';
      feedback.style.color = 'var(--accent)';
      form.reset();
    }, 700);
  });
}

/* ===== Footer Year ===== */
const yearEl = qs('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
