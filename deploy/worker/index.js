/**
 * Rep Legend — Cloudflare Workers AI Backend
 * Routes: /ai/voice · /ai/scan · /ai/theme · /ai/wallpaper · /ai/coach
 *
 * Deploy:
 *   cd deploy/worker
 *   wrangler secret put RL_SECRET   ← set your own secret
 *   wrangler deploy
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function cors() {
  return new Response(null, { status: 204, headers: CORS });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

// ── Auth middleware ──────────────────────────────────────────────────────────
function authorized(request, env) {
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${env.RL_SECRET}`;
}

// ── Main handler ─────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return cors();
    if (!authorized(request, env)) return err('Unauthorized', 401);

    const { pathname } = new URL(request.url);

    try {
      if (pathname === '/ai/voice')       return handleVoice(request, env);
      if (pathname === '/ai/voice-parse') return handleVoiceParse(request, env);
      if (pathname === '/ai/scan')        return handleScan(request, env);
      if (pathname === '/ai/theme')       return handleTheme(request, env);
      if (pathname === '/ai/wallpaper')   return handleWallpaper(request, env);
      if (pathname === '/ai/coach')       return handleCoach(request, env);
      if (pathname === '/ai/progress')    return handleProgress(request, env);
      return err('Not found', 404);
    } catch (e) {
      console.error(e);
      return err(e.message, 500);
    }
  },
};

// ── /ai/voice — Whisper speech-to-text ──────────────────────────────────────
// Expects: multipart/form-data with field "audio" (webm blob)
async function handleVoice(request, env) {
  const formData = await request.formData();
  const audio = formData.get('audio');
  if (!audio) return err('No audio field');

  const buffer = await audio.arrayBuffer();

  const result = await env.AI.run('@cf/openai/whisper', {
    audio: [...new Uint8Array(buffer)],
  });

  return json({ text: result.text?.trim() || '' });
}

// ── /ai/voice-parse — Llama NLP workout text parser ─────────────────────────
// Expects: { text: "bench press 3 sets 10 reps 185 lbs", exerciseList: "..." }
async function handleVoiceParse(request, env) {
  const { text, exerciseList } = await request.json();
  if (!text) return err('No text');

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: 'You parse workout voice logs into JSON. Reply with ONLY valid JSON, no markdown, no explanation.',
      },
      {
        role: 'user',
        content: `Parse this workout voice log: "${text}"

Known exercises (match to one if possible): ${exerciseList || ''}

Reply with ONLY this JSON:
{"exercise": "Exercise Name", "sets": number_or_null, "reps": number_or_null, "weight": number_or_null, "unit": "lbs"}

Rules: unit is "lbs" by default unless user says kg/kilos. weight is the number they said.`,
      },
    ],
    max_tokens: 100,
  });

  const raw = result.response || '{}';
  const match = raw.match(/\{[\s\S]*\}/);
  let parsed = {};
  try { parsed = JSON.parse(match?.[0] || '{}'); } catch (_) {}

  return json(parsed);
}

// ── /ai/scan — Llama Vision gym machine identification ───────────────────────
// Expects: { image: "base64string" }
async function handleScan(request, env) {
  const { image } = await request.json();
  if (!image) return err('No image');

  // Decode base64 → Uint8Array
  const bytes = Uint8Array.from(atob(image), c => c.charCodeAt(0));

  const result = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
    prompt: 'Identify this gym machine or exercise equipment. Reply with ONLY the exercise name, 2–4 words. Examples: "Lat Pulldown", "Leg Press Machine", "Cable Row", "Smith Machine". If unclear, reply "Custom Machine".',
    image: [...bytes],
  });

  const name = (result.response || 'Custom Machine').trim().replace(/['"*]/g, '');
  return json({ name });
}

// ── /ai/theme — Llama CSS theme generation ──────────────────────────────────
// Expects: { vibe: "dark samurai" }
async function handleTheme(request, env) {
  const { vibe } = await request.json();
  if (!vibe) return err('No vibe');

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: 'You are a CSS theme designer for a dark, psychological fitness app. You only output valid JSON, no markdown, no explanation.',
      },
      {
        role: 'user',
        content: `Generate a dark gym app theme for this vibe: "${vibe}".

Output ONLY this JSON (no markdown fences):
{
  "name": "2–3 word theme name",
  "accent": "#HEXCOLOR (vibrant primary — used for buttons, highlights)",
  "accent2": "#HEXCOLOR (lighter variant of accent)",
  "bg": "#HEXCOLOR (main background — must be very dark, near #000)",
  "bg2": "#HEXCOLOR (card/panel background — slightly lighter than bg)",
  "bg3": "#HEXCOLOR (tertiary surface)",
  "restBg": "#HEXCOLOR (rest phase — deep indigo or dark tone)",
  "activeBg": "#0A0A0A or similar near-black (active set phase)",
  "text": "#FFFFFF",
  "text2": "#HEXCOLOR (secondary text — muted, 60% opacity feel)",
  "restAccent": "#HEXCOLOR (accent used during rest phase)",
  "wallpaperPrompt": "A cinematic abstract gym wallpaper prompt for Stable Diffusion, 15 words max, dark, no people, no text"
}`,
      },
    ],
    max_tokens: 400,
  });

  const raw = result.response || '{}';
  const match = raw.match(/\{[\s\S]*\}/);
  let theme = {};
  try { theme = JSON.parse(match?.[0] || '{}'); } catch (_) {}

  // Sanitize — ensure all values are strings
  const safe = {};
  for (const [k, v] of Object.entries(theme)) safe[k] = String(v);

  return json(safe);
}

// ── /ai/wallpaper — Flux image generation ───────────────────────────────────
// Expects: { prompt: "...", accent: "#hex" }
async function handleWallpaper(request, env) {
  const { prompt, accent } = await request.json();
  if (!prompt) return err('No prompt');

  const fullPrompt = `${prompt}, ultra dark background, cinematic dramatic lighting, ${accent || '#F59E0B'} color accent, abstract, no text, no people, 4K quality, atmospheric`;

  const result = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', {
    prompt: fullPrompt,
    num_steps: 4,
  });

  // result.image is a ReadableStream of PNG bytes
  const reader = result.image.getReader();
  const chunks = [];
  let done = false;
  while (!done) {
    const { value, done: d } = await reader.read();
    if (value) chunks.push(value);
    done = d;
  }
  const bytes = new Uint8Array(chunks.reduce((a, c) => a + c.length, 0));
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }

  const base64 = btoa(String.fromCharCode(...bytes));
  return json({ image: base64 });
}

// ── /ai/coach — Llama workout insight ───────────────────────────────────────
// Expects: { history: [...workouts], latest: {...workout} }
async function handleCoach(request, env) {
  const { history = [], latest = {} } = await request.json();

  const historyText = history.slice(-8).map(w => {
    const exList = (w.exercises || [])
      .map(e => `${e.name} ${e.sets || '?'}×${e.reps || '?'}@${e.weight || '?'}kg`)
      .join(', ');
    return `${w.date || '?'}: ${exList} | Grade: ${w.grade || '?'}`;
  }).join('\n');

  const latestText = (latest.exercises || [])
    .map(e => `${e.name} ${e.sets || '?'}×${e.reps || '?'}@${e.weight || '?'}kg`)
    .join(', ');

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: 'You are a sharp, data-driven strength coach. You give ONE specific, actionable insight in 1–2 sentences. No greetings. No fluff. Be direct and specific.',
      },
      {
        role: 'user',
        content: `Workout history (last 8 sessions):
${historyText || 'No history yet.'}

Latest session:
${latestText || JSON.stringify(latest)}

Give one sharp coaching insight about progression, fatigue, volume balance, or what to focus on next.`,
      },
    ],
    max_tokens: 120,
  });

  return json({ insight: result.response?.trim() || '' });
}

// ── /ai/progress — Smart set progression suggestion ─────────────────────────
// Expects: { exerciseName: "Bench Press", history: [...sets] }
async function handleProgress(request, env) {
  const { exerciseName, history = [] } = await request.json();

  const recent = history.slice(-5).map(s =>
    `${s.date || '?'}: ${s.sets}×${s.reps} @ ${s.weight}kg`
  ).join('\n');

  const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: 'You suggest the next workout target for a lifter. Reply with ONLY a JSON object, no markdown.',
      },
      {
        role: 'user',
        content: `Exercise: ${exerciseName}
Recent sessions:
${recent || 'No history.'}

Suggest next session target. Reply with ONLY:
{"weight": number_in_kg, "reps": number, "tip": "one short sentence why"}`,
      },
    ],
    max_tokens: 80,
  });

  const raw = result.response || '{}';
  const match = raw.match(/\{[\s\S]*\}/);
  let suggestion = {};
  try { suggestion = JSON.parse(match?.[0] || '{}'); } catch (_) {}

  return json(suggestion);
}
