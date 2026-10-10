/**
 * Every piece of remote data reaches the page through here.
 * Nothing in this file uses innerHTML with interpolated values —
 * TMDB content is community-edited, so treating it as untrusted
 * is the correct default.
 */

export function el(tag, { className, text, attrs } = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  if (attrs) for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

/** A poster card. A real <a>, so middle-click and open-in-new-tab work. */
export function movieCard(movie) {
  const card = el('a', {
    className: 'card',
    attrs: { href: `details.html?id=${movie.id}` },
  });

  const frame = el('div', { className: 'card__frame' });
  const url = movie.posterUrl('w342');

  if (url) {
    frame.appendChild(el('img', {
      className: 'card__poster',
      attrs: { src: url, alt: `Poster for ${movie.title}`, loading: 'lazy', decoding: 'async' },
    }));
  } else {
    frame.appendChild(el('div', { className: 'card__poster card__poster--none', text: 'No poster' }));
  }

  if (movie.rating) {
    frame.appendChild(el('span', { className: 'card__rating', text: movie.rating }));
  }

  card.appendChild(frame);
  card.appendChild(el('h3', { className: 'card__title', text: movie.title }));
  if (movie.year) card.appendChild(el('p', { className: 'card__year', text: movie.year }));

  return card;
}

/** Skeleton cards, so the grid doesn't collapse and rebound while loading. */
export function skeletonGrid(count = 12) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = el('div', { className: 'card card--skeleton', attrs: { 'aria-hidden': 'true' } });
    s.appendChild(el('div', { className: 'card__frame' }));
    s.appendChild(el('div', { className: 'skeleton-line' }));
    s.appendChild(el('div', { className: 'skeleton-line skeleton-line--short' }));
    frag.appendChild(s);
  }
  return frag;
}

const ERROR_COPY = {
  config:    ['No API key', 'This build needs a TMDB key in js/config.js before it can fetch anything.'],
  network:   ['No connection', 'We could not reach TMDB. Check your network and try again.'],
  ratelimit: ['Too many requests', 'TMDB is rate-limiting us. Wait a few seconds, then try again.'],
  notfound:  ['Not found', 'That title is not in TMDB any more.'],
  server:    ['TMDB is having trouble', 'The movie database returned an error. This is on their end.'],
};

export function errorState(error, onRetry) {
  const [heading, detail] = ERROR_COPY[error?.kind] ?? ERROR_COPY.server;
  const box = el('div', { className: 'state', attrs: { role: 'alert' } });
  box.appendChild(el('h2', { className: 'state__title', text: heading }));
  box.appendChild(el('p', { className: 'state__text', text: detail }));
  if (onRetry) {
    const retry = el('button', { className: 'btn', text: 'Try again', attrs: { type: 'button' } });
    retry.addEventListener('click', onRetry);
    box.appendChild(retry);
  }
  return box;
}

export function emptyState(heading, detail) {
  const box = el('div', { className: 'state' });
  box.appendChild(el('h2', { className: 'state__title', text: heading }));
  box.appendChild(el('p', { className: 'state__text', text: detail }));
  return box;
}

export function clear(node) {
  node.replaceChildren();
}
