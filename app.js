(function(){
'use strict';

function computeJehovahAge(age) {
  if (isNaN(age) || age < 0) return null;
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
  return { D, H, M, S, output };
}

function computeBceCeDiff(year, era, currentYear) {
  if (isNaN(year)) return null;
  if (year < 1) return null;
  const current = currentYear || new Date().getFullYear();
  const numericYear = (era === "BCE") ? -year + 1 : year;
  const diff = current - numericYear;
  const absDiff = Math.abs(diff);
  const daysJehovah = absDiff / 1000;
  const roundedDays = Math.floor(daysJehovah);
  const hrs = (daysJehovah * 24) % 24;
  const mins = (hrs % 1) * 60;
  const parts = [];
  if (roundedDays > 0) parts.push(`${roundedDays} day${roundedDays!==1?'s':''}`);
  if (Math.floor(hrs) > 0) parts.push(`${Math.floor(hrs)} hour${Math.floor(hrs)!==1?'s':''}`);
  parts.push(`${Math.floor(mins)} minute${Math.floor(mins)!==1?'s':''}`);
  const formatted = parts.length>1?parts.slice(0,-1).join(' ')+' and '+parts.slice(-1):parts[0];
  return { current, numericYear, diff, absDiff, daysJehovah, formatted };
}

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
  const calcBtn = document.getElementById('age-calc-btn');
  const resetBtn = document.getElementById('reset-btn');
  const raw = ageInput.value.replace(/,/g, '');
  const trimmed = raw.trim();
  const age = parseFloat(raw);

  // More specific validation messages
  if (!trimmed) {
    err.textContent = 'Please enter your age.';
    ageInput.setAttribute('aria-invalid', 'true');
    ageInput.classList.add('input-error');
    ageInput.focus();
    return;
  }
  if (Number.isNaN(age)) {
    err.textContent = 'Please enter digits only (0–9).';
    ageInput.setAttribute('aria-invalid', 'true');
    ageInput.classList.add('input-error');
    ageInput.focus();
    return;
  }
  if (age < 0) {
    err.textContent = 'Age cannot be negative.';
    ageInput.setAttribute('aria-invalid', 'true');
    ageInput.classList.add('input-error');
    ageInput.focus();
    return;
  }

  const result = computeJehovahAge(age);
  if (!result) {
    err.textContent = 'Please enter a valid non-negative number.';
    ageInput.setAttribute('aria-invalid', 'true');
    ageInput.classList.add('input-error');
    ageInput.focus();
    return;
  }
  err.textContent = '';
  ageInput.removeAttribute('aria-invalid');
  ageInput.classList.remove('input-error');

  const labelEl = document.getElementById('label');
  const r = document.getElementById('result');

  if (!labelEl || !r) return;

  labelEl.innerText = "Your age in Jehovah's eyes:";
  r.textContent = result.output;

  // Start from a faded, slightly lowered state
  labelEl.style.opacity = '0';
  labelEl.style.transform = 'translateY(8px)';
  r.style.opacity = '0';
  r.style.transform = 'translateY(8px)';

  // Staggered: label first, then numeric result (match BCE/CE card style)
  setTimeout(() => {
    labelEl.style.opacity = '1';
    labelEl.style.transform = 'translateY(0)';
  }, 50);
  setTimeout(() => {
    r.style.opacity = '1';
    r.style.transform = 'translateY(0)';
  }, 250);
  if (resetBtn) resetBtn.style.display = 'inline-block';
  if (calcBtn) calcBtn.style.display = 'none';
}
function resetForm() {
  const ageInput = document.getElementById('age');
  const labelEl = document.getElementById('label');
  const resultEl = document.getElementById('result');
  const calcBtn = document.getElementById('age-calc-btn');
  const resetBtn = document.getElementById('reset-btn');
  if (ageInput) ageInput.value = '';
  if (labelEl) labelEl.innerText = '';
  if (resultEl) resultEl.innerText = '';
  if (resetBtn) resetBtn.style.display = 'none';
  if (calcBtn) calcBtn.style.display = 'inline-block';
}

// Generic card switching
function switchCards(fromId, toId) {
  const from = document.getElementById(fromId);
  const to = document.getElementById(toId);
  if (!from || !to || from === to) return;
  // Reset calculators when leaving their cards so they reopen in a fresh state
  if (fromId === 'age-card') {
    try { resetForm(); } catch {}
  }
  if (fromId === 'bce-card') {
    try { resetFormBCE(); } catch {}
  }
  from.classList.remove('active');
  to.classList.add('active');
  from.style.opacity = '0';
  setTimeout(() => {
    from.classList.add('hidden');
    to.classList.remove('hidden');
    setTimeout(() => {
      to.style.opacity = '1';
      // Move focus appropriately when switching cards
      if (toId === 'age-card') {
        const ageInput = document.getElementById('age');
        if (ageInput && typeof ageInput.focus === 'function') {
          ageInput.focus();
        }
      } else if (toId === 'bce-card') {
        const yearInput = document.getElementById('yearInput');
        if (yearInput && typeof yearInput.focus === 'function') {
          yearInput.focus();
        }
      } else {
        // Default: focus the new card's heading for accessibility
        const heading = to.querySelector('h2[tabindex="-1"]');
        if (heading && typeof heading.focus === 'function') heading.focus();
      }
    }, 50);
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
  const yearInput = document.getElementById('yearInput');
  const yvRaw = yearInput.value, era = document.getElementById('eraInput').value;
  const yv = yvRaw.replace(/,/g, '');
  const resultEl = document.getElementById('resultBCE'), ratioEl = document.getElementById('ratio');
  const calcBtn = document.getElementById('calcBtn'), newDateBtn = document.getElementById('newDateBtn');
  const year = parseInt(yv,10);
  if (isNaN(year)) {
    resultEl.textContent="Please enter a valid year.";
    ratioEl.textContent="";
    if (yearInput) yearInput.classList.add('input-error');
    return;
  }
  if (year < 1) {
    resultEl.textContent = `Please enter a year of 1 or greater for ${era}.`;
    ratioEl.textContent = "";
    if (yearInput) yearInput.classList.add('input-error');
    return;
  }
  const data = computeBceCeDiff(year, era);
  const current = data.current;
  const numericYear = data.numericYear;
  const diff = data.diff;
  const absDiff = data.absDiff;
  if (diff >= 0) {
    resultEl.innerHTML = `The year <strong>${year} ${era}</strong> was <strong>${diff.toLocaleString()}</strong> years ago (as of ${current} CE).`;
  } else {
    resultEl.innerHTML = `The year <strong>${year} ${era}</strong> is in <strong>${absDiff.toLocaleString()}</strong> years (as of ${current} CE).`;
  }
  const formatted = data.formatted;
  ratioEl.innerHTML = diff >= 0
    ? `In Jehovah’s view, that’s <strong>${formatted}</strong>.`
    : `In Jehovah’s view, that’s in <strong>${formatted}</strong>.`;

  const labelEl = document.querySelector('#bce-card .result-label');

  // Reset starting state for staggered animation
  if (labelEl) {
    labelEl.style.opacity = '0';
    labelEl.style.transform = 'translateY(8px)';
  }
  resultEl.style.opacity='0';
  resultEl.style.transform='translateY(8px)';
  ratioEl.style.opacity='0';
  ratioEl.style.transform='translateY(8px)';

  // Staggered: label first, then main result, then ratio line
  if (labelEl) {
    setTimeout(() => {
      labelEl.style.opacity = '1';
      labelEl.style.transform = 'translateY(0)';
    }, 50);
  }
  setTimeout(()=>{
    resultEl.style.opacity='1';
    resultEl.style.transform='translateY(0)';
  },250);
  setTimeout(()=>{
    ratioEl.style.opacity='1';
    ratioEl.style.transform='translateY(0)';
  },450);
  calcBtn.style.display='none'; newDateBtn.style.display='inline-block';
}
function resetFormBCE() {
  const yearInput = document.getElementById('yearInput');
  if (yearInput) yearInput.value='';
  document.getElementById('resultBCE').textContent='';
  document.getElementById('ratio').textContent='';
  const preset = document.getElementById('presetYears');
  if (preset) preset.selectedIndex = 0;
  document.getElementById('calcBtn').style.display='inline-block';
  document.getElementById('newDateBtn').style.display='none';
  // After reset, keep focus on the Enter date input for quick re-entry
  if (yearInput && typeof yearInput.focus === 'function') {
    yearInput.classList.remove('input-error');
    yearInput.focus();
  }
}

// Modal
let __lastFocused = null;
let __modalKeyHandler = null;
let __scrollLocked = false;

function lockScroll() {
  if (__scrollLocked) return;
  __scrollLocked = true;
  if (document.documentElement) document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  if (!__scrollLocked) return;
  __scrollLocked = false;
  if (document.documentElement) document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}
function openModal() {
  const modal = document.getElementById('infoModal');
  __lastFocused = document.activeElement;
  modal.classList.add('show');
  lockScroll();
  // Ensure the modal content starts scrolled to the top each time
  const modalCard = modal.querySelector('.modal-card');
  if (modalCard) modalCard.scrollTop = 0;
  const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const closeBtn = modal.querySelector('#modal-close-btn');
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  // Prefer focusing the Close button so links do not show a focus ring first
  if (closeBtn) closeBtn.focus();
  else if (first) first.focus();
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
  unlockScroll();
  if (__modalKeyHandler) { document.removeEventListener('keydown', __modalKeyHandler); __modalKeyHandler = null; }
  if (__lastFocused && typeof __lastFocused.focus === 'function') { __lastFocused.focus(); }
}

function openArticleModal1() {
  const modal = document.getElementById('articleModal1');
  if (!modal) return;
  __lastFocused = document.activeElement;
  modal.classList.add('show');
  const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  const closeBtn = modal.querySelector('#article-close-btn-1');
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (closeBtn) closeBtn.focus();
  else if (first) first.focus();
  __modalKeyHandler = (e) => {
    if (e.key === 'Escape') { closeArticleModal1(); }
    if (e.key === 'Tab') {
      if (focusables.length === 0) { e.preventDefault(); return; }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', __modalKeyHandler);
  modal.addEventListener('click', (ev) => { if (ev.target === modal) closeArticleModal1(); }, { once: true });
}

function closeArticleModal1() {
  const modal = document.getElementById('articleModal1');
  if (!modal) return;
  modal.classList.remove('show');
  // When returning from the article summary to the main info modal,
  // ensure the main modal content is scrolled back to the top.
  const mainInfoModal = document.getElementById('infoModal');
  if (mainInfoModal) {
    const mainCard = mainInfoModal.querySelector('.modal-card');
    if (mainCard) mainCard.scrollTop = 0;
  }
  // Remove the article modal's key handler and restore a focus trap on the main info modal
  if (__modalKeyHandler) {
    document.removeEventListener('keydown', __modalKeyHandler);
    __modalKeyHandler = null;
  }

  if (mainInfoModal) {
    const focusables = mainInfoModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const closeBtn = mainInfoModal.querySelector('#modal-close-btn');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    __modalKeyHandler = (e) => {
      if (e.key === 'Escape') { closeModal(); }
      if (e.key === 'Tab') {
        if (focusables.length === 0) { e.preventDefault(); return; }
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', __modalKeyHandler);
    // Ensure a sensible focus target remains in the main modal
    if (closeBtn && typeof closeBtn.focus === 'function') {
      closeBtn.focus();
    }
  }
  if (__lastFocused && typeof __lastFocused.focus === 'function') { __lastFocused.focus(); }
}

// Keyboard shortcuts and input sanitation
try {
  document.getElementById('age').addEventListener('keydown', (e) => { if (e.key === 'Enter') convert(); });
  document.getElementById('yearInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') calculateYears(); });
  document.getElementById('eraInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') calculateYears(); });
  document.getElementById('yearInput').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/,/g, ''); });
} catch {}

