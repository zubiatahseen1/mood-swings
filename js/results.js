import { MOODS, RUNTIMES, PAGE_SIZE } from './config.js';
import { discover, search } from './api.js';
import { Movie } from './movie.js';
import { movieCard, skeletonGrid, errorState, emptyState, clear, el } from './render.js';

/**
 * All page state lives in the URL: ?mood=happy&runtime=short or ?q=inception
 * That makes every result set shareable, bookmarkable, and correct when
 * someone hits the back button — none of which is true of localStorage.
 */
const params = new URLSearchParams(location.search);
const moodKey = params.get('mood');
const query = params.get('q');
const runtimeKey = RUNTIMES[params.get('runtime')] ? params.get('runtime') : 'any';

const mood = MOODS[moodKey];

const grid = document.querySelector('[data-grid]');
const heading = document.querySelector('[data-heading]');
const caption = document.querySelector('[data-caption]');
const filters = document.querySelector('[data-filters]');
const rerollBtn = document.querySelector('[data-reroll]');

/**
 * A pool of candidates, drawn from several TMDB pages and shuffled once.
 * Rerolling deals the next 12 from the pool rather than refetching, so the
 * button feels instant; we only go back to the network when the pool runs low.
 * Without this, "Happy" returns the same popular comedies every single time
 * and the recommendation is really just a filter.
 */
let pool = [];
let seenIds = new Set();
let nextPage = 1;
let exhausted = false;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fetchBatch(pageCount = 3) {
  const requests = [];
  for (let i = 0; i < pageCount && nextPage <= 20; i++, nextPage++) {
    requests.push(
      query
        ? search(query, nextPage)
        : discover({
            sort_by: 'popularity.desc',
            include_adult: false,
            'vote_count.gte': 50,          // filters out obscure entries with one vote
            with_genres: mood.include,
            without_genres: mood.exclude,
            page: nextPage,
            ...RUNTIMES[runtimeKey].params,
          })
    );
  }

  if (!requests.length) { exhausted = true; return; }

  const pages = await Promise.all(requests);
  const fresh = [];

  for (const page of pages) {
    if (nextPage > (page.total_pages ?? 1)) exhausted = true;
    for (const json of page.results ?? []) {
      if (!json.poster_path || seenIds.has(json.id)) continue;
      seenIds.add(json.id);
      fresh.push(Movie.fromJson(json));
    }
  }

  if (!fresh.length) exhausted = true;
  pool = pool.concat(shuffle(fresh));
}

function renderCards(movies) {
  clear(grid);
  const frag = document.createDocumentFragment();
  movies.forEach((m) => frag.appendChild(movieCard(m)));
  grid.appendChild(frag);
}

async function deal({ initial = false } = {}) {
  rerollBtn.disabled = true;
  grid.setAttribute('aria-busy', 'true');

  if (initial) {
    clear(grid);
    grid.appendChild(skeletonGrid(PAGE_SIZE));
  }

  try {
    if (pool.length < PAGE_SIZE && !exhausted) await fetchBatch();

    const batch = pool.splice(0, PAGE_SIZE);

    if (!batch.length) {
      clear(grid);
      grid.appendChild(
        query
          ? emptyState('Nothing matched', `No films came back for “${query}”. Try a different spelling.`)
          : emptyState('That is everything', 'You have seen every film we have for this mood and length. Try another runtime.')
      );
      rerollBtn.hidden = true;
      return;
    }

    renderCards(batch);
    rerollBtn.hidden = pool.length === 0 && exhausted;
    grid.focus({ preventScroll: true });
  } catch (error) {
    clear(grid);
    grid.appendChild(errorState(error, () => deal({ initial: true })));
    rerollBtn.hidden = true;
  } finally {
    rerollBtn.disabled = false;
    grid.setAttribute('aria-busy', 'false');
  }
}

/** Runtime chips are links, not buttons — each one is a real, shareable URL. */
function buildFilters() {
  if (query) { filters.hidden = true; return; }

  for (const [key, { label }] of Object.entries(RUNTIMES)) {
    const url = new URLSearchParams({ mood: moodKey });
    if (key !== 'any') url.set('runtime', key);

    const chip = el('a', {
      className: 'chip',
      text: label,
      attrs: { href: `results.html?${url}` },
    });
    if (key === runtimeKey) {
      chip.classList.add('chip--on');
      chip.setAttribute('aria-current', 'true');
    }
    filters.appendChild(chip);
  }
}

function init() {
  if (!mood && !query) {
    clear(grid);
    grid.appendChild(emptyState('Pick a mood first', 'Head back to the home page and choose how you are feeling.'));
    filters.hidden = true;
    rerollBtn.hidden = true;
    return;
  }

  if (mood) {
    document.documentElement.style.setProperty('--accent', mood.accent);
    heading.textContent = mood.label;
    caption.textContent = mood.caption;
    document.title = `${mood.label} — Mood Swings`;
  } else {
    heading.textContent = query;
    caption.textContent = 'Search results';
    document.title = `${query} — Mood Swings`;
  }

  buildFilters();
  rerollBtn.addEventListener('click', () => deal());
  deal({ initial: true });
}

init();
