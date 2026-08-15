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

  /* ---- mobile clinic action sheet ---- */
  (function () {
    var triggers = document.querySelectorAll('.mobile-bar [data-sheet]');
    if (!triggers.length) return;

    var clinics = [
      { name: 'Vaibhav Khand', note: 'Near Shipra Mall', phone: '9582884501', wa: '919582884501', maps: 'https://www.google.com/maps/dir//28.634395513436,77.364056796661' },
      { name: 'Ahinsa Khand-2', note: 'GC Centrum Market', phone: '8700043550', wa: '918700043550', maps: 'https://www.google.com/maps/dir//28.641755640231782,77.38342758268118' }
    ];

    var actions = {
      call:       { title: 'Which clinic to call?' },
      whatsapp:   { title: 'Which clinic on WhatsApp?' },
      directions: { title: 'Directions to which clinic?' }
    };

    function linkFor(kind, c) {
      if (kind === 'call') return { href: 'tel:+91' + c.phone, ext: false };
      if (kind === 'whatsapp') return { href: 'https://wa.me/' + c.wa + '?text=' + encodeURIComponent("Hi, I'd like to book an appointment at Smile Dental Habitat, " + c.name + '.'), ext: true };
      return { href: c.maps, ext: true };
    }

    /* build the sheet once */
    var overlay = document.createElement('div');
    overlay.className = 'sheet-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">' +
        '<div class="sheet-grip"></div>' +
        '<div class="sheet-head">' +
          '<span class="sheet-title" id="sheet-title"></span>' +
          '<button class="sheet-close" type="button" aria-label="Close">&times;</button>' +
        '</div>' +
        '<div class="sheet-body"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    var sheet = overlay.querySelector('.sheet');
    var titleEl = overlay.querySelector('#sheet-title');
    var body = overlay.querySelector('.sheet-body');
    var lastFocus = null;

    function open(kind) {
      var cfg = actions[kind];
      if (!cfg) return;
      titleEl.textContent = cfg.title;
      body.innerHTML = '';
      clinics.forEach(function (c) {
        var l = linkFor(kind, c);
        var a = document.createElement('a');
        a.className = 'sheet-opt';
        a.href = l.href;
        if (l.ext) { a.target = '_blank'; a.rel = 'noopener'; }
        a.innerHTML = '<span class="sheet-opt-name">' + c.name + '</span>' +
          '<span class="sheet-opt-sub">' + c.note + ' &middot; ' + c.phone + '</span>';
        a.addEventListener('click', function () { setTimeout(close, 60); });
        body.appendChild(a);
      });
      lastFocus = document.activeElement;
      overlay.hidden = false;
      /* force reflow so the transition runs */
      void overlay.offsetWidth;
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      var first = body.querySelector('.sheet-opt');
      if (first) first.focus();
    }

    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      window.setTimeout(function () { overlay.hidden = true; }, 300);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn.getAttribute('data-sheet')); });
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target.closest('.sheet-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) close();
    });
  })();

  /* ---- footer year ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
