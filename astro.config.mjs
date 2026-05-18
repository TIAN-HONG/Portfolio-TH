import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://tian-hong.github.io",
  base: "/Portfolio-TH/",
  integrations: [tailwind()],
});
