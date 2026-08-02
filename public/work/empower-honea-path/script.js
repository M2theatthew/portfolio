document.addEventListener('DOMContentLoaded', function () {
  var btn = document.querySelector('.menu-btn');
  var links = document.querySelector('nav.links');
  if (btn && links) {
    btn.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // Scroll-reveal: tag common content blocks, then fade/slide them in
  // as they enter the viewport. Degrades safely without JS since the
  // .reveal opacity/transform rules only apply under html.js (see CSS).
  var revealSelectors = [
    '.section-head', '.card', '.hex-photo', '.person',
    '.stat-strip .stat', '.month-block', '.callout', '.badge-list'
  ];
  var revealEls = document.querySelectorAll(revealSelectors.join(','));

  if ('IntersectionObserver' in window && revealEls.length) {
    revealEls.forEach(function (el) { el.classList.add('reveal'); });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { observer.observe(el); });
  }
});
