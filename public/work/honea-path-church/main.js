// Shared site behavior: nav scroll state, reveal-on-scroll, mobile menu.
// Used by every page (index.html, leadership.html, ...).
(function () {
  // Page-load fade-in
  requestAnimationFrame(() => {
    document.body.classList.add('is-ready');
  });

  const header = document.getElementById('siteHeader');

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (header) header.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  const toggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => navLinks.classList.remove('open'))
    );
  }
})();
