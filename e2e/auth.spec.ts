import { expect, test } from "./fixtures";

test("the watchlist sends logged-out visitors to log in", async ({ page }) => {
  await page.goto("/watchlist");
  await expect(page).toHaveURL("/login?next=/watchlist");
});

test("the login form validates before sending anything", async ({ page }) => {
  await page.goto("/login");
  const form = page.getByRole("form", { name: "Log in" });
  await form.getByLabel("Email").fill("not-an-email");
  await form.getByRole("button", { name: "Log in" }).click();

  await expect(form.getByText("Enter a valid email address.")).toBeVisible();
  await expect(form.getByText("Enter your password.")).toBeVisible();
  await expect(form.getByLabel("Email")).toHaveAttribute("aria-invalid", "true");
});

test("sign-up requires an 8-character password", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("tab", { name: "Sign up" }).click();
  const form = page.getByRole("form", { name: "Sign up" });
  await form.getByLabel("Email").fill("new@example.com");
  await form.getByLabel("Password").fill("short");
  await form.getByRole("button", { name: "Sign up" }).click();

  await expect(form.getByText("Use at least 8 characters.")).toBeVisible();
});
