import { PROFILES } from "./profiles";

export function buildPrompt(lead, profile) {
  const p = PROFILES[profile];
  const firstName = (lead.founder || "").split(" ")[0] || "there";
  
  const triggerMap = {
    launch: `Was looking at ${lead.company}—managing ${lead.triggerNote} is usually a nightmare for state management.`,
    funding: `Saw the ${lead.company} raise. Scaling that ${lead.triggerNote} infrastructure is a high-stakes challenge.`,
    modernization: `Been following how you're handling ${lead.company}. Tackling ${lead.triggerNote} without breaking core logic is impressive.`,
    hiring: `Saw you're looking for a Founding Engineer. Building ${lead.triggerNote} from 0 to 1 is exactly where I thrive.`,
  };
  
  const hook = triggerMap[lead.trigger] || lead.triggerNote;

  if (profile === "agency") {
    return buildAgencyPrompt(p, lead, firstName, hook);
  }
  return buildEngineerPrompt(p, lead, firstName, hook);
}

function buildEngineerPrompt(p, lead, firstName, hook) {
  return {
    system: `You are Jimoh, a Senior Full Stack Engineer (7+ years). You are writing a direct, peer-level note to a founder to join their team.

STRICT RULES:
- Start with "Hi ${firstName}," (NO "Hi there").
- NO generic AI words: "tackling," "caught my attention," "head-on," "complexities," "valuable," or "mission."
- NO "I want to help scale." This sounds like a junior. 
- USE THIS STRUCTURE: 
  1. Technical Hook (Directly mention a nightmare bottleneck like state management or data drift).
  2. The Proof: "I'm a Senior Engineer with 7 years of experience. I built the infrastructure for Dinesurf.com and the AI logic for Masterbots.ai from the ground up."
  3. The Ask: "I'm looking for my next long-term build where I can take full ownership of the backend."
- Tone: Professional, blunt, and extremely high-competence. No fluff.
- Sign off: "Jimoh"`,

    user: `Target: ${firstName} at ${lead.company}. 
Pitch: ${lead.pitch}
Context: ${hook}
Creds: 7+ years. Built Masterbots.ai and Dinesurf.com from scratch. Work remote, zero oversight.
Task: Write the email now. Lead with a blunt technical challenge about ${lead.pitch}. Mention you built Dinesurf and Masterbots. Ask what the biggest hurdle on their roadmap is. Keep it under 100 words.`
  };
}

function buildAgencyPrompt(p, lead, firstName, hook) {
  return {
    system: `You are a Solo Founder/Fractional CTO named ${p.name}. You run YourMVPGuy. You are writing to a fellow founder.

STRICT RULES:
- Start with "Hi ${firstName},"
- Use "I" (Personal Gmail tone), never "We."
- NO "Congrats" or "Mission-speak."
- NO em-dashes.
- Persona: You build MVPs in 21 days. You help founders ship before they burn their runway.
- Focus: Speed-to-market and architectural trade-offs. 
- Goal: Offer a 15-minute technical brainstorm on shipping their next feature faster.
- Length: 90-110 words.
- Sign off: "${p.name}"`,

    user: `Target: ${firstName} at ${lead.company}.
Pitch: ${lead.pitch}
Context: ${hook}
Creds: Built Masterbots.ai and Dinesurf.com. Expert in 21-day MVP cycles.
Instruction: Focus on the urgency of their stage. Suggest a specific area where they can cut scope to ship faster.`
  };
}