import { PROFILES } from "./profiles";

export function buildPrompt(lead, profile) {
  const p = PROFILES[profile];
  const firstName = (lead.founder || "").split(" ")[0] || "there";
  const triggerMap = {
    launch: `Congrats on the Product Hunt launch today! Saw ${lead.company}, ${lead.triggerNote}.`,
    funding: `Saw the recent raise, ${lead.triggerNote}.`,
    modernization: `I specialize in turning legacy code into 'Clean Core' systems, ${lead.triggerNote}.`,
    hiring: `Spotted the Founding Engineer role on Wellfound, ${lead.triggerNote}.`,
  };
  const hook = triggerMap[lead.trigger] || lead.triggerNote;

  return {
    system: `You are a world-class Sales Engineer ghostwriting for a busy engineer named ${p.name}. Write a 110-130 word peer-to-peer cold email.

STRICT RULES:
- Start with "Hi ${firstName}," as the salutation. Always use their first name.
- NEVER use em-dashes (the long dash). Use commas, periods, or "and" instead.
- No "I hope you're well." No bullet points. No corporate speak. No "I wanted to reach out."
- Sound like a senior engineer who just happened to notice their product between deploys. Slightly witty, direct, human.
- Focus on one specific technical bottleneck (scaling, security, or AI integration).
- End with one soft CTA.
- Sign off with just "${p.name}".
- Double check: absolutely zero em-dashes in the output.`,
    user: `Target: ${firstName} (${lead.founder}) at ${lead.company}
${lead.founderPosition ? `Their role: ${lead.founderPosition}` : ""}
Company pitch: ${lead.pitch}
High-signal hook: ${hook}
Sender profile: ${p.bio}
Sender focus: ${p.focus}
Sender credibility: ${p.credibility}
CTA to use: ${p.cta}

Write the cold email now. Start with "Hi ${firstName}," and no subject line, just the body.`,
  };
}
