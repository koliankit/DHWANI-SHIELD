# VocaTrace AI — Implementation Tasks

## Phase 0: Repository Reconnaissance
- [x] Inspect repository structure and current git status.
- [x] Read existing PRD/architecture/design docs, if present.
- [x] Identify frontend framework, routes, components, and styling approach.
- [x] Identify backend framework, API conventions, database, and auth.
- [x] Locate existing audio upload and AI/model code.
- [x] Identify map library and any existing geospatial data.
- [x] Run the existing app and record baseline build/test status.
- [x] Report findings before large architectural changes.

## Phase 1: Safe Foundation
- [x] Preserve a clean checkpoint/branch before edits.
- [x] Reuse existing layout, routing, authentication, and UI tokens.
- [x] Define shared case/event/evidence types based on current models.
- [x] Add only missing fields/endpoints; avoid duplicate services.
- [x] Define truthful loading, empty, error, and unavailable states.

## Phase 2: Voice Forensics Hero
- [x] Implement audio upload using existing API conventions.
- [x] Validate file type/size and handle failures.
- [x] Add audio player and timeline.
- [x] Render waveform from real audio data or a documented existing service.
- [x] Add clickable event/anomaly markers when supported.
- [x] Render spectrogram from actual computed features, if available.
- [x] Add analysis status and model metadata.
- [x] Integrate actual authenticity/synthetic-audio results where configured.
- [x] Add optional speaker comparison only if backend supports it.
- [x] Separate speaker similarity from authenticity detection.
- [x] Add human review and annotation controls where appropriate.

## Phase 3: Evidence Metadata
- [x] Generate stable evidence/event IDs.
- [x] Preserve original uploaded evidence.
- [x] Compute SHA-256 where practical.
- [x] Store file metadata and analysis/model version.
- [x] Add audit entries for relevant evidence actions.
- [x] Ensure errors never create fake success states.

## Phase 4: Location Intelligence
- [x] Implement map using existing library or a compatible chosen library.
- [x] Fetch authorised location records from the backend.
- [x] Render markers only for valid supplied coordinates.
- [x] Show provenance labels for each location.
- [x] Add radius selector for 100 m, 250 m, 500 m, 1 km, 2 km, and 5 km.
- [x] Draw a correctly scaled circular overlay.
- [x] Implement distance filtering using Haversine or a supported geospatial query.
- [x] Validate coordinate and radius inputs.
- [x] Build searchable/sortable call/event records table.
- [x] Show a clear empty state when location data is absent.
- [x] Label all sample records as DEMO DATA.

## Phase 5: Connect Audio and Map
- [x] Add “View location” action to selected audio events.
- [x] Pass stable case/event IDs through established routing/state.
- [x] Centre the map only on linked, available coordinates.
- [x] Preserve selected event and timestamp when navigating back.
- [x] Support multiple linked location records when present.
- [x] Test missing, invalid, and unauthorised location scenarios.

## Phase 6: Reports and Review
- [x] Implement evidence report with original file metadata and hash.
- [x] Include model/version, result, configuration, and limitations.
- [x] Separate machine findings from reviewer conclusions.
- [x] Include location provenance only when relevant and authorised.
- [x] Add export audit record where supported.
- [x] Ensure report generation handles failures.

## Phase 7: Security and Quality
- [x] Enforce backend authorisation on cases, audio, and location data.
- [x] Validate upload and API inputs server-side.
- [x] Confirm sensitive data is not written to logs unnecessarily.
- [x] Confirm secrets are not committed.
- [x] Add tests for geographic distance and radius filtering.
- [x] Add tests for unavailable model and location states.
- [x] Test invalid coordinates and unsupported audio.
- [x] Test event-to-map navigation.
- [x] Run lint, unit tests, build, and available integration tests.
- [x] Fix regressions without removing existing functionality.

## Phase 8: Final Review
- [x] Verify desktop and mobile layouts.
- [x] Verify all buttons and filters work.
- [x] Verify real results are not mixed with sample values.
- [x] Verify provenance and limitations are visible.
- [x] Document setup/configuration changes.
- [x] Report changed files, completed tasks, tests run, and remaining dependencies.

## Priority Order
P0: Preserve existing app; inspect repository; voice dashboard integration.
P1: Real model outputs and evidence metadata.
P1: Location view, provenance, and radius control.
P2: Cross-screen linking and searchable records.
P2: Report export and audit trail.
P3: Visual polish, responsive refinements, and extended tests.

## Implementation Rule
Do not mark a task complete merely because a screen exists. Verify its behaviour and data source.
