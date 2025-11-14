(function(){
'use strict';

// Splash
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.style.opacity = '0';
    setTimeout(() => {
      splash.remove();
      const home = document.getElementById('home-card');
      if (home) home.classList.add('show');
      document.getElementById('footer-watermark').classList.add('show');
    }, 1500);
  }, 2000);
});

// Age Calculator
function convert() {
  const ageInput = document.getElementById('age');
  const err = document.getElementById('age-error');
  const raw = ageInput.value.replace(/,/g, '');
  const age = parseFloat(raw);
  if (isNaN(age) || age < 0) {
    err.textContent = 'Please enter a valid non-negative number.';
    ageInput.setAttribute('aria-invalid', 'true');
    ageInput.focus();
    return;
  }
  err.textContent = '';
  ageInput.removeAttribute('aria-invalid');
  const totalHours = age / 41.656;
  let D = Math.floor(totalHours / 24);
  let H = Math.floor(totalHours % 24);
  let M = Math.floor((totalHours * 60) % 60);
  let S = Math.round((totalHours * 3600) % 60);
  if (S === 60) { S = 0; M += 1; }
  if (M === 60) { M = 0; H += 1; }
  if (H === 24) { H = 0; D += 1; }
  let output = '';
  if (D > 0) output = `${D} day${D!==1?'s':''} ${H} hour${H!==1?'s':''}`;
  else if (H > 0) output = `${H} hour${H!==1?'s':''} ${M} minute${M!==1?'s':''}`;
  else output = `${M} minute${M!==1?'s':''} ${S} second${S!==1?'s':''}`;
  document.getElementById('label').innerText = "Your age in Jehovah’s eyes:";
  const r = document.getElementById('result');
  r.classList.remove('show'); r.textContent = output;
  setTimeout(() => r.classList.add('show'), 30);
  document.getElementById('reset-btn').style.display = 'inline-block';
}
function resetForm() {
  document.getElementById('age').value = '';
  document.getElementById('label').innerText = '';
  document.getElementById('result').innerText = '';
  document.getElementById('reset-btn').style.display = 'none';
}

// Generic card switching
function switchCards(fromId, toId) {
  const from = document.getElementById(fromId);
  const to = document.getElementById(toId);
  if (!from || !to || from === to) return;
  from.classList.remove('active');
  to.classList.add('active');
  from.style.opacity = '0';
  setTimeout(() => {
    from.classList.add('hidden');
    to.classList.remove('hidden');
    setTimeout(() => { to.style.opacity = '1'; }, 50);
  }, 400);
}

// Card switching
function openBCE() {
  switchCards('age-card', 'bce-card');
}
function openAge() {
  switchCards('bce-card', 'age-card');
}

// BCE/CE Calculator
function calculateYears() {
  const yvRaw = document.getElementById('yearInput').value, era = document.getElementById('eraInput').value;
  const yv = yvRaw.replace(/,/g, '');
  const resultEl = document.getElementById('resultBCE'), ratioEl = document.getElementById('ratio');
  const calcBtn = document.getElementById('calcBtn'), newDateBtn = document.getElementById('newDateBtn');
  const year = parseInt(yv,10);
  if (isNaN(year)) { resultEl.textContent="Please enter a valid year."; ratioEl.textContent=""; return; }
  if (year < 1) { resultEl.textContent = `Please enter a year of 1 or greater for ${era}.`; ratioEl.textContent = ""; return; }
  const current = new Date().getFullYear();
  const numericYear = (era === "BCE") ? -year + 1 : year;
  const diff = current - numericYear;
  const absDiff = Math.abs(diff);
  if (diff >= 0) {
    resultEl.innerHTML = `The year <strong>${year} ${era}</strong> was <strong>${diff.toLocaleString()}</strong> years ago (as of ${current} CE).`;
  } else {
    resultEl.innerHTML = `The year <strong>${year} ${era}</strong> is in <strong>${absDiff.toLocaleString()}</strong> years (as of ${current} CE).`;
  }
  const daysJehovah = absDiff / 1000;
  const roundedDays = Math.floor(daysJehovah);
  const hrs = (daysJehovah * 24) % 24;
  const mins = (hrs % 1) * 60;
  const parts = [];
  if (roundedDays > 0) parts.push(`${roundedDays} day${roundedDays!==1?'s':''}`);
  if (Math.floor(hrs) > 0) parts.push(`${Math.floor(hrs)} hour${Math.floor(hrs)!==1?'s':''}`);
  parts.push(`${Math.floor(mins)} minute${Math.floor(mins)!==1?'s':''}`);
  const formatted = parts.length>1?parts.slice(0,-1).join(' ')+' and '+parts.slice(-1):parts[0];
  ratioEl.innerHTML = diff >= 0
    ? `In Jehovah’s view, that’s <strong>${formatted}</strong>.`
    : `In Jehovah’s view, that’s in <strong>${formatted}</strong>.`;
  resultEl.style.opacity='0'; ratioEl.style.opacity='0'; resultEl.style.transform='translateY(8px)'; ratioEl.style.transform='translateY(8px)';
  setTimeout(()=>{resultEl.style.opacity='1';resultEl.style.transform='translateY(0)';},50);
  setTimeout(()=>{ratioEl.style.opacity='1';ratioEl.style.transform='translateY(0)';},350);
  calcBtn.style.display='none'; newDateBtn.style.display='inline-block';
}
function resetFormBCE() {
  document.getElementById('yearInput').value=''; document.getElementById('resultBCE').textContent=''; document.getElementById('ratio').textContent='';
  document.getElementById('calcBtn').style.display='inline-block'; document.getElementById('newDateBtn').style.display='none';
}

