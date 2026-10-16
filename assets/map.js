const mapButton = document.querySelector('[data-map-toggle]');
if (mapButton) {
  const container = document.getElementById(mapButton.getAttribute('aria-controls'));
  mapButton.hidden = false;
  mapButton.addEventListener('click', () => {
    const open = mapButton.getAttribute('aria-expanded') !== 'true';
    if (open) {
      const frame = document.createElement('iframe');
      frame.src = mapButton.dataset.mapSrc;
      frame.title = mapButton.dataset.mapTitle;
      frame.referrerPolicy = 'no-referrer';
      frame.allowFullscreen = true;
      container.replaceChildren(frame);
    } else {
      container.replaceChildren();
    }
    container.hidden = !open;
    mapButton.setAttribute('aria-expanded', String(open));
    mapButton.textContent = open ? mapButton.dataset.mapHide : mapButton.dataset.mapShow;
  });
}
