(() => {
  'use strict';
  const configElement = document.getElementById('sagir-measurement-config');
  if (!configElement) return;
  let config;
  try { config = JSON.parse(configElement.textContent); } catch { return; }
  const local = ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname) || location.protocol === 'file:';
  if (local || config.preview) return;
  const preferenceKey = 'sagir-analytics-consent-v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const privacySignal = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  const knownSources = { 'chatgpt.com': 'chatgpt', chatgpt: 'chatgpt', google: 'google', bing: 'bing', copilot: 'copilot', perplexity: 'perplexity' };
  function source() {
    const tagged = new URLSearchParams(location.search).get('utm_source')?.toLowerCase();
    if (knownSources[tagged]) return knownSources[tagged];
    if (!document.referrer) return 'direct';
    try {
      const ref = new URL(document.referrer);
      if (ref.origin === location.origin) return 'internal';
      const host = ref.hostname.replace(/^www\./, '');
      if (/^google\.(com|com\.tr|co\.uk|no|de|nl|se|dk|fr|be)$/.test(host)) return 'google';
      if (host === 'bing.com') return 'bing';
      if (host === 'chatgpt.com' || host === 'chat.openai.com') return 'chatgpt';
      if (host === 'copilot.microsoft.com') return 'copilot';
      if (host === 'perplexity.ai') return 'perplexity';
      return 'referral';
    } catch { return 'direct'; }
  }
  const context = { page: config.page, lang: config.lang, source: source() };
  let consent = null;
  let gaStarted = false;
  const gaId = /^G-[A-Z0-9]+$/.test(config.ga4_id || '') ? config.ga4_id : '';
  try {
    const saved = gaId ? JSON.parse(localStorage.getItem(preferenceKey)) : null;
    if (saved && ['granted', 'denied'].includes(saved.choice) && saved.expires > Date.now()) consent = saved.choice;
  } catch { /* Storage is optional; a blocked browser still supports contact links. */ }
  if (privacySignal) consent = 'denied';
  const panel = document.querySelector('[data-analytics-panel]');
  const settings = document.querySelector('[data-analytics-settings]');
  let panelOpener = null;
  function updateSettings() {
    if (settings) settings.hidden = consent === 'granted' && !config.is_cookie_policy;
  }

  function googleEvent(name, extra = {}) {
    if (!gaStarted || consent !== 'granted' || privacySignal) return;
    window.gtag('event', name, { page_code: config.page, matter: config.matter, site_language: config.lang, source_category: context.source, ...extra });
  }
  function startGoogle() {
    if (!gaId || gaStarted || consent !== 'granted' || privacySignal) return;
    gaStarted = true;
    window['ga-disable-' + gaId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    let referrer = '';
    try { if (document.referrer) referrer = new URL(document.referrer).origin; } catch { /* No raw referrer. */ }
    const googleConfig = {
      send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false,
      page_location: location.origin + location.pathname, page_referrer: referrer, cookie_flags: 'SameSite=Lax;Secure',
      cookie_expires: 180 * 24 * 60 * 60, cookie_update: false
    };
    // Set these globally before initialization as well as on the destination. The real
    // Google tag can otherwise emit an automatic page_view and use its default cookie TTL.
    window.gtag('set', googleConfig);
    window.gtag('js', new Date());
    window.gtag('config', gaId, googleConfig);
    googleEvent('page_view', { page_location: location.origin + location.pathname, page_referrer: referrer });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);
  }
  function clearGoogleCookies() {
    for (const item of document.cookie.split(';')) {
      const name = item.split('=')[0].trim();
      if (!/^_ga(?:_|$)|^_gid$|^_gat/.test(name)) continue;
      for (const domain of ['', location.hostname, '.' + location.hostname]) {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain ? '; Domain=' + domain : ''}`;
      }
    }
  }
  function choose(value) {
    const wasStarted = gaStarted;
    consent = privacySignal ? 'denied' : value;
    try { localStorage.setItem(preferenceKey, JSON.stringify({ choice: consent, expires: Date.now() + lifetime })); } catch { /* Keep the choice in memory. */ }
    if (panel) panel.hidden = true;
    updateSettings();
    if (panelOpener) {
      if (!settings.hidden) panelOpener.focus();
      else document.querySelector('[data-cookie-policy-link]')?.focus({ preventScroll: true });
    }
    if (consent === 'granted') startGoogle();
    else {
      if (gaId) window['ga-disable-' + gaId] = true;
      clearGoogleCookies();
      // Unload the Google runtime after withdrawal; next load is blocked by the saved choice.
      if (wasStarted) location.reload();
    }
  }
  if (gaId && settings && panel) {
    updateSettings();
    settings.addEventListener('click', () => { panelOpener = settings; panel.hidden = false; panel.querySelector('[data-analytics-deny]').focus(); });
    panel.querySelector('[data-analytics-allow]').disabled = privacySignal;
    panel.querySelector('[data-analytics-allow]').addEventListener('click', () => choose('granted'));
    panel.querySelector('[data-analytics-deny]').addEventListener('click', () => choose('denied'));
    panel.querySelector('[data-analytics-close]').addEventListener('click', () => choose('denied'));
    if (privacySignal) {
      const note = document.createElement('p');
      note.textContent = config.privacy_signal_text;
      panel.querySelector('.analytics-actions').before(note);
    }
    panel.hidden = consent !== null;
    startGoogle();
  }

  function countClick(channel) {
    googleEvent('contact_click', { contact_channel: channel });
    if (!config.endpoint || privacySignal) return;
    fetch(config.endpoint, {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...context, event: 'contact_click', channel })
    }).catch(() => {}); // Measurement must never block a contact action.
  }
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.protocol === 'mailto:') countClick('email');
    else if (url.protocol === 'tel:') countClick('phone');
    else if (url.hostname === 'wa.me') countClick('whatsapp');
    else if (url.origin === location.origin && config.contact_path && url.pathname === config.contact_path) countClick('form');
  });
  // The form dispatches this only after the delivery provider has accepted the message.
  document.addEventListener('sagir:contact-accepted', event => {
    const matters = ['company-formation', 'inheritance', 'property-purchase', 'other'];
    googleEvent('contact_form_accepted', { matter: matters.includes(event.detail?.matter) ? event.detail.matter : config.matter });
  });
  window.SagirMeasurement = Object.freeze({
    context: () => privacySignal ? null : { ...context },
    // Google Analytics still needs separate user consent; there is no unique identifier here.
  });
})();
