import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const MOCK_TMDB_PORT = 4010;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /responsive\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: process.env.PW_CHROMIUM_PATH
          ? { executablePath: process.env.PW_CHROMIUM_PATH }
          : undefined,
      },
    },
    {
      name: "mobile",
      testMatch: /responsive\.spec\.ts/,
      use: {
        ...devices["Pixel 7"],
        launchOptions: process.env.PW_CHROMIUM_PATH
          ? { executablePath: process.env.PW_CHROMIUM_PATH }
          : undefined,
      },
    },
  ],
  webServer: [
    {
      command: `node e2e/mock-tmdb.mjs`,
      url: `http://localhost:${MOCK_TMDB_PORT}/health`,
      env: { MOCK_TMDB_PORT: String(MOCK_TMDB_PORT) },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: process.env.CI ? `npm run start -- -p ${PORT}` : `npm run dev -- -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      env: {
        TMDB_API_KEY: "test-key",
        TMDB_BASE_URL: `http://localhost:${MOCK_TMDB_PORT}/3`,
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
