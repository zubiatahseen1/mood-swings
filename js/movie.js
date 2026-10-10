import { IMG_URL } from './config.js';

/**
 * Translates TMDB's response shape into the app's own shape, once,
 * at the boundary. Nothing downstream touches `poster_path` or
 * `vote_average` — so if TMDB changes, only this file does.
 */
export class Movie {
  constructor({ id, title, overview, releaseDate, posterPath, backdropPath, voteAverage, runtime, tagline }) {
    this.id = id;
    this.title = title;
    this.overview = overview;
    this.releaseDate = releaseDate;
    this.posterPath = posterPath;
    this.backdropPath = backdropPath;
    this.voteAverage = voteAverage;
    this.runtime = runtime;
    this.tagline = tagline;
  }

  static fromJson(json) {
    return new Movie({
      id: json.id,
      title: json.title,
      overview: json.overview,
      releaseDate: json.release_date,
      posterPath: json.poster_path,
      backdropPath: json.backdrop_path,
      voteAverage: json.vote_average,
      runtime: json.runtime,
      tagline: json.tagline,
    });
  }

  posterUrl(size = 'w342') {
    return this.posterPath ? `${IMG_URL}/${size}${this.posterPath}` : null;
  }

  backdropUrl(size = 'w1280') {
    return this.backdropPath ? `${IMG_URL}/${size}${this.backdropPath}` : null;
  }

  get year() {
    return this.releaseDate ? this.releaseDate.slice(0, 4) : null;
  }

  get rating() {
    return this.voteAverage ? this.voteAverage.toFixed(1) : null;
  }

  get runtimeLabel() {
    if (!this.runtime) return null;
    const h = Math.floor(this.runtime / 60);
    const m = this.runtime % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  }
}