// Modal
let __lastFocused = null;
let __modalKeyHandler = null;
function openModal() {
  const modal = document.getElementById('infoModal');
  __lastFocused = document.activeElement;
  modal.classList.add('show');
  document.body.style.overflow='hidden';
  const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (first) first.focus();
  __modalKeyHandler = (e) => {
    if (e.key === 'Escape') { closeModal(); }
    if (e.key === 'Tab') {
      if (focusables.length === 0) { e.preventDefault(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', __modalKeyHandler);
  modal.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); }, { once: true });
}
function closeModal() {
  const modal = document.getElementById('infoModal');
  modal.classList.remove('show');
  document.body.style.overflow='';
  if (__modalKeyHandler) { document.removeEventListener('keydown', __modalKeyHandler); __modalKeyHandler = null; }
  if (__lastFocused && typeof __lastFocused.focus === 'function') { __lastFocused.focus(); }
}

// Keyboard shortcuts and input sanitation
try {
  document.getElementById('age').addEventListener('keydown', (e) => { if (e.key === 'Enter') convert(); });
  document.getElementById('yearInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') calculateYears(); });
  document.getElementById('eraInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') calculateYears(); });
  document.getElementById('yearInput').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/,/g, ''); });
} catch {}

// Service Worker
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(()=>{});

// Wire events (no inline handlers)
window.addEventListener('DOMContentLoaded', () => {
  const byId = (id) => document.getElementById(id);
  const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

  on(byId('age-calc-btn'), 'click', (e) => { e.preventDefault(); convert(); });
  on(byId('reset-btn'), 'click', (e) => { e.preventDefault(); resetForm(); });
  on(byId('open-bce-btn'), 'click', (e) => { e.preventDefault(); openBCE(); });
  on(byId('back-age-btn'), 'click', (e) => { e.preventDefault(); openAge(); });
  on(byId('home-age-btn'), 'click', (e) => { e.preventDefault(); switchCards('home-card', 'age-card'); });
  on(byId('home-bce-btn'), 'click', (e) => { e.preventDefault(); switchCards('home-card', 'bce-card'); });
  on(byId('calcBtn'), 'click', (e) => { e.preventDefault(); calculateYears(); });
  on(byId('newDateBtn'), 'click', (e) => { e.preventDefault(); resetFormBCE(); });
  on(byId('more-info-link'), 'click', (e) => { e.preventDefault(); openModal(); });
  on(byId('modal-close-btn'), 'click', (e) => { e.preventDefault(); closeModal(); });

  // Install button (Chrome/Edge only)
  let deferredPrompt = null;
  const installBtn = byId('install-btn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
  });
  on(installBtn, 'click', async (e) => {
    e.preventDefault();
    if (!deferredPrompt) return;
    installBtn.classList.add('hidden');
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch {}
    deferredPrompt = null;
  });
  window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.classList.add('hidden');
    deferredPrompt = null;
  });
});

})();
