import { expect, test } from "./fixtures";

test("home shows all seven moods and opens one", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("in the mood");
  await expect(page.getByTestId("mood-list").getByRole("listitem")).toHaveCount(7);

  await page.getByRole("link", { name: /Happy/ }).click();
  await expect(page).toHaveURL("/mood/happy");
  await expect(page.getByRole("heading", { name: "Happy" })).toBeVisible();
  await expect(page.getByTestId("movie-card")).toHaveCount(12);
});
