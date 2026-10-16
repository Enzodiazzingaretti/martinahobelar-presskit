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
        // la bio completa son todos sus párrafos; la corta, el primero
        var src = document.getElementById(btn.dataset.copyFrom);
        var ps = src.matches('p') ? [src] : src.querySelectorAll('p');
        text = Array.prototype.map.call(ps, function (p) {
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
     Consulta de booking: se arma acá con los datos del evento y
     se abre lista para enviar en el mail, Gmail o WhatsApp de
     quien escribe, así la respuesta le llega a su casilla. No
     pasa por ningún servidor; el borrador queda solo en esta
     pestaña por si el celular recarga la página.
     ---------------------------------------------------------- */
  var ask = document.getElementById('ask');

  if (ask) (function () {
    var MAIL = 'booking.grooveselections@gmail.com';
    var WHATSAPP = '5491169229895';
    var BORRADOR = 'mh-consulta';

    var MOTIVOS = {
      fecha: {
        asunto: 'Booking',
        intro: 'Hola, te escribo por una fecha para Martina Høbelar.',
        org: 'Productora o fiesta',
        hint: 'Line-up, horario del set, propuesta o lo que quieras sumar.',
        piden: ['nombre', 'fecha', 'ciudad']
      },
      prensa: {
        asunto: 'Prensa',
        intro: 'Hola, te escribo por una nota con Martina Høbelar.',
        org: 'Medio',
        hint: 'De qué se trata la nota y para cuándo la necesitás.',
        piden: ['nombre', 'org', 'mensaje']
      },
      colab: {
        asunto: 'Colaboración',
        intro: 'Hola, te escribo por una colaboración con Martina Høbelar.',
        org: 'Proyecto o sello',
        hint: 'Contanos la idea.',
        piden: ['nombre', 'mensaje']
      }
    };

    var FALTA = {
      nombre: 'Escribí tu nombre.',
      org: 'Escribí el nombre del medio.',
      fecha: 'Elegí la fecha del evento.',
      ciudad: 'Escribí la ciudad.',
      mensaje: 'Contanos de qué se trata.'
    };

    var fields = {};
    Array.prototype.forEach.call(ask.querySelectorAll('[data-field]'), function (box) {
      fields[box.dataset.field] = {
        box: box,
        input: box.querySelector('.campo'),
        opc: box.querySelector('.field__opc'),
        error: box.querySelector('.field__error')
      };
    });
    var order = Object.keys(fields); // en el orden de la página
    var evento = document.getElementById('askEvento');
    var orgLabel = document.getElementById('l-org');
    var msgHint = document.getElementById('h-mensaje');
    var dateHint = document.getElementById('h-fecha');
    var dateHintText = dateHint.textContent;
    var status = document.getElementById('askStatus');
    var date = fields.fecha.input;
    var reduce = reduceMotion ? 'auto' : 'smooth';

    var LARGA = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    var CORTA = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });

    function fmt(v, f) {
      var d = new Date(v + 'T00:00:00Z');
      return isNaN(d.getTime()) ? v : f.format(d);
    }
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    // hoy, en la zona de quien mira: una fecha que ya pasó no se puede elegir
    function today() {
      var d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    date.min = today();

    function val(k) { return fields[k] ? fields[k].input.value.trim() : ''; }
    function checked(name) {
      var r = ask.querySelector('input[name="' + name + '"]:checked');
      return r ? r.value : '';
    }
    function motivo() { return MOTIVOS[checked('motivo')] ? checked('motivo') : 'fecha'; }

    function say(text, alerta) {
      status.textContent = text;
      status.classList.toggle('is-alerta', !!alerta);
    }

    function setError(k, msg) {
      var f = fields[k];
      f.box.classList.add('is-error');
      f.input.setAttribute('aria-invalid', 'true');
      f.error.lastElementChild.textContent = msg;
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

    // qué le falta a un campo, según lo que se consulta
    function problema(k) {
      if (MOTIVOS[motivo()].piden.indexOf(k) === -1) return '';
      if (k === 'fecha') {
        if (date.validity && date.validity.badInput) return 'Revisá la fecha.';
        if (!val('fecha')) return FALTA.fecha;
        if (val('fecha') < date.min) return 'Esa fecha ya pasó.';
        return '';
      }
      return val(k) ? '' : FALTA[k];
    }

    function check() {
      var bad = [];
      order.forEach(function (k) {
        var p = problema(k);
        if (p) { setError(k, p); bad.push(k); } else clearError(k);
      });
      return bad;
    }

    function lista(ks) {
      var n = ks.map(function (k) { return k === 'org' ? 'medio' : k; });
      return n.length > 1 ? n.slice(0, -1).join(', ') + ' y ' + n[n.length - 1] : n[0];
    }

    function applyMotivo() {
      var k = motivo();
      var m = MOTIVOS[k];
      evento.hidden = k !== 'fecha';
      order.forEach(function (f) {
        var on = m.piden.indexOf(f) !== -1;
        fields[f].input.required = on;
        if (fields[f].opc) fields[f].opc.hidden = on;
        clearError(f);
      });
      orgLabel.textContent = m.org;
      msgHint.textContent = m.hint;
      say('');
    }

    // debajo de la fecha, el día escrito: así no hay dudas entre día y mes
    function showDate() {
      var v = date.value;
      date.classList.toggle('is-empty', !v);
      var ok = v && v >= date.min;
      dateHint.textContent = ok ? cap(fmt(v, LARGA)) : dateHintText;
      dateHint.classList.toggle('is-dato', !!ok);
    }

    function compose(negrita) {
      var k = motivo();
      var m = MOTIVOS[k];
      function linea(label, v) { return (negrita ? '*' + label + ':* ' : label + ': ') + v; }
      var lines = [m.intro, '', linea('Nombre', val('nombre'))];
      var asunto = [m.asunto, 'Martina Høbelar'];
      if (val('org')) lines.push(linea(m.org, val('org')));
      if (k === 'fecha') {
        lines.push(linea('Fecha', fmt(val('fecha'), LARGA)));
        lines.push(linea('Ciudad', val('ciudad')));
        if (val('venue')) lines.push(linea('Club o venue', val('venue')));
        if (val('capacidad')) lines.push(linea('Capacidad', val('capacidad') + (/^\d[\d.,]*$/.test(val('capacidad')) ? ' personas' : '')));
        if (checked('tipo')) lines.push(linea('Tipo de evento', checked('tipo')));
        asunto.push(fmt(val('fecha'), CORTA), val('ciudad'));
      } else if (val('org')) {
        asunto.push(val('org'));
      }
      if (val('mensaje')) lines.push('', val('mensaje'));
      return { asunto: asunto.join(' · '), texto: lines.join('\n') };
    }

    function abrir(url, nueva) {
      var a = document.createElement('a');
      a.href = url;
      if (nueva) { a.target = '_blank'; a.rel = 'noopener'; }
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    // Si la página no pierde el foco, la compu no tiene app de mail: se ofrece Gmail o copiar
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
        else say('No se abrió ninguna app de mail. Abrí la consulta en Gmail o copiala.', true);
      }, 1600);
    }

    function enviar(via) {
      var bad = check();
      if (bad.length) {
        var first = fields[bad[0]];
        first.box.scrollIntoView({ behavior: reduce, block: 'center' });
        first.input.focus({ preventScroll: true });
        say('Falta completar: ' + lista(bad) + '.', true);
        return;
      }
      var c = compose(via === 'whatsapp');
      var enc = encodeURIComponent;
      if (via === 'mail') {
        abrir('mailto:' + MAIL + '?subject=' + enc(c.asunto) + '&body=' + enc(c.texto.replace(/\n/g, '\r\n')));
        mirarMail();
      } else if (via === 'gmail') {
        abrir('https://mail.google.com/mail/?view=cm&fs=1&to=' + enc(MAIL) + '&su=' + enc(c.asunto) + '&body=' + enc(c.texto), true);
        say('Se abrió Gmail en otra pestaña con la consulta armada. Solo falta enviarla.');
      } else if (via === 'whatsapp') {
        abrir('https://wa.me/' + WHATSAPP + '?text=' + enc(c.texto), true);
        say('Se abrió WhatsApp con la consulta armada. Solo falta enviarla.');
      } else if (via === 'copiar') {
        copyText(c.texto).then(function () {
          say('Consulta copiada. Pegala en un mail a ' + MAIL + '.');
        }, function () {
          say('No se pudo copiar. Escribí a ' + MAIL + '.', true);
        });
      }
    }

    // borrador en esta pestaña: si el celular recarga la página al volver del mail, no se pierde
    function guardar() {
      try {
        var data = {};
        Array.prototype.forEach.call(ask.elements, function (el) {
          if (!el.name) return;
          if (el.type === 'radio') { if (el.checked) data[el.name] = el.value; } else data[el.name] = el.value;
        });
        sessionStorage.setItem(BORRADOR, JSON.stringify(data));
      } catch (e) { /* sin almacenamiento no pasa nada */ }
    }
    function recuperar() {
      try {
        var data = JSON.parse(sessionStorage.getItem(BORRADOR) || 'null');
        if (!data) return;
        Array.prototype.forEach.call(ask.elements, function (el) {
          if (!el.name || !(el.name in data)) return;
          if (el.type === 'radio') el.checked = el.value === data[el.name];
          else el.value = data[el.name];
        });
      } catch (e) { /* idem */ }
    }

    recuperar();
    applyMotivo();
    showDate();

    ask.addEventListener('change', function (e) {
      if (e.target.name === 'motivo') applyMotivo();
      if (e.target === date) showDate();
      guardar();
    });
    ask.addEventListener('input', function (e) {
      var box = e.target.closest('[data-field]');
      if (box && box.classList.contains('is-error') && !problema(box.dataset.field)) {
        clearError(box.dataset.field);
        // con todo corregido, el aviso de lo que faltaba se va
        if (!ask.querySelector('.field.is-error') && status.classList.contains('is-alerta')) say('');
      }
      if (e.target === date) showDate();
      guardar();
    });
    ask.addEventListener('submit', function (e) {
      e.preventDefault();
      enviar('mail');
    });
    Array.prototype.forEach.call(ask.querySelectorAll('[data-via]'), function (btn) {
      btn.addEventListener('click', function () { enviar(btn.dataset.via); });
    });
  })();

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
