const button = document.querySelector('.menu-button');
const nav = document.querySelector('#site-nav');
button.hidden = false;
document.documentElement.classList.add('js');
function closeMenu() { button.setAttribute('aria-expanded', 'false'); }
button.addEventListener('click', () => button.setAttribute('aria-expanded', String(button.getAttribute('aria-expanded') !== 'true')));
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { closeMenu(); button.focus(); }
});
document.addEventListener('click', event => { if (!event.target.closest('header')) closeMenu(); });
window.matchMedia('(min-width: 801px)').addEventListener('change', closeMenu);
