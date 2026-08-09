/* Smile Dental Habitat — site behaviour */
(function () {
  'use strict';

  /* ---- theme (dark default, remembered) ---- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem('sdh-theme'); } catch (e) {}
  root.setAttribute('data-theme', stored || 'dark');

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-theme-toggle]');
    if (!t) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('sdh-theme', next); } catch (err) {}
  });

  /* ---- mobile menu ---- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-menu]');
    if (!b) return;
    var list = document.getElementById('nav-links');
    if (!list) return;
    var open = list.classList.toggle('open');
    b.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- before / after sliders ---- */
  document.querySelectorAll('.ba').forEach(function (box) {
    var after = box.querySelector('.after-img');
    var handle = box.querySelector('.ba-handle');
    if (!after || !handle) return;

    function set(pct) {
      pct = Math.max(0, Math.min(100, pct));
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      handle.style.left = pct + '%';
    }

    function fromEvent(ev) {
      var r = box.getBoundingClientRect();
      var x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left;
      set((x / r.width) * 100);
    }

    var dragging = false;
    box.addEventListener('pointerdown', function (ev) {
      dragging = true; box.setPointerCapture(ev.pointerId); fromEvent(ev);
    });
    box.addEventListener('pointermove', function (ev) {
      if (dragging) fromEvent(ev);
    });
    box.addEventListener('pointerup', function () { dragging = false; });
    box.addEventListener('pointercancel', function () { dragging = false; });

    /* keyboard */
    box.setAttribute('tabindex', '0');
    box.addEventListener('keydown', function (ev) {
      var cur = parseFloat(handle.style.left) || 50;
      if (ev.key === 'ArrowLeft') { set(cur - 4); ev.preventDefault(); }
      if (ev.key === 'ArrowRight') { set(cur + 4); ev.preventDefault(); }
    });
  });

  /* ---- gallery filters ---- */
  var filters = document.querySelectorAll('[data-filter]');
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        filters.forEach(function (b) {
          b.classList.toggle('btn-gold', b === btn);
          b.classList.toggle('btn-ghost', b !== btn);
        });
        document.querySelectorAll('[data-cat]').forEach(function (item) {
          var show = f === 'all' || item.getAttribute('data-cat') === f;
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---- footer year ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
