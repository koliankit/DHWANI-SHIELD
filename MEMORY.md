# VocaTrace AI — Project Memory

This file records durable project decisions for future coding sessions. Update it when decisions change; do not use it as a substitute for inspecting the current repository.

## Product Identity
- Product name: **VocaTrace AI**.
- Tagline: **Every Voice Leaves a Trace.**
- Broader platform may retain the name **RAKSHAM** if that is the current project identity.
- Purpose: voice-authenticity analysis and digital-evidence investigation support.

## Core Dashboard Decision
- The supplied second reference image is the primary **Voice Forensics** dashboard.
- The supplied first reference image informs the secondary **Location Intelligence** dashboard.
- Both should be functional, connected application views, not embedded screenshots.

## Main Capabilities
1. Audio upload/playback and timeline.
2. Waveform and spectrogram when actual data/features are available.
3. Synthetic-audio/anti-spoofing analysis from configured models.
4. Optional speaker comparison with an authorised reference sample.
5. Case-linked evidence, timestamps, model metadata, and audit history.
6. Interactive map and radius-based filtering of available location records.
7. Evidence report/export with clear provenance and limitations.

## Non-Negotiable Truthfulness Rules
- Never invent AI scores, model outputs, locations, call records, or identities.
- Clearly label demonstration data.
- A voice recording or phone number alone does not provide a person's exact location.
- A speaker similarity score is not proof of identity or audio authenticity.
- A map radius is a selected search radius, not guaranteed source accuracy.
- AI results are investigative leads and require appropriate human review.
- Distinguish verified, estimated, sample, and unavailable location records.

## Engineering Decisions
- Inspect the existing repository before editing.
- Preserve existing framework, working features, routes, APIs, authentication, and database conventions.
- Reuse dependencies and components where possible.
- Extend rather than replace the current project.
- Use stable case, evidence, analysis, event, and location IDs.
- Enforce server-side authorisation for sensitive records.
- Preserve original evidence and record a cryptographic hash where practical.
- Record model/version/configuration metadata for analysis results.

## UI Direction
- Professional dark forensic interface.
- Charcoal/navy surfaces with restrained teal, amber, and red.
- Voice-analysis view is the primary hero screen.
- Location map and records table form the secondary investigation view.
- Readable labels, responsive layouts, accessible controls, and explicit error/empty states.
- Avoid excessive neon or misleading certainty indicators.

## Implementation Workflow
1. Inspect repo and git status.
2. Identify existing app structure and working functionality.
3. Plan minimal changes.
4. Implement in small phases.
5. Run build/tests and verify behaviours.
6. Update this file with actual decisions, APIs, model status, and known limitations.

## Current Project State & Architecture Facts
- **Frontend Framework:** React 18, TypeScript, Vite 6, Tailwind CSS, Lucide icons.
- **Route & Navigation:** State-driven tab switching in `App.tsx` (`voice_analysis`, `geospatial`, `dashboard`, `history`, `models`, `settings`) with seamless cross-module links. The Voice Forensics workspace (`voice_analysis`) is active by default.
- **Backend Framework:** FastAPI / Python 3.10 with Uvicorn, background workers, and PyTorch / Librosa audio processing.
- **AI Models:**
  - *Speaker Verification:* SpeechBrain ECAPA-TDNN (`speechbrain/spkrec-ecapa-voxceleb`) comparing cosine similarity against enrolled templates at an 85.0% threshold.
  - *Synthetic Audio / Anti-Spoofing:* AASIST / RawNet2 architecture trained on ASVspoof data, detecting high-frequency vocoder artefacts and phase discontinuities.
- **Map Library & Basemaps:** Leaflet 1.9 with Esri World Dark Gray Base + Reference tiles (zero API keys, 100% free, no watermarks) alongside OpenStreetMap and Esri World Imagery.
- **Live Map Animations:**
  - `.animated-radius-circle`: Pulsing radius search boundary with SVG glow.
  - `.animated-concentric-ring`: 25%, 50%, 75% concentric distance rings.
  - `.radar-sweep-beam`: 360° rotating radar sweep cone.
  - `.sonar-ripple-ring`: Expanding concentric sonar ripple waves with staggered delays.
  - `.beacon-center-dot`: Blinking beacon center pin.
  - `.track-animated-line`: Animated dash-array trajectory lines between consecutive CDR towers.
- **Location Data Truthfulness:**
  - Strict non-fabrication rule: A voice, phone number, or IP address cannot determine caller coordinates.
  - Only authorized, lawful records mapped: Carrier Tower CDR sectors (estimated area radius), Handset E911 Emergency GPS, Complainant GPS Consent Link.
  - Explicit provenance badges: `VERIFIED LOCATION` (`#2ec4b6`), `ESTIMATED AREA` (`#f0a73a`), `SAMPLE LOCATION` (`#8fb3c9`), `LOCATION UNAVAILABLE` (`#e5534b`).
  - Unavailable records (e.g. Case #V-0887 / Ref #1402) show principled "Location Unavailable" state with intact voice forensics.
- **Deployment:** Vercel deployment with `vercel.json` rewrites and pre-populated CDR records fallback (`DEFAULT_GEOSPATIAL_CALLS`) to ensure zero-blank-screen reliability on static host environments.
