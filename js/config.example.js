/**
 * Single source of truth for API access and mood definitions.
 *
 * NOTE ON THE API KEY
 * -------------------
 * A browser-only app cannot hide a key — anything shipped to the client is
 * readable in DevTools. There are two honest options:
 *
 *   1. (used here) Treat the key as public. TMDB read keys are low-risk,
 *      rate-limited, and revocable — but never commit one. This file ships
 *      with a placeholder and is listed in .gitignore.
 *   2. Put a serverless function in front of TMDB that holds the key and
 *      forwards requests. See README for the Netlify function sketch.
 *
 * Replace the placeholder below with your own key to run the app locally.
 */

export const API_KEY = 'YOUR_TMDB_API_KEY'; // <- your key here, then rename to config.js
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_URL = 'https://image.tmdb.org/t/p';

/**
 * SEPARATORS ARE NOT INTERCHANGEABLE — this is a real TMDB gotcha.
 *   include: pipe (|) = OR. "family OR music OR documentary".
 *            A comma here would mean AND, i.e. a film that is all three
 *            at once — which returns almost nothing.
 *   exclude: comma (,) = exclude a film carrying ANY of these genres,
 *            which is what we want, so commas are correct here.
 *
 * Each mood maps to TMDB genre IDs and owns an accent colour.
 * The accent propagates to the results page, so the site visibly
 * takes on the mood you picked — that's the whole product idea.
 *
 * `exclude` matters as much as `include`: "angry" wants crime and war,
 * but a family comedy in those results would break the promise.
 */
export const MOODS = {
  happy: {
    label: 'Happy',
    caption: 'Good vibes only',
    accent: '#F2B441',
    include: '35|16|12',      // comedy, animation, adventure
    exclude: '27,10752,53',   // horror, war, thriller
  },
  sad: {
    label: 'Sad',
    caption: 'Need a good cry',
    accent: '#5C8AD1',
    include: '18|10749',      // drama, romance
    exclude: '35,28',         // comedy, action
  },
  angry: {
    label: 'Angry',
    caption: 'Something with teeth',
    accent: '#E05A45',
    include: '28|80|10752',   // action, crime, war
    exclude: '10751,10749',   // family, romance
  },
  chill: {
    label: 'Chill',
    caption: 'Low stakes, warm blanket',
    accent: '#4FB09B',
    include: '10751|10402|99', // family, music, documentary
    exclude: '28,27,53,878',   // action, horror, thriller, sci-fi
  },
  surprise: {
    label: 'Surprise me',
    caption: 'Anything but predictable',
    accent: '#9B7BD4',
    include: '9648|878|14',   // mystery, sci-fi, fantasy
    exclude: '',
  },
  romantic: {
    label: 'Romantic',
    caption: 'Hopeless or otherwise',
    accent: '#E37098',
    include: '10749',         // romance
    exclude: '27,80',         // horror, crime
  },
  scared: {
    label: 'Scared',
    caption: 'Thrill seeking',
    accent: '#A3C93A',
    include: '27|53',         // horror, thriller
    exclude: '10751,35',      // family, comedy
  },
};

/**
 * Runtime bands. People decide by mood *and* by how much evening they have
 * left, so this is the one filter that earns its place.
 */
export const RUNTIMES = {
  any:    { label: 'Any length', params: {} },
  short:  { label: 'Under 90 min', params: { 'with_runtime.lte': 89 } },
  medium: { label: '90–120 min', params: { 'with_runtime.gte': 90, 'with_runtime.lte': 120 } },
  long:   { label: 'Over 2 hours', params: { 'with_runtime.gte': 121 } },
};

export const PAGE_SIZE = 12;
