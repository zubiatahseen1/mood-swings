import { expect, test } from "./fixtures";

test("mood results fit a phone screen", async ({ page }) => {
  await page.goto("/mood/romantic");
  await expect(page.getByTestId("movie-card")).toHaveCount(12);
  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflows).toBe(false);
});
