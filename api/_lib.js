const fs = require("fs");
const path = require("path");

const allowedOrigins = new Set([
  "https://www.facebook.com",
  "https://business.facebook.com",
  "https://www.messenger.com"
]);

function setCors(req, res) {
  const origin = req.headers.origin || "";

  if (allowedOrigins.has(origin) || origin.startsWith("chrome-extension://") || origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function handleOptions(req, res) {
  if (req.method === "OPTIONS") {
    setCors(req, res);
    res.status(204).end();
    return true;
  }
  return false;
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function loadTraining() {
  const root = process.cwd();
  const stylePath = path.join(root, "training", "style-guide.txt");
  const examplesPath = path.join(root, "training", "reply-examples.json");

  let styleGuide = "";
  let examples = [];

  try {
    styleGuide = fs.readFileSync(stylePath, "utf8");
  } catch {
    styleGuide = "";
  }

  try {
    const raw = fs.readFileSync(examplesPath, "utf8");
    const parsed = JSON.parse(raw);
    examples = Array.isArray(parsed) ? parsed : [];
  } catch {
    examples = [];
  }

  return { styleGuide, examples };
}

function normalizeGoal(goal) {
  const map = {
    continue_conversation: "Continue the conversation without pitching too hard.",
    offer_trial: "Mention the free trial naturally if it fits.",
    handle_objection: "Respond to the objection and keep the conversation open.",
    book_call: "Move toward a call or demo without being pushy.",
    short_reply: "Make it very short and conversational.",
    personal_story: "Use the car detailing business story angle if it fits."
  };
  return map[goal] || map.continue_conversation;
}

function normalizeTone(tone) {
  const map = {
    casual: "Casual and human.",
    professional: "Professional and clear.",
    playful: "Lightly playful but still business-appropriate.",
    direct: "Direct and concise.",
    mostafa: "Mostafa style: casual, simple, local, slightly imperfect, not corporate, not over-polished."
  };
  return map[tone] || map.casual;
}

module.exports = {
  setCors,
  handleOptions,
  readJsonBody,
  loadTraining,
  normalizeGoal,
  normalizeTone
};
