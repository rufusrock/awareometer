import fs from "node:fs/promises";
import path from "node:path";
import manifest from "../lib/data/photo-source-manifest.json" with { type: "json" };

const requestedSlugs = process.argv.slice(2);
const directEntries = manifest.filter(
  (entry) =>
    entry.strategy === "direct-file" &&
    entry.commons_file_title &&
    (requestedSlugs.length === 0 || requestedSlugs.includes(entry.slug))
);

if (directEntries.length === 0) {
  console.log("No direct Wikimedia file titles configured yet.");
  process.exit(0);
}

const failures = [];

for (const entry of directEntries) {
  try {
    const url = `https://api.wikimedia.org/core/v1/commons/file/${encodeURIComponent(entry.commons_file_title)}`;
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`metadata ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data?.preferred?.url ?? data?.original?.url;

    if (!imageUrl) {
      throw new Error("missing downloadable image url");
    }

    const imageResponse = await fetchWithRetry(imageUrl);

    if (!imageResponse.ok) {
      throw new Error(`download ${imageResponse.status}`);
    }

    const bytes = Buffer.from(await imageResponse.arrayBuffer());
    const target = path.join(process.cwd(), entry.local_target);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
    console.log(`Saved ${entry.slug} -> ${entry.local_target}`);
  } catch (error) {
    failures.push({
      slug: entry.slug,
      title: entry.commons_file_title,
      error: error instanceof Error ? error.message : String(error)
    });
    console.log(`Failed ${entry.slug} -> ${entry.commons_file_title}`);
  }
  await sleep(2500);
}

if (failures.length > 0) {
  console.log("\nFailures:");
  for (const failure of failures) {
    console.log(`- ${failure.slug}: ${failure.title} (${failure.error})`);
  }
}

async function fetchWithRetry(url, attempt = 1) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Awareometer prototype asset fetcher (local development use)"
    }
  });

  if (response.status === 429 && attempt < 4) {
    await sleep(1200 * attempt);
    return fetchWithRetry(url, attempt + 1);
  }

  return response;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
