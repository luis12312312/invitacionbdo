(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const config = window.INVITATION || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gate = $('#gate');
  const invitation = $('#invitation');
  let gateTimer;
  let entered = false;
  let musicContext;
  let musicTimer;
  let musicOn = false;
  let noteIndex = 0;

  if (config.names) document.querySelectorAll('[data-couple]').forEach(el => {
    el.textContent = config.names;
    el.hidden = false;
  });
  if (config.date) $('#event-date').textContent = config.date;
  if (config.time) $('#event-time').textContent = config.time;
  else if (config.date) $('#event-time').textContent = 'Horario por confirmar';
  if (config.address) $('#event-address').textContent = config.address;
  if (config.date && config.time && config.address) $('#event-note').textContent = 'Te esperamos para compartir este día tan especial.';
  $('#account-number').textContent = config.account || '7869990';
  const confirmationPhone = config.whatsapp || '+56 9 7476 0287';
  const confirmationMessage = `¡Hola! Quisiera confirmar mi asistencia a las bodas de oro de ${config.names || 'Luis y Aurora'}${config.date ? ', el ' + config.date.charAt(0).toLowerCase() + config.date.slice(1) : ''}.`;
  $('#rsvp-link').href = `https://wa.me/${confirmationPhone.replace(/\D/g, '')}?text=${encodeURIComponent(confirmationMessage)}`;
  $('#rsvp-phone').textContent = confirmationPhone;

  invitation.inert = true;
  function finishEntrance() {
    gate.classList.add('finished');
    gate.setAttribute('aria-hidden', 'true');
    $('#inicio').focus({ preventScroll: true });
  }
  function enter(skip = false) {
    if (entered) return;
    entered = true;
    invitation.inert = false;
    gate.classList.add('opening');
    document.documentElement.classList.add('entered');
    if (skip || reducedMotion.matches) finishEntrance();
    else gateTimer = window.setTimeout(finishEntrance, 2350);
  }
  $('#enter-button').addEventListener('click', () => enter());
  $('#skip-intro').addEventListener('click', () => enter(true));
  $('#replay-button').addEventListener('click', () => {
    window.clearTimeout(gateTimer);
    window.scrollTo({ top: 0, behavior: 'instant' });
    entered = false;
    invitation.inert = true;
    gate.classList.remove('opening', 'finished');
    gate.removeAttribute('aria-hidden');
    document.documentElement.classList.remove('entered');
    $('#enter-button').focus({ preventScroll: true });
  });
  gate.addEventListener('keydown', event => {
    if (event.key === 'Escape') enter(true);
    if (event.key !== 'Tab') return;
    const first = $('#enter-button');
    const last = $('#skip-intro');
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  $('#enter-button').focus({ preventScroll: true });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));

  // A gentle, original piano-like arpeggio. It starts only after an explicit click.
  const notes = [261.63, 329.63, 392, 523.25, 440, 349.23, 293.66, 349.23, 220, 261.63, 329.63, 440, 196, 246.94, 293.66, 392];
  function playNote() {
    if (!musicOn || !musicContext || musicContext.state !== 'running') return;
    const time = musicContext.currentTime;
    const frequency = notes[noteIndex++ % notes.length];
    [1, 2, 3].forEach((harmonic, index) => {
      const oscillator = musicContext.createOscillator();
      const envelope = musicContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * harmonic;
      envelope.gain.setValueAtTime(0, time);
      envelope.gain.linearRampToValueAtTime(0.035 / (harmonic * harmonic), time + 0.018);
      envelope.gain.exponentialRampToValueAtTime(0.0001, time + 2.8 - index * 0.3);
      oscillator.connect(envelope);
      envelope.connect(musicContext.destination);
      oscillator.start(time);
      oscillator.stop(time + 3);
      oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    });
  }
  function updateSoundButton() {
    $('#sound-button').setAttribute('aria-pressed', String(musicOn));
    $('#sound-button').setAttribute('aria-label', musicOn ? 'Silenciar música de piano' : 'Activar música de piano');
    $('#sound-label').textContent = musicOn ? 'Silenciar' : 'Música';
  }
  $('#sound-button').addEventListener('click', async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) { $('#global-status').textContent = 'Tu navegador no admite la música de esta invitación.'; return; }
      if (!musicContext) musicContext = new AudioContext();
      musicOn = !musicOn;
      window.clearInterval(musicTimer);
      if (musicOn) {
        await musicContext.resume();
        playNote();
        musicTimer = window.setInterval(playNote, 740);
      } else await musicContext.suspend();
      updateSoundButton();
    } catch {
      musicOn = false;
      updateSoundButton();
      $('#global-status').textContent = 'No se pudo iniciar la música en este navegador.';
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!musicContext || !musicOn) return;
    if (document.hidden) musicContext.suspend();
    else musicContext.resume();
  });

  const giftDialog = $('#gift-dialog');
  $('#gift-button').addEventListener('click', () => {
    $('#copy-status').textContent = '';
    giftDialog.showModal();
  });
  $('#close-gift').addEventListener('click', () => giftDialog.close());
  giftDialog.addEventListener('click', event => {
    if (event.target !== giftDialog) return;
    const rect = giftDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) giftDialog.close();
  });
  const weddingDialog = $('#wedding-dialog');
  $('#wedding-photo-button').addEventListener('click', () => weddingDialog.showModal());
  $('#close-wedding').addEventListener('click', () => weddingDialog.close());
  weddingDialog.addEventListener('click', event => {
    if (event.target !== weddingDialog) return;
    const rect = weddingDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) weddingDialog.close();
  });
  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement('textarea');
    field.value = value;
    field.setAttribute('aria-label', 'Texto para copiar');
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    (giftDialog.open ? giftDialog : document.body).appendChild(field);
    field.select();
    const copied = document.execCommand('copy');
    field.remove();
    if (!copied) throw new Error('Copy unavailable');
  }
  $('#copy-account').addEventListener('click', async () => {
    try { await copyText(config.account || '7869990'); $('#copy-status').textContent = 'Número copiado con cariño.'; }
    catch { $('#copy-status').textContent = 'Puedes seleccionar y copiar el número que aparece arriba.'; }
  });
  $('#share-button').addEventListener('click', async () => {
    if (window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      $('#share-status').textContent = 'Podrás compartir el enlace cuando la invitación esté publicada.';
      return;
    }
    const url = window.location.href.split('#')[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: '50 años del mismo amor', text: 'Nuestra historia continúa. Te invitamos a celebrar nuestras bodas de oro.', url });
      } else { await copyText(url); $('#share-status').textContent = 'Enlace copiado para compartir.'; }
    } catch (error) {
      if (error.name !== 'AbortError') $('#share-status').textContent = 'Puedes copiar el enlace desde la barra de tu navegador.';
    }
  });
})();
