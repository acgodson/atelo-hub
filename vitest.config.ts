import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["labs/**/*.{test,spec}.ts", "scripts/**/*.{test,spec}.ts"],
    exclude: ["**/node_modules/**", "apps/**", "**/dist/**"]
  }
});
