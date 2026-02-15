// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@pinia/nuxt", "@nuxt/image"],
  plugins: [
    { src: "~/plugins/device/deviceInfo.ts", mode: "client" },
    { src: "~/plugins/device/deviceDimensions.ts", mode: "client" },
    { src: "~/plugins/device/deviceMotionPreference.ts", mode: "client" },
    { src: "~/plugins/device/deviceThemePreference.ts", mode: "client" },
    { src: "~/plugins/device/deviceScroll.ts", mode: "client" },
    { src: "~/plugins/device/deviceResize.ts", mode: "client" },
    { src: "~/plugins/tweakpane.ts", mode: "client" },
  ],
  pinia: {
    storesDirs: ["./stores/app", "./stores/device"],
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#1e1814" },
        {
          property: "og:title",
          content: "RSVP • Speed reading tool",
        },
        {
          property: "og:description",
          content:
            "Paste text or upload a file and read in a steady, word-by-word stream. Built by Design Business Company.",
        },
        {
          property: "og:image",
          content: "/images/og.png",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/assets/styles/_global.scss" as *;
          `,
        },
      },
    },
  },
  components: [
    // Default components directory (includes P5.vue, etc.)
    { path: `~/components`, pathPrefix: false },
    // Auto-import components without path prefixes for cleaner imports
    { path: `~/components/1-atom`, pathPrefix: false },
    { path: `~/components/2-molecule`, pathPrefix: false },
    { path: `~/components/3-organism`, pathPrefix: false },
    { path: `~/components/4-template`, pathPrefix: false },
  ],
  compatibilityDate: "2025-10-18",
});
