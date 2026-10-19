(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const config = window.INVITATION || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gate = $('#gate');
  const invitation = $('#invitation');
  let gateTimer;
  let entered = false;
  const music = $('#background-music');
  let musicOn = false;
  let musicRequest = 0;
  music.volume = 0.28;

  if (config.names) document.querySelectorAll('[data-couple]').forEach(el => {
    el.textContent = config.names;
    el.hidden = false;
  });
  if (config.date) {
    $('#event-date').textContent = config.date;
    document.querySelectorAll('[data-event-date]').forEach(el => el.textContent = config.date);
  }
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
  function enter(skip = false, withMusic = false) {
    if (entered) return;
    entered = true;
    // Keep playback inside the click gesture so mobile browsers can start it.
    if (withMusic && !musicOn) startMusic();
    invitation.inert = false;
    gate.classList.add('opening');
    document.documentElement.classList.add('entered');
    if (skip || reducedMotion.matches) finishEntrance();
    else gateTimer = window.setTimeout(finishEntrance, 2350);
  }
  $('#enter-button').addEventListener('click', () => enter(false, true));
  $('#skip-intro').addEventListener('click', () => enter(true, true));
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

  // Start the supplied recording when opening the invitation or using Música.
  function updateSoundButton() {
    $('#sound-button').setAttribute('aria-pressed', String(musicOn));
    $('#sound-button').setAttribute('aria-label', musicOn ? 'Silenciar música de la invitación' : 'Activar música de la invitación');
    $('#sound-label').textContent = musicOn ? 'Silenciar' : 'Música';
  }
  async function startMusic() {
    const request = ++musicRequest;
    musicOn = true;
    updateSoundButton();
    $('#global-status').textContent = '';
    try {
      if (music.error) music.load();
      await music.play();
      if (request !== musicRequest) return;
      if (!musicOn || document.hidden) music.pause();
    } catch {
      if (request !== musicRequest) return;
      musicOn = false;
      updateSoundButton();
      $('#global-status').textContent = 'No se pudo iniciar la música. Pulsa Música para intentarlo de nuevo.';
    }
  }
  $('#sound-button').addEventListener('click', () => {
    if (musicOn) {
      musicRequest++;
      musicOn = false;
      music.pause();
      updateSoundButton();
    } else startMusic();
  });
  music.addEventListener('error', () => {
    musicRequest++;
    musicOn = false;
    updateSoundButton();
    $('#global-status').textContent = 'No se pudo cargar la música. Pulsa Música para intentarlo de nuevo.';
  });
  document.addEventListener('visibilitychange', () => {
    if (!musicOn) return;
    if (document.hidden) {
      musicRequest++;
      music.pause();
    } else startMusic();
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
})();
