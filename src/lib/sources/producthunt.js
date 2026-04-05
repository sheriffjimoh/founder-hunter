export async function fetchProductHuntLeads() {
  const query = `{
    posts(order: NEWEST, first: 20) {
      edges {
        node {
          id
          name
          tagline
          website
          url
          votesCount
          makers {
            name
            headline
          }
        }
      }
    }
  }`;

  const res = await fetch("/api/producthunt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`Product Hunt API error: ${res.status}`);
  const data = await res.json();
  const posts = data.data?.posts?.edges || [];

  return posts.map(({ node }) => ({
    id: `ph-${node.id}-${Date.now()}`,
    company: node.name,
    founder: node.makers?.[0]?.name || "Unknown",
    email: "",
    website: node.website || node.url || "",
    source: "PH",
    status: "New",
    pitch: node.tagline || "",
    trigger: "launch",
    triggerNote: `Launched on Product Hunt · ${node.votesCount} upvotes`,
    draft: null,
    profile: null,
    subject: null,
  }));
}
