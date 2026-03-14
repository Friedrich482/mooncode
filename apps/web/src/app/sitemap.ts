import { MetadataRoute } from "next";

export const dynamic = "force-static";

const sitemap = (): MetadataRoute.Sitemap => {
  return [
    {
      url: "https://mooncode.cc",
      lastModified: new Date(),
      priority: 1,
    },
  ];
};

export default sitemap;
