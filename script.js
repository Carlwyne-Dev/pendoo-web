const COUNTER_NS = 'pendoo-web-admin';
const ADMIN_PW = 'xyuuki18';

document.addEventListener('DOMContentLoaded', () => {
  // ── Scroll animations ──────────────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px', threshold: 0.1 });

  document.querySelectorAll('.scroll-trigger').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

  // ── Track page view ────────────────────────────────────────────────
  fetch(`https://counterapi.dev/api/${COUNTER_NS}/page-views/up`).catch(() => {});

  // ── Track download click ───────────────────────────────────────────
  const dlBtn = document.getElementById('download');
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      fetch(`https://counterapi.dev/api/${COUNTER_NS}/download-clicks/up`).catch(() => {});
    });
  }

  // ── Triple-click on year to open admin ────────────────────────────
  let clickCount = 0;
  let clickTimer = null;
  const yearEl = document.getElementById('year-trigger');

  yearEl.style.cursor = 'pointer';
  yearEl.addEventListener('click', () => {
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 600);
    if (clickCount >= 3) {
      clickCount = 0;
      showPwModal();
    }
  });

  // ── Password modal logic ───────────────────────────────────────────
  const pwOverlay  = document.getElementById('pw-overlay');
  const pwInput    = document.getElementById('pw-input');
  const pwError    = document.getElementById('pw-error');
  const pwSubmit   = document.getElementById('pw-submit');
  const pwCancel   = document.getElementById('pw-cancel');

  function showPwModal() {
    pwInput.value = '';
    pwError.classList.add('hidden');
    pwOverlay.classList.remove('hidden');
    setTimeout(() => pwInput.focus(), 50);
  }

  function hidePwModal() {
    pwOverlay.classList.add('hidden');
  }

  function checkPassword() {
    if (pwInput.value === ADMIN_PW) {
      hidePwModal();
      showStatsModal();
    } else {
      pwError.classList.remove('hidden');
      pwInput.value = '';
      pwInput.focus();
    }
  }

  pwSubmit.addEventListener('click', checkPassword);
  pwCancel.addEventListener('click', hidePwModal);
  pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') checkPassword(); });
  pwOverlay.addEventListener('click', (e) => { if (e.target === pwOverlay) hidePwModal(); });

  // ── Stats modal logic ──────────────────────────────────────────────
  const statsOverlay = document.getElementById('stats-overlay');
  const statsClose   = document.getElementById('stats-close');
  const statViews    = document.getElementById('stat-views');
  const statClicks   = document.getElementById('stat-clicks');

  async function showStatsModal() {
    statViews.textContent  = '…';
    statClicks.textContent = '…';
    statsOverlay.classList.remove('hidden');

    try {
      const [viewsRes, clicksRes] = await Promise.all([
        fetch(`https://counterapi.dev/api/${COUNTER_NS}/page-views`),
        fetch(`https://counterapi.dev/api/${COUNTER_NS}/download-clicks`),
      ]);
      const viewsData  = await viewsRes.json();
      const clicksData = await clicksRes.json();
      statViews.textContent  = (viewsData.count  ?? '—').toLocaleString();
      statClicks.textContent = (clicksData.count ?? '—').toLocaleString();
    } catch {
      statViews.textContent  = 'Error';
      statClicks.textContent = 'Error';
    }
  }

  statsClose.addEventListener('click', () => statsOverlay.classList.add('hidden'));
  statsOverlay.addEventListener('click', (e) => { if (e.target === statsOverlay) statsOverlay.classList.add('hidden'); });
});
