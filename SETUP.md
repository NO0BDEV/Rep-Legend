# Rep Legend — Beta Setup

Vite + React project. The app source is `src/RepApp.jsx` — liquid-glass visuals merged with the full standalone feature set (History screen restored).

## Quick start

```bash
cd "Rep Legend"
npm install
npm run dev
```

Vite prints a Network URL (e.g. `http://192.168.x.x:5173`) — open it on your phone (same Wi-Fi). The `--host` flag is already set in the dev script.

## Production build + phone test

```bash
npm run build
npm run preview
```

Accelerometer auto-count only works on a real mobile device — desktop shows the counter but motion detection is inactive.

## What's in beta

| Feature | Status | Notes |
|---|---|---|
| Onboarding | ✅ | 3-screen, one-time |
| Ignition screen | ✅ | Rest timer picker |
| Manual tap counting | ✅ | Default mode — tap anywhere |
| Auto-count (experimental) | ✅ | Opt-in, 2-set calibration |
| Ghost rep flicker | ✅ | Cadence-based anticipation |
| Rest timer | ✅ | 4-7-8 breathing guide |
| Word-by-word quotes | ✅ | Appears after 19s |
| Loss-framed streak | ✅ | Adaptive by streak length |
| Exercise logging | ✅ | Search + custom add |
| AI machine scan | ✅ | Gemini Vision; needs Gemini API key (stored in localStorage as `rl_gemini_key`) |
| Voice auto-logger | ✅ | Web Speech API + Gemini Flash NLP; tap 🎙️ mic to speak workout, auto-logs |
| Score reveal | ✅ | Slot-machine grade, XP count-up |
| Variable XP bonus | ✅ | Secret multiplier ~20% of sessions |
| History screen | ✅ | All workouts + grades, glass cards |
| Wake Lock | ✅ | Screen stays on during sets |
| iOS haptic fallback | ✅ | AudioContext pulse if no vibrate |

## Known beta limitations

- Accelerometer threshold is global; per-exercise calibration comes in v2
- No cloud sync — data is localStorage only (per device)
- Grade rubric is rep-volume based; will incorporate weight in v2
- iOS sensor permission dialog appears once when enabling auto-count
- AI features (machine scan + voice logger) require a Gemini API key (AIza…) — enter once in-app, stored locally

## Metrics that will sharpen the algorithm

1. **Miscounted rep rate** — how often users tap ± to correct
2. **Rest skip rate** — how often Continue is tapped before timer ends
3. **Session completion rate** — workouts that reach Reveal vs abandoned
4. **Grade vs return rate** — which grades drive next-day return
5. **Exercise logging skip rate** — if >60% skip, remove the screen

## Roadmap to full iOS app

- [ ] React Native port (same logic, native APIs)
- [ ] HealthKit integration (reps → Apple Health)
- [ ] Per-exercise calibration profiles
- [ ] Weight tracking → e1RM progression
- [ ] Adaptive rest recommendation from recovery data
- [ ] Social accountability (optional shareable score card)
