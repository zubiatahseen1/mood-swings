# Mood Swings

Most movie sites show you what's popular. I wanted one that helps you decide what to watch tonight, based on how you want to feel.

Pick a mood, and Mood Swings suggests 12 movies to match. Not feeling any of them? Hit reroll for 12 more.

**[Try it live](https://zubiatahseen1.github.io/mood-swings/)**

## What it does

- Choose a mood, like "Need a good cry" or "Surprise me"
- Filter by how much time you have
- Reroll for new suggestions instantly
- See each movie's cast, synopsis and trailer
- Each mood has its own colour that carries through the page

## How I built it

I used plain HTML, CSS and JavaScript, with no framework, and pulled movie data from the TMDB API.

A few things I focused on:

- **Shareable links.** Your mood and filters are saved in the URL, so the back button works and you can send someone your results.
- **Variety.** Instead of always showing the same top 20 movies, the app collects a larger pool and shuffles it.
- **Accessibility.** Everything works with a keyboard, and animations turn off for people who prefer reduced motion.
- **Speed.** I compressed the mood images from almost 48 MB down to under 300 KB.

## Run it locally

```bash
git clone https://github.com/zubiatahseen1/mood-swings.git
cd mood-swings
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What I'd add next

Learning from the movies you pick, so suggestions get better over time.

---

Movie data from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.

Built by Zubia Tahseen
