/**
 * SK Sahanawaz Ahamad — Portfolio JavaScript
 * Handles: particles, typed text, scroll animations, counters,
 *          navbar, mobile menu, contact form, scroll-to-top
 */

'use strict';

/* ─────────────────────── UTILITY ──────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────── SCROLL PROGRESS ──────────── */
function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${(scrolled / total) * 100}%`;
  }, { passive: true });
}

/* ─────────────────────── NAVBAR ───────────────────── */
function initNavbar() {
  const nav  = $('#navbar');
  const ham  = $('#hamburger');
  const menu = $('#nav-links');
  if (!nav || !ham || !menu) return;

  // Scroll-based background
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile toggle
  ham.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on nav-link click
  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      ham.classList.remove('open');
      ham.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Active section highlight
  const sections = $$('section[id]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('.nav-link').forEach(l => l.classList.remove('active'));
        const active = $(`[href="#${entry.target.id}"]`, nav);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => observer.observe(s));
}

/* ─────────────────────── TYPED TEXT ───────────────── */
function initTypedText() {
  const el = $('#typed-text');
  if (!el) return;

  const phrases = [
    'Senior React Native Developer',
    'iOS & Android Expert',
    'Cross-Platform Architect',
    'App Store Specialist',
    'Mobile UI Engineer',
    'Redux & Firebase Pro',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let pauseMs   = 0;

  function tick() {
    const current = phrases[phraseIdx];

    if (deleting) {
      charIdx--;
      el.textContent = current.slice(0, charIdx);
    } else {
      charIdx++;
      el.textContent = current.slice(0, charIdx);
    }

    let delay = deleting ? 45 : 80;

    if (!deleting && charIdx === current.length) {
      // Pause at end
      deleting = true;
      delay = 2200;
    } else if (deleting && charIdx === 0) {
      deleting   = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
      delay = 400;
    }

    setTimeout(tick, delay);
  }

  setTimeout(tick, 1200);
}

/* ─────────────────────── PARTICLES ────────────────── */
function initParticles() {
  const canvas = $('#particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H, animId;

  function resize() {
    const section = canvas.parentElement;
    W = canvas.width  = section.offsetWidth;
    H = canvas.height = section.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.r    = Math.random() * 1.5 + 0.4;
      this.vx   = (Math.random() - 0.5) * 0.35;
      this.vy   = (Math.random() - 0.5) * 0.35;
      this.alpha= Math.random() * 0.5 + 0.1;
      // Randomly pick cyan, purple, or white
      const palette = ['0,212,255', '124,58,237', '236,72,153', '255,255,255'];
      this.color = palette[Math.floor(Math.random() * palette.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha})`;
      ctx.fill();
    }
  }

  function init() {
    resize();
    const count = Math.min(Math.floor((W * H) / 9000), 120);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(draw);
  }

  init();
  draw();

  // Throttled resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { init(); }, 200);
  });

  // Pause when hero not visible (performance)
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animId) draw();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0 });
  observer.observe(canvas.parentElement);
}

/* ─────────────────────── SCROLL REVEAL ────────────── */
function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => obs.observe(el));
}

/* ─────────────────────── COUNTERS ─────────────────── */
function initCounters() {
  const counters = $$('.counter-number[data-target]');
  if (!counters.length) return;

  const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(ease(progress) * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
}

/* ─────────────────────── SCROLL-TO-TOP ────────────── */
function initScrollTop() {
  const btn = $('#scroll-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.hidden = window.scrollY < 500;
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ─────────────────────── CONTACT FORM ─────────────── */
function initContactForm() {
  const form    = $('#contact-form');
  const success = $('#form-success');
  if (!form || !success) return;

  const fields = {
    name:    { el: $('#contact-name'),    err: $('#name-error'),    msg: 'Please enter your name.'          },
    email:   { el: $('#contact-email'),   err: $('#email-error'),   msg: 'Please enter a valid email.'      },
    subject: { el: $('#contact-subject'), err: $('#subject-error'), msg: 'Please enter a subject.'          },
    message: { el: $('#contact-message'), err: $('#message-error'), msg: 'Please enter your message.'       },
  };

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate(key, field) {
    const val = field.el.value.trim();
    let valid = val.length > 0;
    if (key === 'email') valid = emailRe.test(val);
    field.el.classList.toggle('error', !valid);
    field.err.textContent = valid ? '' : field.msg;
    return valid;
  }

  // Live validation
  Object.entries(fields).forEach(([key, field]) => {
    field.el.addEventListener('blur', () => validate(key, field));
    field.el.addEventListener('input', () => {
      if (field.el.classList.contains('error')) validate(key, field);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const allValid = Object.entries(fields).every(([k, f]) => validate(k, f));
    if (!allValid) return;

    const btn = $('#btn-send');
    btn.disabled = true;
    btn.textContent = 'Sending…';

    // Simulate async submit (replace with real API call)
    setTimeout(() => {
      form.reset();
      success.hidden = false;
      btn.disabled = false;
      btn.innerHTML = 'Send Message &#10148;';
      // Auto-hide after 6s
      setTimeout(() => { success.hidden = true; }, 6000);
    }, 1200);
  });
}

/* ─────────────────────── SMOOTH ANCHOR SCROLL ─────── */
function initSmoothAnchors() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = $(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─────────────────────── FOOTER YEAR ──────────────── */
function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────── HOVER TILT (PROJECT CARDS) ─ */
function initCardTilt() {
  $$('.project-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 5}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ─────────────────────── SKILL CARD GLOW ──────────── */
function initSkillHover() {
  $$('.skill-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

/* ─────────────────────── THEME SWITCHER ───────────── */
function initTheme() {
  const toggle = $('#theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light-theme');
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
  });
}

/* ─────────────────────── ENTRY POINT ──────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initScrollProgress();
  initNavbar();
  initTypedText();
  initParticles();
  initReveal();
  initCounters();
  initScrollTop();
  initContactForm();
  initSmoothAnchors();
  initYear();
  initCardTilt();
  initSkillHover();
});
