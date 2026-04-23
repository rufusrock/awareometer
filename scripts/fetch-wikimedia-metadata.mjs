import fs from "node:fs/promises";
import path from "node:path";
import manifest from "../lib/data/photo-source-manifest.json" with { type: "json" };

const directEntries = manifest.filter((entry) => entry.strategy === "direct-file" && entry.commons_file_title);
const results = [];

for (const entry of directEntries) {
  const apiUrl = new URL("https://commons.wikimedia.org/w/api.php");
  apiUrl.searchParams.set("action", "query");
  apiUrl.searchParams.set("prop", "imageinfo");
  apiUrl.searchParams.set("titles", entry.commons_file_title);
  apiUrl.searchParams.set("iiprop", "url|extmetadata");
  apiUrl.searchParams.set("format", "json");
  apiUrl.searchParams.set("origin", "*");

  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Awareometer asset metadata fetcher (local development use)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed metadata fetch for ${entry.commons_file_title}: ${response.status}`);
  }

  const data = await response.json();
  const pages = data?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const imageInfo = page?.imageinfo?.[0];
  const meta = imageInfo?.extmetadata ?? {};

  results.push({
    slug: entry.slug,
    localImagePath: `/${entry.local_target.replace(/^public\//, "").replace(/\\/g, "/")}`,
    sourcePageUrl: `https://commons.wikimedia.org/wiki/${entry.commons_file_title.replace(/ /g, "_")}`,
    directFileUrl: imageInfo?.url ?? null,
    license: meta?.LicenseShortName?.value ?? "Unknown",
    attribution: meta?.Artist?.value ?? meta?.Credit?.value ?? "See source page",
    usageTerms: meta?.UsageTerms?.value ?? null
  });
}

const outPath = path.join(process.cwd(), "lib", "data", "downloaded-photo-metadata.json");
await fs.writeFile(outPath, JSON.stringify(results, null, 2));
console.log(`Wrote ${results.length} metadata entries to lib/data/downloaded-photo-metadata.json`);
