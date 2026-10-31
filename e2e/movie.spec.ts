import { expect, test } from "./fixtures";

test("shows the film, its cast, crew and trailer", async ({ page }) => {
  await page.goto("/movie/550?mood=angry");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Test Movie 550");
  await expect(page.getByText("2h 8m")).toBeVisible();
  await expect(page.getByText("A tagline for testing.")).toBeVisible();
  await expect(page.getByTestId("cast").getByRole("listitem")).toHaveCount(2);
  await expect(page.getByText("Director · Screenplay")).toBeVisible();
  await expect(page.getByRole("link", { name: "Watch trailer" })).toHaveAttribute(
    "href",
    "https://www.youtube.com/watch?v=abc123",
  );
  await expect(page).toHaveTitle("Test Movie 550 — Mood Swings");
});

test("opens from a mood card and links back to the mood", async ({ page }) => {
  await page.goto("/mood/angry");
  await page.getByTestId("movie-card").first().getByRole("link").click();
  await expect(page).toHaveURL(/\/movie\/\d+\?mood=angry/);

  await page.getByRole("link", { name: "← Angry" }).click();
  await expect(page).toHaveURL("/mood/angry");
});

test("asks logged-out visitors to log in to save films", async ({ page }) => {
  await page.goto("/movie/550?mood=happy");
  await expect(page.getByRole("link", { name: "Log in to save films" })).toHaveAttribute(
    "href",
    "/login?next=%2Fmovie%2F550%3Fmood%3Dhappy",
  );
});

test("a film TMDB doesn't have is a 404", async ({ page }) => {
  await page.goto("/movie/999999");
  await expect(page.getByRole("heading", { name: "Nothing here" })).toBeVisible();
});
