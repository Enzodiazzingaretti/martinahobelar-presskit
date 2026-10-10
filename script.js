/* Martina Høbelar — press kit
   Solo comportamiento: el contenido vive entero en index.html. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     Barra: transparente sobre la foto, negra después del inicio
     ---------------------------------------------------------- */
  var bar = document.getElementById('bar');
  var heroName = document.querySelector('.hero__name');
  var menuOpen = false;

  function paintBar() {
    bar.classList.toggle('is-solid', menuOpen || window.scrollY > 8);
  }

  if (bar) {
    paintBar();
    window.addEventListener('scroll', paintBar, { passive: true });
  }

  // El nombre chico de la barra aparece cuando el grande ya no se ve
  if (bar && heroName && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('has-hero-name', entries[0].isIntersecting);
    }, { rootMargin: '-64px 0px 0px 0px' }).observe(heroName);
  } else if (bar) {
    bar.classList.remove('has-hero-name');
  }

  /* ----------------------------------------------------------
     Menú de celular
     ---------------------------------------------------------- */
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('menu');

  function setMenu(open) {
    menuOpen = open;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Cerrar' : 'Menú';
    document.documentElement.style.overflow = open ? 'hidden' : '';
    bar.classList.toggle('is-open', open);
    paintBar();
  }

  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 821px)').addEventListener('change', function (e) {
      if (e.matches && !menu.hidden) setMenu(false);
    });
  }

  /* ----------------------------------------------------------
     Inicio: las tres fotos que eligió, en fundido lento
     ---------------------------------------------------------- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-slide]'));
  var HOLD = 7500;   // tiempo en pantalla de cada foto
  var FADE = 2400;   // igual a la transición de .hero__slide

  function loadSlide(slide) {
    var img = slide.querySelector('img');
    if (img && img.dataset.src && !img.getAttribute('src')) {
      img.src = img.dataset.src;
    }
    return img && img.decode ? img.decode().catch(function () {}) : Promise.resolve();
  }

  if (slides.length > 1 && !reduceMotion) {
    var current = 0;
    var ready = [true];

    window.addEventListener('load', function () {
      slides.slice(1).forEach(function (slide, i) {
        loadSlide(slide).then(function () { ready[i + 1] = true; });
      });

      setInterval(function () {
        if (document.hidden) return;
        var next = (current + 1) % slides.length;
        if (!ready[next]) return;

        var leaving = slides[current];
        leaving.classList.add('is-leaving');
        leaving.classList.remove('is-active');
        slides[next].classList.add('is-active');
        setTimeout(function () { leaving.classList.remove('is-leaving'); }, FADE + 100);
        current = next;
      }, HOLD);
    });
  }

  /* ----------------------------------------------------------
     Sets: un reproductor y la lista; la miniatura se cambia por
     el video recién cuando alguien toca play
     ---------------------------------------------------------- */
  var player = document.getElementById('player');
  var poster = document.getElementById('playerPoster');
  var thumb = document.getElementById('playerThumb');
  var now = document.getElementById('playerNow');
  var tracks = Array.prototype.slice.call(document.querySelectorAll('.track'));
  var currentId = tracks.length ? tracks[0].dataset.id : null;

  function trackInfo(btn) {
    var nameEl = btn.querySelector('.track__name');
    var small = nameEl.querySelector('small');
    var name = nameEl.firstChild.textContent.trim();
    return {
      name: name,
      detail: small ? small.textContent.trim() : '',
      bpm: btn.querySelector('.track__bpm').textContent.trim()
    };
  }

  function paintNow(btn) {
    var info = trackInfo(btn);
    now.textContent = info.name + (info.detail ? ' (' + info.detail + ')' : '') + ' ';
    var span = document.createElement('span');
    span.textContent = info.bpm;
    now.appendChild(span);
    return info;
  }

  function play(id, info) {
    var frame = player.querySelector('.player__frame');
    if (!frame) {
      frame = document.createElement('div');
      frame.className = 'player__frame';
      var current = player.querySelector('.player__poster');
      if (current) current.replaceWith(frame);
      else player.insertBefore(frame, player.firstChild);
    }
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
      '?autoplay=1&rel=0&playsinline=1';
    iframe.title = 'Set de Martina Høbelar en ' + info.name;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.replaceChildren(iframe);
  }

  if (player && poster && tracks.length) {
    poster.addEventListener('click', function () {
      var btn = tracks.find(function (t) { return t.dataset.id === currentId; });
      play(currentId, trackInfo(btn));
    });

    tracks.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tracks.forEach(function (t) { t.removeAttribute('aria-current'); });
        btn.setAttribute('aria-current', 'true');
        currentId = btn.dataset.id;
        var info = paintNow(btn);
        if (thumb) thumb.src = 'https://i.ytimg.com/vi/' + currentId + '/maxresdefault.jpg';
        poster.setAttribute('aria-label', 'Reproducir el set de ' + info.name);
        play(currentId, info);

        // En una columna el reproductor queda arriba de la lista
        if (window.matchMedia('(max-width: 980px)').matches) {
          player.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }
      });
    });
  }

  /* ----------------------------------------------------------
     Visor de fotos
     ---------------------------------------------------------- */
  var viewer = document.getElementById('viewer');
  var vImg = document.getElementById('viewerImg');
  var vCount = document.getElementById('viewerCount');
  var vDl = document.getElementById('viewerDl');
  var photos = Array.prototype.slice.call(document.querySelectorAll('.ph'));
  var index = 0;

  function show(i) {
    index = (i + photos.length) % photos.length;
    var btn = photos[index];
    var img = btn.querySelector('img');
    vImg.src = btn.dataset.full;
    vImg.alt = img.alt;
    vCount.textContent = (index + 1) + ' / ' + photos.length;
    vDl.href = btn.dataset.full;
    vDl.setAttribute('download', 'martina-hobelar-' + String(index + 1).padStart(2, '0') + '.webp');

    // la siguiente ya queda pedida
    var next = photos[(index + 1) % photos.length];
    if (next) { var pre = new Image(); pre.src = next.dataset.full; }
  }

  function closeViewer() {
    viewer.close();
  }

  if (viewer && typeof viewer.showModal === 'function' && photos.length) {
    photos.forEach(function (btn, i) {
      btn.addEventListener('click', function () {
        show(i);
        viewer.showModal();
        document.documentElement.style.overflow = 'hidden';
      });
    });

    viewer.addEventListener('close', function () {
      document.documentElement.style.overflow = '';
      vImg.removeAttribute('src');
      photos[index].focus();
    });

    document.getElementById('viewerPrev').addEventListener('click', function () { show(index - 1); });
    document.getElementById('viewerNext').addEventListener('click', function () { show(index + 1); });
    document.getElementById('viewerClose').addEventListener('click', closeViewer);

    // tocar el fondo cierra
    viewer.addEventListener('click', function (e) {
      if (e.target === viewer) closeViewer();
    });

    viewer.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });

    // deslizar en el celular
    var startX = null;
    viewer.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    viewer.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* ----------------------------------------------------------
     Fotos que no cargan: en el celular la conexión se corta y el
     navegador no vuelve a pedirlas solo. Se reintenta cada una
     hasta 4 veces, y todas de nuevo cuando vuelve la conexión.
     ---------------------------------------------------------- */
  var MAX_TRIES = 4;

  function isBroken(img) {
    return img.complete && img.naturalWidth === 0 && !!img.getAttribute('src');
  }

  function baseSrc(img) {
    return (img.getAttribute('src') || '').replace(/[?&]r=\d+$/, '');
  }

  function retry(img) {
    var base = baseSrc(img);
    if (!base) return;
    // el visor cambia de foto: cada foto nueva arranca con sus propios intentos
    if (img.dataset.base !== base) { img.dataset.base = base; img.dataset.tries = '0'; }
    var tries = Number(img.dataset.tries);
    if (tries >= MAX_TRIES) return;
    img.dataset.tries = String(tries + 1);
    setTimeout(function () {
      if (baseSrc(img) !== base) return; // mientras tanto se pidió otra foto
      img.src = base + (base.indexOf('?') === -1 ? '?' : '&') + 'r=' + (tries + 1);
    }, 1200 * (tries + 1));
  }

  Array.prototype.forEach.call(document.images, function (img) {
    img.addEventListener('error', function () { retry(img); });
    if (isBroken(img)) retry(img);
  });

  window.addEventListener('online', function () {
    Array.prototype.forEach.call(document.images, function (img) {
      if (isBroken(img)) { img.dataset.tries = '0'; retry(img); }
    });
  });

  /* ----------------------------------------------------------
     Año del pie
     ---------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
