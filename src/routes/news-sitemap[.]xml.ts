import { createFileRoute } from "@tanstack/react-router";
import {
  newsSitemapGetResponse,
  newsSitemapHeadResponse,
} from "@/lib/news-sitemap";

export const Route = createFileRoute("/news-sitemap.xml")({
  server: {
    handlers: {
      HEAD: async () => newsSitemapHeadResponse(),
      GET: async () => newsSitemapGetResponse(),
    },
  },
});
