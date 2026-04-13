/**
 * Hunter.io Domain Search — finds CEO/CTO/Cofounder emails from a domain.
 * Free plan: 25 searches/month.
 * Docs: https://hunter.io/api-documentation/v2#domain-search
 */
export async function findEmails(domain) {
  if (!domain) return null;

  // Strip protocol and path, keep just domain
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();

  // Try with executive filters first, fall back to unfiltered
  const urls = [
    `/api/hunter/v2/domain-search?domain=${encodeURIComponent(cleanDomain)}&type=personal&seniority=executive,senior&limit=5`,
    `/api/hunter/v2/domain-search?domain=${encodeURIComponent(cleanDomain)}&limit=5`,
  ];

  for (const url of urls) {
    const res = await fetch(url);

    if (!res.ok) {
      console.warn(`[hunter] Domain search failed for ${cleanDomain}: ${res.status}`);
      return null;
    }

    const data = await res.json();
    const emails = data.data?.emails || [];

    if (emails.length === 0) {
      console.log(`[hunter] No results with current filters for ${cleanDomain}, trying broader...`);
      continue;
    }

    // Prioritize: executive > senior, prefer positions like CEO/CTO/Founder
    const founderKeywords = /founder|ceo|cto|chief|co-founder|cofounder|owner/i;
    const sorted = [...emails].sort((a, b) => {
      const aFounder = founderKeywords.test(a.position || "") ? 1 : 0;
      const bFounder = founderKeywords.test(b.position || "") ? 1 : 0;
      if (bFounder !== aFounder) return bFounder - aFounder;
      return (b.confidence || 0) - (a.confidence || 0);
    });

    const best = sorted[0];
    return {
      email: best.value,
      firstName: best.first_name || "",
      lastName: best.last_name || "",
      position: best.position || "",
      confidence: best.confidence || 0,
      domain: cleanDomain,
    };
  }

  return null;
}

/**
 * Enrich a single lead with email from Hunter.io
 */
export async function enrichLead(lead) {
  if (!lead.website) return lead;

  try {
    const result = await findEmails(lead.website);
    if (!result) return lead;

    return {
      ...lead,
      email: result.email,
      founder: result.firstName
        ? `${result.firstName} ${result.lastName}`.trim()
        : lead.founder,
      founderPosition: result.position,
      emailConfidence: result.confidence,
    };
  } catch (err) {
    console.warn(`[hunter] Enrichment failed for ${lead.website}:`, err.message);
    return lead;
  }
}

/**
 * Enrich multiple leads — only those missing emails
 */
export async function enrichLeads(leads) {
  const results = [];
  let enriched = 0;

  for (const lead of leads) {
    if (lead.email) {
      results.push(lead);
      continue;
    }
    const updated = await enrichLead(lead);
    if (updated.email) enriched++;
    results.push(updated);
  }

  return { leads: results, enriched };
}
