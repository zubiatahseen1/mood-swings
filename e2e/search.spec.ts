import { expect, test } from "./fixtures";

test("searches from the header and loads more results", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Search films" }).fill("inception");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page).toHaveURL("/search?q=inception");
  await expect(page.getByRole("heading", { name: "“inception”" })).toBeVisible();
  await expect(page.getByTestId("movie-card")).toHaveCount(20);

  await page.getByRole("button", { name: "Load more" }).click();
  await expect(page.getByTestId("movie-card")).toHaveCount(40);
  await expect(page.getByRole("button", { name: "Load more" })).toBeHidden();
});
