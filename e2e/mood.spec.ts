import { expect, test } from "./fixtures";

const titles = (page: import("@playwright/test").Page) =>
  page.getByTestId("movie-card").getByRole("heading").allTextContents();

test("filters by runtime and keeps it in the URL", async ({ page }) => {
  await page.goto("/mood/happy");
  const filters = page.getByTestId("runtime-filters");
  await filters.getByRole("link", { name: "Under 90 min" }).click();

  await expect(page).toHaveURL(/runtime=short/);
  await expect(filters.getByRole("link", { name: "Under 90 min" })).toHaveAttribute("aria-current", "true");
  await expect(page.getByTestId("movie-card")).toHaveCount(12);
});

test("rerolls to 12 new films, and back restores the first 12", async ({ page }) => {
  await page.goto("/mood/sad");
  await expect(page.getByTestId("movie-card")).toHaveCount(12);
  const first = await titles(page);

  await page.getByRole("button", { name: "Show me 12 more" }).click();
  await expect(page).toHaveURL(/round=1/);
  await expect.poll(async () => (await titles(page)).some((t) => first.includes(t))).toBe(false);

  await page.goBack();
  await expect(page).not.toHaveURL(/round=/);
  await expect.poll(() => titles(page)).toEqual(first);
});

test("rerolling past the first batch loads more films", async ({ page }) => {
  // Round 5 needs films 61–72, beyond the first batch of 60.
  await page.goto("/mood/angry?round=5");
  await expect(page.getByTestId("movie-card")).toHaveCount(12);
});

test("says when every film has been seen", async ({ page }) => {
  // The mock gives Chill only one page (20 films), so round 2 is past the end.
  await page.goto("/mood/chill?round=2");
  await expect(page.getByRole("heading", { name: "That is everything" })).toBeVisible();
});

test("ignores nonsense in the URL", async ({ page }) => {
  await page.goto("/mood/happy?runtime=forever&round=-4");
  await expect(page.getByTestId("runtime-filters").getByRole("link", { name: "Any length" })).toHaveAttribute(
    "aria-current",
    "true",
  );
  await expect(page.getByTestId("movie-card")).toHaveCount(12);
});

test("an unknown mood is a 404", async ({ page }) => {
  await page.goto("/mood/grumpy");
  await expect(page.getByRole("heading", { name: "Nothing here" })).toBeVisible();
});
