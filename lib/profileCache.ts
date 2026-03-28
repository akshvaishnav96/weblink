import { cache } from "react";
import { fetchBusinessProfileBySlug } from "./api";

/**
 * React.cache() deduplicates calls within a single server render pass.
 * generateMetadata + the page component both call this — without cache()
 * that's two API round-trips. With cache() it's one.
 */
export const getCachedProfile = cache(fetchBusinessProfileBySlug);
