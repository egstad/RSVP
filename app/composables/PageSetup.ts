// ~/composables/PageSetup.ts
import { onMounted, onUnmounted } from "vue";
import pageSEO from "~/assets/scripts/pages/seo";
import type { SEOData } from "~/types/SEOData";

interface PageSetupOptions {
  seoMeta?: SEOData;
}

export default function PageSetup(options?: PageSetupOptions) {
  const nuxt = useNuxtApp();

  // Set page meta during setup so tags render server-side for crawlers
  if (options?.seoMeta) {
    useSeoMeta(pageSEO(options.seoMeta));
  }

  onMounted(() => {
    // Update dimension on refresh
    (nuxt.$dimensions as any).set();
  });

  onUnmounted(() => {
    // Your onUnmounted logic
  });
}
