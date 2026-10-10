# VocaTrace AI — Product Requirements Document

## 1. Product Overview
**Product name:** VocaTrace AI  
**Parent project/platform:** RAKSHAM (if retained by the team)  
**Product category:** Voice authenticity analysis and digital-evidence investigation dashboard  
**Tagline:** Every Voice Leaves a Trace.

VocaTrace AI helps an authorised investigator review audio, inspect AI-generated voice-cloning indicators, compare a submitted recording with an authorised reference sample, and connect an audio event to available case records and location evidence.

The product is an investigation aid, not an autonomous accusation or a substitute for a trained forensic examiner.

## 2. Problem Statement
Voice-cloning and replay attacks can be used for impersonation and fraud. Investigators need a single workspace that combines:
- Audio playback and timeline review.
- Model-supported synthetic-audio and manipulation analysis.
- Speaker-similarity comparison when a valid reference sample exists.
- Case-linked evidence and audit history.
- A geospatial view of location records when reliable, authorised coordinates are available.

Audio alone does not reveal a caller's precise physical location or prove who committed a crime. The system must communicate those limits clearly.

## 3. Goals
1. Make audio evidence easy to review and investigate.
2. Present real model results with understandable explanations and uncertainty.
3. Connect each audio event to a stable case/event ID.
4. Show available geographic evidence with source and confidence/provenance labels.
5. Preserve evidence integrity and an auditable history.
6. Provide a responsive, professional, dark forensic interface.

## 4. Non-Goals
- Automatically identifying or accusing a person from a voice alone.
- Locating a caller from an audio recording or phone number alone.
- Accessing carrier records, private devices, or live calls without authorised integration.
- Presenting demo values as real model outputs.
- Replacing a forensic examiner or official police case-management system.

## 5. Users and Roles
- **Investigator:** reviews cases, audio events, analysis results, and authorised location records.
- **Forensic reviewer:** validates model findings, compares evidence, and documents conclusions.
- **Administrator:** manages users, roles, model/configuration metadata, and audit access.
- **Demo user:** accesses explicitly labelled sample data only.

Enforce least-privilege access. The roles above are product roles; adapt them to existing authentication and project conventions.

## 6. Core User Journeys
### Journey A: Analyse audio
1. User opens a case or creates an authorised case record.
2. User uploads a supported audio file.
3. The application validates file type and size, calculates a file hash, and creates an evidence/event ID.
4. Audio analysis runs through the configured backend/model.
5. The dashboard shows waveform, playback, spectrogram if available, anomaly timestamps, model outputs, and limitations.
6. User reviews findings and records notes.

### Journey B: Compare a voice
1. User selects a submitted recording and an authorised reference sample.
2. The backend runs a supported speaker-comparison workflow.
3. The dashboard shows similarity output, threshold/configuration, model version, and a clear caution that similarity is not proof of identity or authenticity.

### Journey C: Investigate geographic records
1. User opens the event's Location Intelligence view.
2. If authorised coordinates exist, the map centres on the supplied record.
3. User chooses a display radius and sees geographically filtered records that actually contain coordinates.
4. Every location displays its provenance/status.
5. If location evidence is absent, the UI shows “Location unavailable” rather than inventing a pin.

### Journey D: Export evidence
1. User selects an event or case.
2. The system assembles available original-file metadata, file hash, analysis metadata, reviewer notes, and audit details.
3. Export clearly distinguishes machine-generated findings from human conclusions.

## 7. Functional Requirements
### Audio evidence
- Upload and play supported audio files.
- Display duration, file name, evidence ID, processing state, and timestamps.
- Show waveform and clickable anomaly markers.
- Render a spectrogram only when generated from actual audio/features.
- Preserve the original file and metadata where feasible.
- Validate uploads and handle unsupported/corrupt files.

### AI analysis
- Integrate existing audio authenticity/synthetic-audio model if available.
- Show model name/version, score meaning, threshold, and limitations.
- Distinguish synthetic-audio detection from speaker similarity.
- Show “unavailable” when a model is not configured or fails.
- Never hardcode a detection percentage as if it came from a model.

### Case and event linking
- Use stable IDs for cases, evidence, audio events, and location records.
- Allow navigation from an audio event to associated location records and back.
- Keep event selection and relevant timestamps in sync across views.

### Location intelligence
- Map only supplied, valid coordinates.
- Label each point as Verified, Estimated, Sample, or Unavailable according to its provenance.
- Provide configurable radius display, in metres/kilometres.
- Filter records by geographic distance only when coordinates are present.
- Clearly state that a radius is a search area, not a guarantee of location accuracy.

### Investigation records
- Search, sort, and filter available call/event records.
- Display only fields available from authorised data sources.
- Record user actions and exports in an audit trail where supported.

### Security and privacy
- Authentication and role-based authorisation.
- Validate inputs and restrict file types/sizes.
- Protect audio and sensitive case data in transit and at rest according to deployment capabilities.
- Avoid exposing secrets or sensitive records in logs.
- Use synthetic/sample data for demos and label it clearly.

## 8. UX and Visual Direction
- Main hero: Voice Forensics workspace inspired by the supplied second reference image.
- Secondary workspace: Location Intelligence inspired by the supplied first reference image.
- Charcoal/navy surfaces, restrained teal, amber, and red.
- High information density without clutter.
- Clear status labels, readable typography, keyboard-accessible controls, and responsive layouts.
- Avoid decorative neon effects and misleading “certainty” graphics.

## 9. Success Criteria
- Existing project builds and runs without regressions.
- A supported audio file can be uploaded and played.
- Analysis UI reflects actual backend responses or a clearly labelled unavailable state.
- Audio event can open its linked map view.
- Radius control updates the drawn circle and geographic filtering.
- Missing location data does not create a fake location.
- Evidence export and audit metadata are accurate where implemented.
- UI distinguishes model output, sample data, and human review.

## 10. Assumptions and Open Items
- Existing repository stack, API, database, and model capabilities must be inspected before implementation.
- Actual model and data integrations may vary by environment.
- Live-call audio, carrier records, and precise location integrations require separate authorised technical access.
- Confirm local data retention, consent, legal, and deployment requirements before production use.