// Gently prevent double-tap zoom on touch devices while allowing normal taps and pinch-zoom
let __lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - __lastTouchEnd <= 300) {
    e.preventDefault();
  }
  __lastTouchEnd = now;
}, { passive: false });

// Service Worker
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(()=>{});

// Wire events (no inline handlers)
window.addEventListener('DOMContentLoaded', () => {
  const byId = (id) => document.getElementById(id);
  const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

  // Hide the "How to install" hint if already running as an installed app
  try {
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator && window.navigator.standalone;
    if (isStandalone || isIOSStandalone) {
      const installHint = document.querySelector('.home-install-note');
      if (installHint) installHint.style.display = 'none';
    }
  } catch {}

  on(byId('age-calc-btn'), 'click', (e) => { e.preventDefault(); convert(); });
  // Clear age errors as the user types
  const ageInput = byId('age');
  if (ageInput) {
    ageInput.addEventListener('input', () => {
      const err = byId('age-error');
      if (err) err.textContent = '';
      ageInput.removeAttribute('aria-invalid');
      ageInput.classList.remove('input-error');
    });
  }
  on(byId('reset-btn'), 'click', (e) => { e.preventDefault(); resetForm(); });
  on(byId('home-age-btn'), 'click', (e) => { e.preventDefault(); switchCards('home-card', 'age-card'); });
  on(byId('home-bce-btn'), 'click', (e) => { e.preventDefault(); switchCards('home-card', 'bce-card'); });
  on(byId('home-about-btn'), 'click', (e) => { e.preventDefault(); switchCards('home-card', 'about-card'); });
  on(byId('age-home-btn'), 'click', (e) => { e.preventDefault(); switchCards('age-card', 'home-card'); });
  on(byId('bce-home-btn'), 'click', (e) => { e.preventDefault(); switchCards('bce-card', 'home-card'); });
  on(byId('about-home-btn'), 'click', (e) => { e.preventDefault(); switchCards('about-card', 'home-card'); });
  on(byId('calcBtn'), 'click', (e) => { e.preventDefault(); calculateYears(); });
  on(byId('newDateBtn'), 'click', (e) => { e.preventDefault(); resetFormBCE(); });
  on(byId('home-info-btn'), 'click', (e) => { e.preventDefault(); openModal(); });
  on(byId('modal-close-btn'), 'click', (e) => { e.preventDefault(); closeModal(); });

  // Article summary modal (from link in Time Explained)
  on(byId('open-article-modal-1'), 'click', (e) => { e.preventDefault(); openArticleModal1(); });
  on(byId('article-close-btn-1'), 'click', (e) => { e.preventDefault(); closeArticleModal1(); });

  // Share this app (native share with clipboard fallback)
  const shareBtn = byId('home-share-btn');
  const shareStatus = byId('home-share-status');
  const clearShareStatusSoon = () => {
    if (!shareStatus) return;
    setTimeout(() => { shareStatus.textContent = ''; }, 2500);
  };
  on(shareBtn, 'click', async (e) => {
    e.preventDefault();
    if (!shareStatus) return;
    const shareUrl = window.location.href;
    const shareText = "Take a fresh look at time from Jehovah's perspective with this simple web app.";
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Jehovah’s View of Time",
          text: shareText,
          url: shareUrl
        });
        shareStatus.textContent = 'Share sheet opened.';
        clearShareStatusSoon();
        return;
      }
    } catch (err) {
      // If the user cancels or share fails, fall through to clipboard attempt
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        shareStatus.textContent = 'Link copied to clipboard.';
      } else {
        const tmp = document.createElement('input');
        tmp.value = shareUrl;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        document.body.removeChild(tmp);
        shareStatus.textContent = 'Link copied to clipboard.';
      }
    } catch (err2) {
      shareStatus.textContent = 'Sharing not available on this device.';
    }
    clearShareStatusSoon();
  });

  const presetYears = byId('presetYears');
  if (presetYears) {
    presetYears.addEventListener('change', (e) => {
      const select = e.target;
      const value = select.value;
      if (!value) return;
      const selected = select.options[select.selectedIndex];
      const era = selected.getAttribute('data-era') || 'CE';
      const yearInput = byId('yearInput');
      const eraInput = byId('eraInput');
      if (yearInput) yearInput.value = value;
      if (eraInput) eraInput.value = era;
      // Immediately perform the calculation so the user sees a result
      calculateYears();
    });
  }

  // Clear BCE/CE input error state on change
  const yearInputField = byId('yearInput');
  if (yearInputField) {
    yearInputField.addEventListener('input', () => {
      yearInputField.classList.remove('input-error');
    });
  }

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

window.JVTTest = {
  computeJehovahAge,
  computeBceCeDiff
};

})();
