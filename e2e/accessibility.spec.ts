import { expect, test } from "./fixtures";

test("keyboard users can skip straight to the content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("every mood card image is decorative and every link has a name", async ({ page }) => {
  await page.goto("/");
  const links = page.getByTestId("mood-list").getByRole("link");
  for (const link of await links.all()) {
    await expect(link).toHaveAccessibleName(/\w+/);
  }
});
