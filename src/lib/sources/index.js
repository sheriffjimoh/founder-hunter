import { fetchProductHuntLeads } from "./producthunt";
import { fetchYCLeads } from "./ycombinator";

export const SOURCES = {
  PH: {
    id: "PH",
    label: "Product Hunt",
    fetch: fetchProductHuntLeads,
    needsKey: "REACT_APP_PH_TOKEN",
    available: !!process.env.REACT_APP_PH_TOKEN,
  },
  YC: {
    id: "YC",
    label: "Y Combinator",
    fetch: fetchYCLeads,
    needsKey: null,
    available: true,
  },
  Wellfound: {
    id: "Wellfound",
    label: "Wellfound",
    fetch: null,
    needsKey: null,
    available: false,
  },
};

export async function scanAllSources(existingLeads) {
  const existingNames = new Set(existingLeads.map((l) => l.company.toLowerCase()));
  const results = { leads: [], errors: [], scanned: [] };

  for (const source of Object.values(SOURCES)) {
    if (!source.available || !source.fetch) continue;

    try {
      const fetched = await source.fetch();
      const newLeads = fetched.filter(
        (l) => !existingNames.has(l.company.toLowerCase())
      );
      results.leads.push(...newLeads);
      results.scanned.push(source.label);
      newLeads.forEach((l) => existingNames.add(l.company.toLowerCase()));
    } catch (err) {
      results.errors.push(`${source.label}: ${err.message}`);
    }
  }

  return results;
}
