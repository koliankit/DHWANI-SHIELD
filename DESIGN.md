# VocaTrace AI — UI Design Specification

## 1. Design Intent
A credible digital-forensics workspace: precise, calm, information-dense, and usable during an investigation. The main visual reference is the supplied voice-analysis dashboard. The map/call-records reference informs the secondary Location Intelligence screen.

## 2. Visual Tokens
Use existing project design tokens if available. Otherwise, start with these values and tune to the current app.

### Colours
- App background: `#080D12`
- Main panel: `#0D151D`
- Raised panel: `#111D27`
- Divider/border: `#263642`
- Primary text: `#E7EEF3`
- Secondary text: `#94A7B5`
- Teal / active: `#45D6C2`
- Amber / review: `#F2B84B`
- Red / high risk: `#F06464`
- Green / low risk: `#58C99B`

Use colour with labels/icons; never rely on colour alone to communicate status.

## 3. Global Shell
- Left navigation rail with icon and text labels.
- Header with VocaTrace AI brand, current case/event, processing state, and user menu.
- Main content area with consistent spacing and scroll behaviour.
- Keep current project's authentication and routing structure.

Suggested navigation:
- Overview
- Cases
- Voice Forensics
- Location Intelligence
- Evidence
- Reports
- Settings

Only expose routes/features that exist or are being implemented.

## 4. Voice Forensics — Primary Screen
### Desktop composition
- Top: case breadcrumb, event/evidence ID, analysis status.
- Main left/centre: audio waveform, player, time ruler, anomaly markers.
- Lower left/centre: mel-spectrogram when real features are available.
- Right column: voiceprint comparison, similarity output, authenticity/spoofing results.
- Bottom: evidence metadata, reviewer action, report/export controls.

### Audio player
- Play/pause, seek, duration, volume.
- Clicking an anomaly marker seeks to that timestamp.
- Use accessible tooltips and keyboard controls.
- Distinguish actual model-detected intervals from reviewer annotations.

### Analysis cards
Each result card should include:
- Check name.
- Result/status.
- Score and score definition if available.
- Model/version or “not configured.”
- Short explanation.
- Limitations or review note when relevant.

Suggested statuses:
- LOW RISK
- REVIEW REQUIRED
- HIGH RISK
- ANALYSIS UNAVAILABLE

Do not make the status imply certainty beyond the model's capabilities.

### Spectrogram
- Display actual computed spectrogram data.
- Label axes and time units.
- Overlay only supported anomaly intervals.
- If not generated, show an explicit empty state.

## 5. Location Intelligence — Secondary Screen
### Main layout
- Large interactive map taking roughly 65–75% of desktop width.
- Side panel for selected record and provenance.
- Bottom panel with searchable call/event records.
- Responsive mode stacks map, detail panel, and table.

### Map elements
- Marker for selected location.
- Distinct marker styles for different source/provenance statuses.
- Circular radius overlay with a visible outline and subtle fill.
- Legend, zoom controls, scale, and selected radius.
- Radius presets: 100 m, 250 m, 500 m, 1 km, 2 km, 5 km.
- Unit label and clear selected-record indicator.

### Location status labels
- `VERIFIED LOCATION`
- `ESTIMATED AREA`
- `SAMPLE LOCATION`
- `LOCATION UNAVAILABLE`

Display source and capture time if available. Do not suggest that the selected circle is the actual accuracy boundary unless the source explicitly provides that accuracy.

### Records table
Potential columns:
- Event ID
- Case ID
- Caller/target identifier (masked as appropriate)
- Date/time
- Duration
- Direction
- Location source
- Evidence status

Support search, sort, filters, row selection, and pagination. Use real available fields only.

## 6. Cross-Screen Interaction
- Selecting an audio event preserves its event ID.
- “View location” opens Location Intelligence for the same event.
- If a linked location exists, focus the map on it.
- If multiple records exist, show them as separate evidence-backed records.
- If none exists, show an unavailable state.
- “Back to audio” returns to the selected event and timestamp.
- Preserve case/event context in route parameters or the project's established state management.

## 7. Responsive Behaviour
- Desktop: two-column analysis layout; map with side panel and table.
- Tablet: reduce secondary panels and allow collapsible sections.
- Mobile: stack panels, keep audio controls usable, and make the table horizontally scrollable or switch to record cards.
- Never hide high-risk status, provenance, or error messages behind hover-only interactions.

## 8. Motion
Use restrained transitions for panel changes, loading, and map selection. Do not animate fake live analysis. Any live status must reflect actual backend state.

## 9. Accessibility
- Sufficient text/background contrast.
- Keyboard-accessible buttons, sliders, tables, and navigation.
- Text labels for status icons.
- Visible focus states.
- Accessible names for audio controls and map radius selectors.
- Avoid communicating findings through colour alone.

## 10. Design Acceptance Checklist
- The voice-analysis screen is the primary hero.
- Map view is connected, not a detached mockup.
- No fabricated scores, coordinates, or call records.
- All statuses have readable labels.
- Radius control updates the circle and available geographic filtering.
- Empty and error states are designed.
- UI works at desktop and mobile widths.
