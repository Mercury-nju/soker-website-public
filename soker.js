/* Adapt the recovered presentation's controls without changing its scene choreography. */
const controls = document.querySelectorAll('[role="button"], .navigation-item, .footer-mobile-navigation-inner-item');
controls.forEach(control => {
  control.setAttribute('tabindex', '0');
  control.setAttribute('role', 'button');
  control.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      control.click();
    }
  });
});

let returnFocus = null;
const dialogs = [...document.querySelectorAll('[role="dialog"]')];
const closeDialogs = () => {
  document.dispatchEvent(new CustomEvent('soker:close-dialog'));
};
document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', closeDialogs));

document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  const destination = link.getAttribute('href');
  const index = { '#section-0': 0, '#section-3': 1, '#section-12': 2 }[destination];
  if (index !== undefined) {
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('soker:navigate', { detail: { index } }));
  } else if (destination === '#workflow') {
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('soker:workflow'));
  }
});

dialogs.forEach(dialog => {
  dialog.setAttribute('aria-hidden', 'true');
  dialog.inert = true;
  new MutationObserver(() => {
    const open = dialog.classList.contains('--is-opened');
    dialog.setAttribute('aria-hidden', String(!open));
    dialog.inert = !open;
    if (open) {
      returnFocus = document.activeElement;
      dialog.querySelector('[data-close-dialog]')?.focus({ preventScroll: true });
    } else if (dialog.contains(document.activeElement)) {
      returnFocus?.focus({ preventScroll: true });
    }
  }).observe(dialog, { attributes: true, attributeFilter: ['class'] });
});

document.addEventListener('keydown', event => {
  const dialog = dialogs.find(item => item.classList.contains('--is-opened'));
  if (!dialog) return;
  if (event.key === 'Escape') closeDialogs();
  if (event.key === 'Tab') {
    const items = [...dialog.querySelectorAll('a[href], button, [tabindex="0"]')];
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
});

const betaPanel = document.getElementById('soker-beta');
if (betaPanel) {
  ['wheel', 'touchstart', 'touchmove'].forEach(type => {
    betaPanel.addEventListener(type, event => event.stopPropagation(), { passive: true });
  });
  betaPanel.addEventListener('keydown', event => {
    event.stopPropagation();
    if (event.key === 'Escape' && !betaPanel.querySelector('dialog[open]')) document.dispatchEvent(new CustomEvent('soker:beta-back'));
  });
  betaPanel.querySelector('[data-beta-back]').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('soker:beta-back'));
  });

}
document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (link?.getAttribute('href') === '#beta') {
    event.preventDefault();
    document.dispatchEvent(new CustomEvent('soker:beta'));
  }
  if (['#beta-apply', '#join'].includes(link?.getAttribute('href'))) {
    event.preventDefault();
    document.getElementById(link.getAttribute('href').slice(1)).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
});

/* Pause the guided playback whenever the visitor takes control. */
const playbackButton = document.createElement('button');
playbackButton.type = 'button';
playbackButton.id = 'soker-playback';
playbackButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
playbackButton.setAttribute('aria-pressed', 'false');
playbackButton.setAttribute('aria-label', '自动缓慢播放产品介绍');
document.getElementById('ui').append(playbackButton);
const pausePlayback = () => document.dispatchEvent(new CustomEvent('soker:playback', { detail: { playing: false } }));
playbackButton.addEventListener('click', event => {
  event.stopPropagation();
  document.dispatchEvent(new CustomEvent('soker:playback'));
});
document.addEventListener('soker:playback-state', event => {
  const playing = event.detail.playing;
  playbackButton.innerHTML = playing
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM14 5h4v14h-4z" fill="currentColor"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  playbackButton.setAttribute('aria-pressed', String(playing));
  playbackButton.setAttribute('aria-label', playing ? '暂停自动播放' : '自动缓慢播放产品介绍');
});
['wheel', 'touchstart', 'pointerdown'].forEach(type => document.addEventListener(type, event => {
  if (!playbackButton.contains(event.target)) pausePlayback();
}, { passive: true, capture: true }));
document.addEventListener('keydown', event => {
  if (!playbackButton.contains(event.target) && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Escape', 'Tab'].includes(event.key)) pausePlayback();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pausePlayback(); });
