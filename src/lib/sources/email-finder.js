/**
 * Unified Email Finder — provider chain with automatic fallback.
 *
 * Strategy: Try providers in order. If the first returns null or throws,
 * fall through to the next. Return the first successful result.
 *
 * Provider contract:
 *   enrichLead(lead) → Promise<lead>   (lead.email populated on success)
 *
 * Chain order: Hunter.io → Apollo.io
 */
import { enrichLead as hunterEnrich } from "./hunter";
import { enrichLead as apolloEnrich } from "./apollo";

const PROVIDERS = [
  {
    id: "hunter",
    label: "Hunter.io",
    enrich: hunterEnrich,
    available: !!process.env.REACT_APP_HUNTER_KEY,
  },
  {
    id: "apollo",
    label: "Apollo.io",
    enrich: apolloEnrich,
    available: !!process.env.REACT_APP_APOLLO_KEY,
  },
];

/**
 * Run the enrichment chain for a single lead.
 * Returns { lead, provider } where provider is the id of whichever succeeded,
 * or null if none did.
 */
export async function findEmail(lead) {
  if (!lead.website) {
    return { lead, provider: null };
  }

  const activeProviders = PROVIDERS.filter(p => p.available);

  for (const provider of activeProviders) {
    try {
      const enriched = await provider.enrich(lead);

      if (enriched.email && enriched.email !== lead.email) {
        console.log(`[email-finder] ${provider.label} found ${enriched.email} for ${lead.company}`);
        return { lead: enriched, provider: provider.id };
      }

      console.log(`[email-finder] ${provider.label} returned no result for ${lead.company}, trying next…`);
    } catch (err) {
      console.warn(`[email-finder] ${provider.label} failed for ${lead.company}: ${err.message}, trying next…`);
    }
  }

  return { lead, provider: null };
}

/**
 * Return a human-readable summary of which providers are configured.
 */
export function getProviderStatus() {
  return PROVIDERS.map(p => ({
    id: p.id,
    label: p.label,
    available: p.available,
  }));
}
