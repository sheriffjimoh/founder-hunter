import { PROFILES } from "./profiles";

export function buildPrompt(lead, profile) {
  const p = PROFILES[profile];
  const triggerMap = {
    launch: `Congrats on the Product Hunt launch today! Saw ${lead.company} — ${lead.triggerNote}.`,
    funding: `Saw the recent raise — ${lead.triggerNote}.`,
    modernization: `I specialize in turning legacy code into 'Clean Core' systems — ${lead.triggerNote}.`,
    hiring: `Spotted the Founding Engineer role on Wellfound — ${lead.triggerNote}.`,
  };
  const hook = triggerMap[lead.trigger] || lead.triggerNote;

  return {
    system: `You are a world-class Sales Engineer ghostwriting for a busy engineer named ${p.name}. Write a 110–130 word peer-to-peer cold email. Rules: No "I hope you're well." No bullet points. No em-dashes. No corporate speak. No "I wanted to reach out." Sound like a senior engineer who just happened to notice their product between deploys — slightly witty, direct, human. Focus on one specific technical bottleneck (scaling, security, or AI integration). End with one soft CTA. Sign off as just "${p.name}".`,
    user: `Target: ${lead.founder} at ${lead.company}
Company pitch: ${lead.pitch}
High-signal hook: ${hook}
Sender profile: ${p.bio}
Sender focus: ${p.focus}
Sender credibility: ${p.credibility}
CTA to use: ${p.cta}

Write the cold email now. No subject line, just the body.`,
  };
}
