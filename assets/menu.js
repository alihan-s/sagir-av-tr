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
// Language menu (details/summary): close on outside click and on Escape.
const languages = document.querySelector('.language-switcher');
if (languages) {
  document.addEventListener('click', event => { if (languages.open && !event.target.closest('.language-switcher')) languages.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && languages.open) { languages.open = false; languages.querySelector('summary').focus(); }
  });
}
