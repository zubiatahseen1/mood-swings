import { test as base, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const poster = readFileSync(join(__dirname, "poster.png"));

/** Every test gets TMDB images served locally, so no request leaves the machine. */
export const test = base.extend({
  page: async ({ page }, provide) => {
    await page.route("https://image.tmdb.org/**", (route) =>
      route.fulfill({ body: poster, contentType: "image/png" }),
    );
    await provide(page);
  },
});

export { expect };
