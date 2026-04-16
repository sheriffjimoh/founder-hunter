/**
 * Apollo.io Contacts Search — finds executive emails from a domain.
 * Uses the Contacts Search endpoint which is available on the free plan.
 * API: POST https://api.apollo.io/v1/contacts/search
 */

/**
 * @param {string} domain  — e.g. "acme.com"
 * @param {string} [name]  — optional founder full name for higher match accuracy
 * @returns {Promise<{email:string, firstName:string, lastName:string, position:string, confidence:number, domain:string}|null>}
 */
export async function findEmails(domain, name) {
  if (!domain) return null;

  const cleanDomain = domain
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .toLowerCase();

  const body = {
    q_organization_domains: cleanDomain,
    page: 1,
    per_page: 5,
    person_seniorities: ["founder", "c_suite", "owner"],
  };
  if (name) body.q_keywords = name;

  const res = await fetch("/api/apollo/v1/contacts/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn(`[apollo] Contacts search failed for ${cleanDomain}: ${res.status}`, text);
    return null;
  }

  const data = await res.json();
  const contacts = data.contacts || [];

  // Find the first contact with an email
  const match = contacts.find(c => c.email);
  if (!match) return null;

  const confidence = match.email_status === "verified" ? 95
    : match.email_status === "guessed" ? 60
    : 40;

  return {
    email: match.email,
    firstName: match.first_name || "",
    lastName: match.last_name || "",
    position: match.title || "",
    confidence,
    domain: cleanDomain,
  };
}

/**
 * Enrich a single lead with email from Apollo.io
 */
export async function enrichLead(lead) {
  if (!lead.website) return lead;

  try {
    const result = await findEmails(lead.website, lead.founder);
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
    console.warn(`[apollo] Enrichment failed for ${lead.website}:`, err.message);
    return lead;
  }
}
