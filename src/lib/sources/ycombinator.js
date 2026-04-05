const YC_BATCHES = ["w25", "s24", "w24"];

export async function fetchYCLeads(batch) {
  const batches = batch ? [batch] : YC_BATCHES;
  const results = [];

  for (const b of batches) {
    try {
      const res = await fetch(`https://yc-oss.github.io/api/batches/${b}.json`);
      if (!res.ok) continue;
      const companies = await res.json();

      const leads = companies.slice(0, 15).map((c) => ({
        id: `yc-${c.slug || c.id}-${Date.now()}`,
        company: c.name || "Unknown",
        founder: "",
        email: "",
        website: c.url || c.website || "",
        source: "YC",
        status: "New",
        pitch: c.one_liner || c.long_description || "",
        trigger: "launch",
        triggerNote: `YC ${b.toUpperCase()} batch`,
        draft: null,
        profile: null,
        subject: null,
      }));

      results.push(...leads);
    } catch {
      // Skip failed batches silently
    }
  }

  return results;
}
