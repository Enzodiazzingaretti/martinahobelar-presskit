/* Martina Høbelar — press kit
   Solo comportamiento: el contenido vive entero en index.html. */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var announcer = document.getElementById('announcer');

  // En el iPhone, :active (la tecla que se hunde) solo se ve si hay un toque escuchado
  document.addEventListener('touchstart', function () {}, { passive: true });

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
     La sección en pantalla queda marcada en el menú con el led
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

  /* ----------------------------------------------------------
     Sets: un reproductor y la lista; la miniatura se cambia por
     el video recién cuando alguien toca play
     ---------------------------------------------------------- */
  var sets = document.getElementById('sets');
  var player = document.getElementById('player');
  var poster = document.getElementById('playerPoster');
  var thumb = document.getElementById('playerThumb');
  var nowLed = document.getElementById('nowLed');
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
      // el número sin el “BPM” oculto que leen los lectores de pantalla
      label: btn.querySelector('.track__bpm').firstChild.textContent.trim()
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
    // la miniatura queda debajo hasta que YouTube dibuja el video
    var under = document.createElement('img');
    under.className = 'player__under';
    under.alt = '';
    under.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(btn.dataset.id) + '/maxresdefault.jpg';
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(btn.dataset.id) +
      '?autoplay=1&rel=0&playsinline=1';
    iframe.title = 'Set de Martina Høbelar en ' + info.name;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.replaceChildren(under, iframe);
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

    // el led titila a los BPM de este set
    if (info.bpm) {
      sets.style.setProperty('--bpm', String(info.bpm));
      beat(nowLed);
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
     Copiar la bio, completa o corta, para quien arma la difusión
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
        // la bio completa son todos sus párrafos; la corta, el primero
        var src = document.getElementById(btn.dataset.copyFrom);
        var ps = src.matches('p') ? [src] : src.querySelectorAll('p');
        text = Array.prototype.map.call(ps, function (p) {
          return p.textContent.trim();
        }).join('\n\n');
      }
      text = text.replace(/ /g, ' '); // los espacios duros de la página, como espacios comunes
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
     Consulta de booking: el formulario arma el mail y lo abre en
     la app de quien escribe, así la respuesta le llega a su
     casilla. No pasa por ningún servidor; el borrador queda solo
     en esta pestaña por si el celular recarga la página.
     ---------------------------------------------------------- */
  var ask = document.getElementById('ask');

  if (ask) (function () {
    var MAIL = 'booking.grooveselections@gmail.com';
    var BORRADOR = 'mh-consulta';
    var FALTA = { nombre: 'Escribí tu nombre.', mensaje: 'Contanos qué necesitás.' };

    var fields = {};
    Array.prototype.forEach.call(ask.querySelectorAll('[data-field]'), function (box) {
      fields[box.dataset.field] = { box: box, input: box.querySelector('.campo'), error: box.querySelector('.field__error') };
    });
    var status = document.getElementById('askStatus');
    var reduce = reduceMotion ? 'auto' : 'smooth';

    function val(k) { return fields[k].input.value.trim(); }
    function say(text, alerta) {
      status.textContent = text;
      status.classList.toggle('is-alerta', !!alerta);
    }
    function setError(k) {
      var f = fields[k];
      f.box.classList.add('is-error');
      f.input.setAttribute('aria-invalid', 'true');
      f.error.lastElementChild.textContent = FALTA[k];
      f.error.hidden = false;
    }
    function clearError(k) {
      var f = fields[k];
      if (!f.error) return;
      f.box.classList.remove('is-error');
      f.input.removeAttribute('aria-invalid');
      f.error.lastElementChild.textContent = '';
      f.error.hidden = true;
    }
    function check() {
      return ['nombre', 'mensaje'].filter(function (k) {
        if (val(k)) { clearError(k); return false; }
        setError(k);
        return true;
      });
    }

    // el asunto lleva la fecha y el lugar si los hay: así se ordena la casilla de booking
    function compose() {
      var lines = ['Hola, te escribo por Martina Høbelar.', '', 'Nombre: ' + val('nombre')];
      if (val('evento')) lines.push('Fecha y lugar: ' + val('evento'));
      lines.push('', val('mensaje'));
      return {
        asunto: ['Booking', 'Martina Høbelar', val('evento')].filter(Boolean).join(' · '),
        texto: lines.join('\n').replace(/\r?\n/g, '\r\n') // saltos de mail, también los del mensaje
      };
    }

    // Si la página no pierde el foco, no hay app de mail: se avisa adónde escribir
    var espera = null;
    var salir = null;
    function mirarMail() {
      var salio = false;
      if (salir) {
        window.removeEventListener('blur', salir);
        document.removeEventListener('visibilitychange', salir);
      }
      salir = function () { salio = true; };
      window.addEventListener('blur', salir);
      document.addEventListener('visibilitychange', salir);
      say('Abriendo tu app de mail…');
      clearTimeout(espera);
      espera = setTimeout(function () {
        window.removeEventListener('blur', salir);
        document.removeEventListener('visibilitychange', salir);
        salir = null;
        if (salio) say('Listo: la consulta quedó armada en tu app de mail. Solo falta enviarla.');
        else say('No se abrió ninguna app de mail. Escribí a ' + MAIL + ' o por WhatsApp.', true);
      }, 1600);
    }

    function enviar() {
      var bad = check();
      if (bad.length) {
        var first = fields[bad[0]];
        first.box.scrollIntoView({ behavior: reduce, block: 'center' });
        first.input.focus({ preventScroll: true });
        say(bad.length > 1 ? 'Falta completar el nombre y el mensaje.' : bad[0] === 'nombre' ? 'Falta completar el nombre.' : 'Falta completar el mensaje.', true);
        return;
      }
      var c = compose();
      var a = document.createElement('a');
      a.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(c.asunto) + '&body=' + encodeURIComponent(c.texto);
      document.body.appendChild(a);
      a.click();
      a.remove();
      mirarMail();
    }

    // borrador en esta pestaña: si el celular recarga la página al volver del mail, no se pierde
    function guardar() {
      try {
        var data = {};
        Array.prototype.forEach.call(ask.elements, function (el) { if (el.name) data[el.name] = el.value; });
        sessionStorage.setItem(BORRADOR, JSON.stringify(data));
      } catch (e) { /* sin almacenamiento no pasa nada */ }
    }
    try {
      var data = JSON.parse(sessionStorage.getItem(BORRADOR) || 'null');
      if (data) Array.prototype.forEach.call(ask.elements, function (el) { if (el.name && el.name in data) el.value = data[el.name]; });
    } catch (e) { /* idem */ }

    ask.addEventListener('input', function (e) {
      var box = e.target.closest('[data-field]');
      if (box && box.classList.contains('is-error') && val(box.dataset.field)) {
        clearError(box.dataset.field);
        if (!ask.querySelector('.field.is-error') && status.classList.contains('is-alerta')) say('');
      }
      guardar();
    });
    ask.addEventListener('submit', function (e) {
      e.preventDefault();
      enviar();
    });
  })();

  /* ----------------------------------------------------------
     Fotos que se revelan: mientras cargan se ve su tono y después
     aparecen con un fundido. Las que ya estaban cargadas, sin fundido.
     ---------------------------------------------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('.ph'), function (ph) {
    if (ph.dataset.tono) ph.style.setProperty('--tono', ph.dataset.tono);
    var img = ph.querySelector('img');
    if (!img || (img.complete && img.naturalWidth)) return;
    img.classList.add('is-revelando');
    img.addEventListener('load', function () { img.classList.remove('is-revelando'); }, { once: true });
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
    // cada foto entra con un fundido corto cuando terminó de cargar
    if (vImg.getAttribute('src') !== btn.dataset.full) {
      vImg.classList.add('is-revelando');
      vImg.onload = function () { vImg.classList.remove('is-revelando'); };
    }
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
