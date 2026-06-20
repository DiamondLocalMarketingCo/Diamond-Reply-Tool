const {
  setCors,
  handleOptions,
  readJsonBody,
  loadTraining,
  normalizeGoal,
  normalizeTone
} = require("./_lib");

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (handleOptions(req, res)) return;

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server." });
    }

    const body = await readJsonBody(req);
    const { context, goal, tone, offer } = body || {};

    if (!context || typeof context !== "string") {
      return res.status(400).json({ error: "Missing conversation context." });
    }

    const training = loadTraining();
    const goalText = normalizeGoal(goal);
    const toneText = normalizeTone(tone);

    const system = `
You write short, natural Facebook Messenger outreach replies for Diamond Local Marketing.

You are writing as Mostafa, a local marketing agency owner messaging local service businesses.

Use the user's training style and examples. The examples are preferred behavior. Do not copy an example unless it fits the current conversation.

Core rules:
- Do not sound robotic.
- Do not sound like a corporate sales rep.
- Do not over-explain.
- Do not use em dashes.
- Keep each reply short.
- Ask at most one question per reply.
- Do not make the business owner feel insulted.
- If they joke, lightly play along first.
- If they say "sometimes", "idk", or show some pain, use the car detailing story angle.
- If they are resistant, use a soft exit, not a hard pitch.
- The human will review before sending.
- Return JSON only.

Training style guide:
${training.styleGuide || "No style guide found."}
`.trim();

    const examplesText = training.examples
      .slice(0, 12)
      .map((example, index) => {
        return `
Example ${index + 1}
Scenario: ${example.scenario || ""}
Prospect messages: ${(example.prospect_messages || []).join(" | ")}
Good replies: ${(example.good_replies || []).join(" / ")}
Notes: ${example.notes || ""}
`.trim();
      })
      .join("\n\n");

    const user = `
Current conversation/context:
${context}

Business offer/context:
${offer || "AI receptionist and missed-call follow-up system for local service businesses. Free 7-day trial available."}

Goal:
${goalText}

Tone:
${toneText}

Training examples:
${examplesText}

Generate 3 possible replies:
1. Mostafa style reply
2. Soft follow-up reply
3. Direct offer reply

Important:
- Each reply should be ready to send as one Messenger message.
- If a reply would work better as multiple Messenger messages, separate each short message with a single newline.
- Keep it casual and realistic.
- Match the current prospect's tone.
- Do not add markdown or labels inside the reply text.

Return exactly this JSON shape:
{
  "replies": ["...", "...", "..."]
}
`.trim();

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.65,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });

    const data = await openaiRes.json().catch(() => ({}));

    if (!openaiRes.ok) {
      const message = data?.error?.message || `OpenAI request failed with status ${openaiRes.status}`;
      return res.status(openaiRes.status).json({ error: message });
    }

    const raw = data?.choices?.[0]?.message?.content || "{}";
    let parsed = {};

    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { replies: [] };
    }

    const replies = Array.isArray(parsed.replies)
      ? parsed.replies.map(String).filter(Boolean).slice(0, 4)
      : [];

    return res.status(200).json({ replies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error?.message || "Failed to generate replies." });
  }
};
