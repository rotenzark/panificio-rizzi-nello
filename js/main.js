/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'panificio-rizzi-nello',    // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Scheda Google (24/9/2026), confermata da Virgilio e PagineGialle: lun–sab 07:30–19:30 CONTINUATO, domenica chiuso. */
    hours: {
      0: [],
      1: [['07:30', '19:30']],
      2: [['07:30', '19:30']],
      3: [['07:30', '19:30']],
      4: [['07:30', '19:30']],
      5: [['07:30', '19:30']],
      6: [['07:30', '19:30']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "intro.skip": "skip",
      "nav.home": "Il forno di Rizzi Nello, back to top",
      "nav.apri": "Open the menu",
      "nav.pane": "The bread",
      "nav.focaccia": "Focaccia & pizza",
      "nav.dolci": "Sweets",
      "nav.banco": "At the counter",
      "nav.storia": "The story",
      "nav.dove": "Where & hours",
      "cta.chiama": "Call",
      "cta.chiama2": "Call +39 02 642 7471",
      "h.kicker": "Panificio Rizzi Nello · Viale Suzzani 12, Niguarda, Milan · since 1979",
      "h.h1": "Bread is life.",
      "h.sub": "So says Nello Rizzi, who started baking at eleven. Since 1979 his bakery has been here, on Viale Suzzani: <em>more than twenty kinds of bread</em>, focaccia and pizza by the slice, the sweets of the season, all from the oven behind the counter. And the counter is made of wood, like everything else.",
      "h.badge": "Open 7.30 am to 7.30 pm with no break, Monday to Saturday",
      "h.cta1": "Call +39 02 642 7471",
      "h.cta2": "The breads",
      "h.alt": "The wooden counter of the bakery with trays of pizza and focaccia, and behind it the shelves with baskets of bread",
      "h.cap": "The counter: the trays in front, the bread in baskets behind",
      "m1.k": "the white art · one",
      "m1.h": "More than twenty kinds.",
      "m1.p": "These are the breads Nello Rizzi perfected in seventy years of baking. At the counter you find them in rotation, and for each one someone tells you what it goes with: <em>it is a bakery where you ask for bread, and get advice</em>.",
      "p.1": "Plain bread",
      "p.1d": "the everyday michette and loaves",
      "p.2": "Wholemeal",
      "p.2d": "with the bran, for those who like it dark",
      "p.3": "Milk and olive-oil bread",
      "p.3d": "the soft ones",
      "p.4": "Durum wheat",
      "p.4d": "the yellow, dense crumb",
      "p.5": "Pan carré",
      "p.5d": "Nello was already making it in the Fifties",
      "p.6": "Grissini",
      "p.6d": "pulled and baked here",
      "sett.t": "The bread of the week",
      "sett.p": "Customers write it in their reviews: <b>on Tuesday</b> the loaves with seeds and different flours, <b>on Thursday</b> the spelt bread.",
      "m1.a1": "The wooden shelves of the shop with the bread baskets and the packs",
      "m1.c1": "The shelves, with the bread baskets",
      "m1.a2": "The all-wood interior of the bakery: the curved counter, the shelves, the lamps, the bench",
      "m1.c2": "Inside it is all wood: the counter, the shelves, the bench",
      "m2.k": "the white art · two",
      "m2.h": "From the oven behind the counter.",
      "m2.p": "Pizza by the slice, pizzette, focaccia and schiacciate come out of the oven next to the shop and land on the counter, in trays. <em>You take them away</em>, for lunch or for a snack.",
      "f.1": "Pizza by the slice",
      "f.1d": "in the tray, cut on the spot",
      "f.2": "Pizzette",
      "f.2d": "the round ones, to eat in the street",
      "f.3": "Focaccia",
      "f.3d": "thick and soft, by the piece",
      "f.4": "Schiacciate",
      "f.4d": "thin and crisp",
      "m2.a1": "The bakery window with the trays of focaccia and the trays of sweets",
      "m2.c1": "The window, with the trays",
      "m3.k": "the white art · three",
      "m3.h": "The little tarts, and the calendar.",
      "m3.p": "All year round: little jam tarts, brioche and croissants, dry pastries, strudel, cakes. Then there is <em>the year of the bakery</em>, which follows the feasts as it always has.",
      "st.1": "Carnival",
      "st.1d": "chiacchiere, and crostoli: that is what they are called in Veneto, where Nello came from",
      "st.2": "Easter",
      "st.2d": "the colomba",
      "st.3": "Christmas",
      "st.3d": "panettone and veneziana",
      "m3.a1": "Trays of little jam and custard tarts on the counter",
      "m3.c1": "The little tarts",
      "m3.a2": "Carnival chiacchiere dusted with icing sugar",
      "m3.c2": "Chiacchiere, at Carnival",
      "m4.k": "the white art · four",
      "m4.h": "Sabrina and Chiara.",
      "m4.p": "Those are the names customers write in their reviews, together with «the blonde girl» and «the lady». The bakery is family-run, and you can tell: <em>the taste offered, the advice on which bread to take, the smile</em>.",
      "m4.p2": "Of the 76 Google reviews with a text, 39 talk about kindness, 29 about the bread, 23 about the sweets, 12 about a bakery «like the old ones».",
      "v.badge": "128 reviews on Google",
      "v.cit": "«a neighbourhood shop like the ones there used to be»",
      "v.citda": "From a Google review (translated)",
      "v.btn": "Read the reviews on Google",
      "m5.k": "the white art · five",
      "m5.h": "Eleven years old, five hundred lire.",
      "m5.p": "Nello Rizzi started at eleven, as a boy in a bakery near Verona; in 1946 the pay was five hundred lire a week, plus board and lodging. He calls the trade <em>the white art</em>, and this is how he told it.",
      "t.1d": "A baker's boy at eleven, five hundred lire a week.",
      "t.2": "Age 13",
      "t.2d": "He comes to Milan, to learn.",
      "t.3": "The Fifties",
      "t.3d": "Ten years at Dai Grossi: rye bread and pan carré, for the first time in the city.",
      "t.4d": "The workshop on Via Pianell, with his brothers Carlo and Bruno.",
      "t.5d": "The bakery on Viale Suzzani 12: this one.",
      "t.6d": "The Milan Chamber of Commerce honours him for fifty-eight years of bread-making.",
      "t.7": "Today",
      "t.7d": "The family at the counter, and the breads Nello brought from Veneto: pan biscotto, pan puf, pan meino.",
      "m5.a1": "The inside of the Viale Suzzani bakery towards the door, with the wooden counter and the window",
      "m5.c1": "The Viale Suzzani bakery, towards the door",
      "d.k": "where and when",
      "d.h": "Viale Suzzani 12, no break.",
      "d.p": "In Niguarda, near Viale Fulvio Testi. Open <em>from 7.30 am to 7.30 pm, all day</em>, Monday to Saturday: there is bread at three in the afternoon too. Closed on Sunday.",
      "d.n1": "<b>Takeaway</b>: bread, pizza and sweets to take home.",
      "d.n2": "<b>Bus 42</b> stops nearby; blue-line parking (customers write it).",
      "d.n3": "<b>For a special order</b>, phone first.",
      "d.tel": "Call +39 02 642 7471",
      "d.strada": "Directions",
      "o.cap": "Opening hours",
      "g.lun": "Monday",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.chiuso": "closed",
      "d.mappa": "Map: Panificio Rizzi Nello, Viale Giovanni Suzzani 12, Milan",
      "d.alt": "The entrance of the bakery on Viale Suzzani, with the wooden door open and the window",
      "d.cap": "The entrance, at Viale Suzzani 12",
      "do.h": "The questions we get asked.",
      "qa.1": "What are your hours?",
      "ra.1": "Monday to Saturday from 7.30 am to 7.30 pm, no break. Closed on Sunday.",
      "qa.2": "Do you close for lunch?",
      "ra.2": "No: the bakery stays open from 7.30 am to 7.30 pm without a break, Monday to Saturday. There is bread at three in the afternoon too.",
      "qa.3": "How many kinds of bread do you have?",
      "ra.3": "More than twenty, in rotation: plain bread, wholemeal, milk bread, olive-oil bread, durum wheat, michette and loaves, pan carré, grissini. At the counter we tell you which one to take.",
      "qa.4": "Do you make pizza and focaccia?",
      "ra.4": "Yes: pizza by the slice, pizzette, focaccia and schiacciate, from the oven behind the counter. To take away.",
      "qa.5": "Do you make chiacchiere, colomba, panettone?",
      "ra.5": "Yes, following the calendar: chiacchiere and crostoli at Carnival, the colomba at Easter, panettone and veneziana at Christmas.",
      "qa.6": "Can I order by phone?",
      "ra.6": "For a special order, phone first: +39 02 642 7471.",
      "piede.s": "bakery · focaccia and pizza · sweets · Milan, Niguarda · since 1979",
      "piede.d": "Panificio Rizzi Nello · Viale Giovanni Suzzani 12, 20162 Milan · <a href='tel:+39026427471'>+39 02 642 7471</a>",
      "piede.o": "<b>Open all day</b>Monday–Saturday 7.30 am–7.30 pm · Sunday closed",
      "piede.b": "Demo website made by <a href='https://bespokestud.io' target='_blank' rel='noopener'>Bespoke Studio</a> · texts, hours and services from the business's public sources and from the Zona Nove article of December 2016; photographs published on the business's Google listing.",
      "b.chiama": "Call",
      "b.pani": "Breads",
      "b.orari": "Hours",
      "b.mappa": "Map",
      "lb.chiudi": "Close",
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  /* ═══ FIRMA · Panificio Rizzi Nello — «Il pane è vita.» ═══
     La farina che scende dal setaccio: ogni titolo .farina si compone come grana bianca che si
     posa (filtro SVG feTurbulence + feColorMatrix sull'alpha, animato con GSAP) e a fine posa il
     filtro si toglie e resta il testo pulito. Regole: i titoli non sono mai nascosti dal CSS;
     senza GSAP o con motion ridotto non c'è filtro e il testo è lì da subito. */

  var setacci = document.getElementById('setacci');
  var titoli = Array.prototype.slice.call(document.querySelectorAll('.farina'));
  var farinaViva = hasGsap && hasST && !reducedMotion && setacci && titoli.length;
  var SVGNS = 'http://www.w3.org/2000/svg';
  function mkSetaccio(i) {
    var f = document.createElementNS(SVGNS, 'filter');
    f.setAttribute('id', 'farina-' + i);
    f.setAttribute('x', '-5%'); f.setAttribute('y', '-10%'); f.setAttribute('width', '110%'); f.setAttribute('height', '120%');
    f.setAttribute('color-interpolation-filters', 'sRGB');
    var t = document.createElementNS(SVGNS, 'feTurbulence');
    t.setAttribute('type', 'fractalNoise'); t.setAttribute('baseFrequency', '0.85'); t.setAttribute('numOctaves', '2'); t.setAttribute('seed', String(7 + i * 13)); t.setAttribute('result', 'grana');
    var cm = document.createElementNS(SVGNS, 'feColorMatrix');
    cm.setAttribute('in', 'grana'); cm.setAttribute('type', 'matrix'); cm.setAttribute('result', 'alfa');
    var co = document.createElementNS(SVGNS, 'feComposite');
    co.setAttribute('in', 'SourceGraphic'); co.setAttribute('in2', 'alfa'); co.setAttribute('operator', 'in');
    f.appendChild(t); f.appendChild(cm); f.appendChild(co);
    setacci.appendChild(f);
    return cm;
  }
  function setGrana(cm, o) {   // alpha = 3·R + o: con o = -3 niente, con o = 1 tutto (testo pieno)
    cm.setAttribute('values', '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 ' + o.toFixed(3));
  }
  var posaTitolo = function (el) { el.style.filter = ''; el.setAttribute('data-farina', 'posata'); };
  titoli.forEach(function (el) { el.setAttribute('data-farina', farinaViva ? 'grana' : 'posata'); });
  var posaHero = null;
  if (farinaViva) {
    titoli.forEach(function (el, i) {
      var cm = mkSetaccio(i);
      setGrana(cm, -3);
      el.style.filter = 'url(#farina-' + i + ')';
      var proxy = { o: -3 };
      var posa = function () {
        if (el.getAttribute('data-farina') !== 'grana') return;
        el.setAttribute('data-farina', 'in-posa');
        gsap.to(proxy, { o: 1, duration: 1.7, ease: 'power1.inOut', onUpdate: function () { setGrana(cm, proxy.o); }, onComplete: function () { posaTitolo(el); } });
      };
      if (el.id === 'titolo') { posaHero = posa; }
      else ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: posa });
    });
    /* rete di sicurezza: qualunque cosa succeda, dopo 6 s i titoli sono testo pulito */
    setTimeout(function () { titoli.forEach(function (el) { if (el.getAttribute('data-farina') === 'grana' && el.id === 'titolo') posaTitolo(el); }); }, 6000);
  }

  /* entrata: chiamata dal plumbing a fine intro. Il titolo si posa, il resto sale. */
  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    if (posaHero) posaHero();
    gsap.from('.apertura__testo > :not(h1)', { y: 18, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out', delay: .5 });
    gsap.from('.apertura__foto', { y: 24, opacity: 0, duration: .8, ease: 'power3.out', delay: .4 });
  };
})();
