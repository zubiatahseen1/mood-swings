import { IMG_URL } from './config.js';
import { movie as fetchMovie, credits as fetchCredits, videos as fetchVideos, ApiError } from './api.js';
import { Movie } from './movie.js';
import { el, errorState, clear } from './render.js';

const id = new URLSearchParams(location.search).get('id');

const page = document.querySelector('[data-page]');
const hero = document.querySelector('[data-hero]');
const poster = document.querySelector('[data-poster]');
const title = document.querySelector('[data-title]');
const meta = document.querySelector('[data-meta]');
const tagline = document.querySelector('[data-tagline]');
const overview = document.querySelector('[data-overview]');
const trailer = document.querySelector('[data-trailer]');
const castRow = document.querySelector('[data-cast]');
const castSection = document.querySelector('[data-cast-section]');
const crewRow = document.querySelector('[data-crew]');
const crewSection = document.querySelector('[data-crew-section]');

function renderMovie(m) {
  document.title = `${m.title} — Mood Swings`;
  title.textContent = m.title;

  // encodeURI keeps quotes and parens out of the url() value, so a hostile
  // backdrop_path can't break out of the CSS declaration.
  const backdrop = m.backdropUrl();
  if (backdrop) hero.style.backgroundImage = `url("${encodeURI(backdrop)}")`;

  const posterUrl = m.posterUrl('w500');
  if (posterUrl) {
    poster.src = posterUrl;
    poster.alt = `Poster for ${m.title}`;
  } else {
    poster.remove();
  }

  // Only render the separators we actually need.
  const bits = [m.year, m.runtimeLabel, m.rating ? `★ ${m.rating}` : null].filter(Boolean);
  clear(meta);
  bits.forEach((bit, i) => {
    if (i) meta.appendChild(el('span', { className: 'dot', text: '·', attrs: { 'aria-hidden': 'true' } }));
    meta.appendChild(el('span', { text: bit }));
  });

  if (m.tagline) tagline.textContent = m.tagline; else tagline.remove();
  overview.textContent = m.overview || 'No synopsis available for this title.';
}

function renderCast(cast) {
  const top = cast.filter((p) => p.profile_path).slice(0, 12);
  if (!top.length) { castSection.remove(); return; }

  const frag = document.createDocumentFragment();
  for (const person of top) {
    const card = el('div', { className: 'person' });
    card.appendChild(el('img', {
      className: 'person__photo',
      attrs: {
        src: `${IMG_URL}/w185${person.profile_path}`,
        alt: person.name,
        loading: 'lazy',
        decoding: 'async',
      },
    }));
    card.appendChild(el('p', { className: 'person__name', text: person.name }));
    if (person.character) card.appendChild(el('p', { className: 'person__role', text: person.character }));
    frag.appendChild(card);
  }
  castRow.appendChild(frag);
}

function renderCrew(crew) {
  const keyJobs = ['Director', 'Screenplay', 'Writer'];
  const key = crew.filter((p) => keyJobs.includes(p.job));

  // One person can hold several key jobs — merge rather than list them twice.
  const merged = new Map();
  for (const person of key) {
    if (merged.has(person.id)) merged.get(person.id).jobs.add(person.job);
    else merged.set(person.id, { name: person.name, jobs: new Set([person.job]) });
  }

  if (!merged.size) { crewSection.remove(); return; }

  const frag = document.createDocumentFragment();
  for (const { name, jobs } of merged.values()) {
    const card = el('div', { className: 'credit' });
    card.appendChild(el('p', { className: 'credit__name', text: name }));
    card.appendChild(el('p', { className: 'credit__job', text: [...jobs].join(' · ') }));
    frag.appendChild(card);
  }
  crewRow.appendChild(frag);
}

function renderTrailer(videos) {
  const clip =
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official) ||
    videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer') ||
    videos.find((v) => v.site === 'YouTube' && v.type === 'Teaser');

  if (!clip) { trailer.remove(); return; }
  trailer.href = `https://www.youtube.com/watch?v=${clip.key}`;
  trailer.hidden = false;
}

async function init() {
  if (!id) {
    clear(page);
    page.appendChild(errorState(new ApiError('notfound', ''), null));
    return;
  }

  try {
    // The core record gates the page; credits and videos are enhancements,
    // so a failure in either should not blank out the film itself.
    const m = Movie.fromJson(await fetchMovie(id));
    renderMovie(m);

    const [credits, videos] = await Promise.allSettled([fetchCredits(id), fetchVideos(id)]);

    if (credits.status === 'fulfilled') {
      renderCast(credits.value.cast ?? []);
      renderCrew(credits.value.crew ?? []);
    } else {
      castSection.remove();
      crewSection.remove();
    }

    if (videos.status === 'fulfilled') renderTrailer(videos.value.results ?? []);
    else trailer.remove();
  } catch (error) {
    clear(page);
    page.appendChild(errorState(error, () => location.reload()));
  }
}

init();
