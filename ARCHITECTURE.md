# VocaTrace AI — Architecture

## 1. Architecture Principles
- Extend the existing repository; do not replace its framework or working features without need.
- Keep the UI, API, AI inference, evidence storage, and location records logically separated.
- Treat model output as decision support, not a final legal conclusion.
- Never fabricate location data or inference results.
- Use stable IDs and auditable links between cases, audio evidence, analysis jobs, and location records.

## 2. Logical Components

```text
Investigator Browser
  ├── Voice Forensics UI
  │     ├── Audio player + waveform
  │     ├── Spectrogram/anomaly timeline
  │     ├── Authenticity results
  │     └── Speaker comparison
  ├── Location Intelligence UI
  │     ├── Map + radius overlay
  │     ├── Location provenance
  │     └── Related-record table
  └── Case / Evidence / Report UI
             │
             ▼
        Existing Backend API
  ├── Authentication + authorisation
  ├── Case and event service
  ├── Evidence metadata service
  ├── Audio analysis orchestration
  ├── Location record service
  ├── Geographic filtering
  ├── Report/export service
  └── Audit logging
       │        │        │
       ▼        ▼        ▼
 Audio Model  Database  Evidence Storage
 Adapter      (existing) (existing or configured)
       │
       ├── Authenticity / synthetic-audio model
       ├── Optional replay/manipulation detector
       └── Optional speaker embedding/comparison
```

This is a logical reference, not a requirement to create all services separately. Fit it to the current codebase.

## 3. Frontend Areas
- **Voice Forensics:** upload/playback, waveform, timestamps, spectrogram, model results, review actions.
- **Location Intelligence:** map, radius selector, provenance labels, record table.
- **Case Workspace:** selected case, linked events, notes, evidence list.
- **Evidence Report:** metadata, hashes, analysis versions, reviewer notes, export.
- **Shared state:** current case ID, selected event ID, selected timestamp, and navigation context.

Reuse existing UI components and routing patterns.

## 4. Backend Boundaries
### Audio analysis adapter
A single interface should hide model-specific implementation details. It should return structured results containing:
- job/event ID
- status
- model name and version
- score(s) with documented meaning
- threshold/configuration when relevant
- flagged time intervals, if supported
- explanation/limitations
- error state when analysis fails

Do not assume a score is a calibrated probability unless the model documentation establishes that.

### Evidence service
Stores metadata for original audio and derived outputs. Calculate a cryptographic hash, such as SHA-256, where feasible. Do not silently overwrite originals.

### Location service
Accepts coordinates only from supported, authorised sources. Include source type, capture time, precision/accuracy if supplied, and provenance status. A map radius is a UI/search filter and must not be presented as a measurement of the source's actual accuracy.

### Case/event service
Maintains stable links between cases, audio evidence, analysis jobs, and location records.

### Audit service
Records significant operations such as upload, analysis start/completion, review, location-record access, and export, subject to project policy.

## 5. Suggested Data Model
Adapt names to existing database conventions.

### Case
- id
- case_reference
- status
- created_at
- created_by

### EvidenceAsset
- id
- case_id
- storage_reference
- original_filename
- media_type
- file_size
- sha256
- duration_seconds
- uploaded_at
- uploaded_by

### AudioAnalysis
- id
- evidence_id
- status
- model_name
- model_version
- result_json
- started_at
- completed_at
- error_code

### AudioEvent
- id
- case_id
- evidence_id
- start_seconds
- end_seconds
- event_type
- severity
- analysis_id

### LocationRecord
- id
- case_id
- event_id (nullable if not linked)
- latitude
- longitude
- source_type
- provenance_status
- recorded_at
- accuracy_meters (nullable)
- source_reference (restricted as appropriate)

### AuditEvent
- id
- actor_id
- case_id
- action
- target_type
- target_id
- occurred_at
- metadata (avoid secrets and unnecessary personal data)

Do not migrate to this schema wholesale if equivalent tables already exist.

## 6. API Capabilities
Reuse equivalent existing routes where available. Illustrative route shapes:

- `POST /api/evidence/audio` — upload audio and create evidence metadata.
- `GET /api/cases/{caseId}/events` — list case events.
- `GET /api/audio-events/{eventId}` — event details.
- `POST /api/audio-events/{eventId}/analysis` — request analysis.
- `GET /api/audio-analysis/{analysisId}` — retrieve results/status.
- `GET /api/audio-events/{eventId}/locations` — fetch linked location records.
- `GET /api/location-records?caseId=...` — list authorised location records.
- `GET /api/location-records/within-radius?lat=...&lng=...&radiusMeters=...` — filter records with coordinates.
- `GET /api/cases/{caseId}/evidence-report` — export or generate report.

These routes are examples only. Match existing API naming and response conventions.

## 7. Geographic Radius
- Store coordinates as latitude/longitude in decimal degrees.
- Validate latitude within -90..90 and longitude within -180..180.
- Accept radius in metres internally; convert to kilometres for display when appropriate.
- Use a Haversine or geospatial database query for distance filtering.
- Return only records the current user is authorised to access.
- State that the circle is a selected search radius, not guaranteed device or person accuracy.
- Do not use a radius to infer a person's presence without reliable underlying location records.

## 8. Data Flow
1. User uploads audio.
2. API validates it, stores the original safely, computes metadata/hash, and creates an evidence ID.
3. Analysis orchestration calls configured models.
4. Results are persisted with model/version/configuration metadata.
5. UI retrieves results and renders them without inventing values.
6. User selects an event and opens its linked location records.
7. Location view shows only available, authorised coordinates and source labels.
8. Report export records the report operation in the audit trail.

## 9. Failure and Unavailable States
- Unsupported audio: show validation error.
- Model unavailable: show “Analysis unavailable” and preserve upload metadata.
- Analysis running: show progress without fabricating a score.
- No reference speaker sample: disable comparison and explain why.
- No linked location record: show “Location unavailable.”
- Invalid coordinates: reject or quarantine the record.
- Map service unavailable: show record table and an explicit map error.
- Export failure: preserve case data and display retry/error status.

## 10. Security
- Follow existing authentication and access-control conventions.
- Apply server-side authorisation to every case/evidence/location request.
- Validate uploads, filenames, MIME types, and size limits.
- Keep secrets in environment configuration; never commit credentials.
- Restrict evidence URLs and avoid public exposure.
- Log access and export events without logging raw audio or sensitive secrets.
- Define retention/deletion policy before production deployment.
