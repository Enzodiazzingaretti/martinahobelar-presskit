/* Martina Høbelar — press kit
   Solo comportamiento: el contenido vive entero en index.html. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var announcer = document.getElementById('announcer');

  function announce(text) {
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(function () { announcer.textContent = text; }, 30);
  }

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

  // Lugar que ocupa el botón de booking, para que el menú se corra cuando aparece
  var cta = document.querySelector('.bar__cta');
  function measureCta() {
    if (!bar || !cta) return;
    var gap = parseFloat(getComputedStyle(cta.parentNode).columnGap) || 0;
    bar.style.setProperty('--cta-room', (cta.offsetWidth + gap) + 'px');
  }
  measureCta();
  // la transición se prende después de medir, para que no se mueva al cargar
  requestAnimationFrame(function () { if (bar) bar.classList.add('is-ready'); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureCta);
  window.addEventListener('resize', measureCta);

  // La firma y el botón de booking aparecen cuando el nombre grande ya no se ve
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
     La sección en pantalla queda marcada en el menú con la gota
     ---------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.bar__nav a, .bar__cta, .menu__nav a'));
  var sections = ['sets', 'bio', 'fotos', 'rider', 'booking']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function markSection(id) {
    navLinks.forEach(function (a) {
      if (id && a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
      var here = null;
      sections.forEach(function (sec) { if (visible[sec.id]) here = sec.id; });
      markSection(here);
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ----------------------------------------------------------
     Latido: ocho golpes a los BPM y quieto. Se vuelve a disparar
     sacando y poniendo la clase.
     ---------------------------------------------------------- */
  function beat(el) {
    if (!el || reduceMotion) return;
    el.classList.remove('is-latiendo');
    void el.offsetWidth; // reinicia la animación
    el.classList.add('is-latiendo');
  }

  // Inicio: cuando la foto y la tipografía ya están, entra con ocho golpes
  var hero = document.querySelector('.hero');
  var heroImg = document.getElementById('heroImg');
  if (hero && heroImg && !reduceMotion) {
    var ready = [heroImg.decode ? heroImg.decode().catch(function () {}) : Promise.resolve()];
    if (document.fonts && document.fonts.ready) ready.push(document.fonts.ready);
    Promise.all(ready).then(function () {
      setTimeout(function () { beat(hero); }, 350);
    });
  }

  /* ----------------------------------------------------------
     Sets: un reproductor y la lista; la miniatura se cambia por
     el video recién cuando alguien toca play
     ---------------------------------------------------------- */
  var sets = document.getElementById('sets');
  var player = document.getElementById('player');
  var poster = document.getElementById('playerPoster');
  var thumb = document.getElementById('playerThumb');
  var nowGota = document.getElementById('nowGota');
  var nowName = document.getElementById('nowName');
  var nowBpm = document.getElementById('nowBpm');
  var tracks = Array.prototype.slice.call(document.querySelectorAll('.track'));
  var current = tracks[0];

  function trackInfo(btn) {
    var nameEl = btn.querySelector('.track__name');
    var bpm = btn.dataset.bpm;
    return {
      name: nameEl.firstChild.textContent.trim(),
      bpm: bpm ? Number(bpm) : null,
      label: btn.querySelector('.track__bpm').textContent.trim()
    };
  }

  function play(btn) {
    var info = trackInfo(btn);
    var frame = player.querySelector('.player__frame');
    if (!frame) {
      frame = document.createElement('div');
      frame.className = 'player__frame';
      var old = player.querySelector('.player__poster');
      if (old) old.replaceWith(frame);
      else player.insertBefore(frame, player.firstChild);
    }
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(btn.dataset.id) +
      '?autoplay=1&rel=0&playsinline=1';
    iframe.title = 'Set de Martina Høbelar en ' + info.name;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.replaceChildren(iframe);
  }

  function choose(btn) {
    var info = trackInfo(btn);
    tracks.forEach(function (t) { t.removeAttribute('aria-current'); });
    btn.setAttribute('aria-current', 'true');
    current = btn;

    nowName.textContent = info.name;
    nowBpm.textContent = info.bpm ? info.label + ' BPM' : info.label;
    if (thumb) thumb.src = 'https://i.ytimg.com/vi/' + btn.dataset.id + '/maxresdefault.jpg';
    if (poster) poster.setAttribute('aria-label', 'Reproducir el set de ' + info.name);

    // la gota late a los BPM de este set
    if (info.bpm) {
      sets.style.setProperty('--bpm', String(info.bpm));
      beat(nowGota);
    }
  }

  if (player && poster && tracks.length) {
    poster.addEventListener('click', function () { play(current); });

    tracks.forEach(function (btn) {
      btn.addEventListener('click', function () {
        choose(btn);
        play(btn);
        // En una columna el reproductor queda arriba de la lista
        if (window.matchMedia('(max-width: 980px)').matches) {
          player.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        }
      });
    });
  }

  /* ----------------------------------------------------------
     Copiar: el mail (muchos no tienen app de correo configurada
     en la compu) y la bio, para quien arma la difusión
     ---------------------------------------------------------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      area.remove();
      if (ok) resolve(); else reject(new Error('copy'));
    });
  }

  document.querySelectorAll('.copy').forEach(function (btn) {
    var label = btn.textContent;
    var timer = null;
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy;
      if (btn.dataset.copyFrom) {
        var src = document.getElementById(btn.dataset.copyFrom);
        text = Array.prototype.map.call(src.querySelectorAll('p'), function (p) {
          return p.textContent.trim();
        }).join('\n\n');
      }
      copyText(text).then(function () {
        btn.textContent = btn.dataset.done || 'Copiado';
        btn.classList.add('is-done');
        announce(btn.dataset.done || 'Copiado');
      }, function () {
        btn.textContent = 'No se pudo copiar';
        announce('No se pudo copiar. Seleccioná el texto y copialo a mano.');
      }).then(function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          btn.textContent = label;
          btn.classList.remove('is-done');
        }, 2200);
      });
    });
  });

  /* ----------------------------------------------------------
     Visor de fotos: las dos grandes y la grilla, en orden.
     Se ve en WebP y se descarga en JPG.
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
    vDl.href = btn.dataset.jpg || btn.dataset.full;
    vDl.setAttribute('download', 'martina-hobelar-' + String(index + 1).padStart(2, '0') + (btn.dataset.jpg ? '.jpg' : '.webp'));

    // la siguiente ya queda pedida
    var next = photos[(index + 1) % photos.length];
    if (next) { var pre = new Image(); pre.src = next.dataset.full; }
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
    document.getElementById('viewerClose').addEventListener('click', function () { viewer.close(); });

    // tocar el fondo cierra
    viewer.addEventListener('click', function (e) {
      if (e.target === viewer) viewer.close();
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

  function cleanUrl(u) {
    return (u || '').replace(/[?&]r=\d+$/, '');
  }

  function retry(img) {
    // con srcset la que falló es currentSrc, no el src de respaldo
    var base = cleanUrl(img.currentSrc || img.getAttribute('src'));
    if (!base) return;
    // el visor cambia de foto: cada foto nueva arranca con sus propios intentos
    if (img.dataset.base !== base) { img.dataset.base = base; img.dataset.tries = '0'; }
    var tries = Number(img.dataset.tries);
    if (tries >= MAX_TRIES) return;
    img.dataset.tries = String(tries + 1);
    setTimeout(function () {
      if (cleanUrl(img.currentSrc || img.getAttribute('src')) !== base) return; // se pidió otra foto
      if (img.hasAttribute('srcset')) { img.removeAttribute('srcset'); img.removeAttribute('sizes'); }
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
