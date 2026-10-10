# VocaTrace AI — Engineering and Product Rules

## 1. Protect the Existing Project
1. Inspect the repository before changing code.
2. Read the existing documentation, package/configuration files, routes, API contracts, and tests first.
3. Preserve existing working screens, authentication, APIs, database models, and deployment settings.
4. Prefer small, reversible changes over a large rewrite.
5. Do not replace the project's framework or introduce duplicate infrastructure without a demonstrated need.
6. Never delete files or change public interfaces casually.

## 2. Truthfulness of AI Results
1. Never hardcode a score and present it as an AI prediction.
2. Never label audio as cloned unless a configured model returns a result that supports that label.
3. Clearly identify model name/version and what a score means.
4. Do not describe an uncalibrated score as a probability.
5. Keep speaker similarity, synthetic-audio detection, replay detection, and manipulation detection as separate concepts.
6. Show model failures and unavailable capabilities honestly.
7. Treat AI findings as leads requiring review, not proof of guilt.

## 3. Location and Investigation Rules
1. Never infer exact caller location from voice, phone number, or caller ID alone.
2. Do not invent coordinates, tower records, device locations, call records, identities, or timestamps.
3. Every location must carry provenance: verified, estimated, sample, or unavailable.
4. Sample data must be labelled DEMO DATA.
5. Radius is a user-selected geographic filter, not guaranteed location accuracy.
6. Show only authorised records and enforce access controls on the backend.
7. Do not add covert tracking or unauthorised access to carrier/device data.

## 4. Evidence Integrity
1. Preserve original evidence; derived audio/features must be separate assets.
2. Calculate a SHA-256 hash when practical and retain it with evidence metadata.
3. Store model version, processing time, configuration, and errors.
4. Distinguish machine findings from reviewer notes and conclusions.
5. Record important actions in the audit trail where supported.
6. Do not overwrite evidence silently.

## 5. UI and Design
1. The Voice Forensics view, based on reference image 2, is the main dashboard.
2. Location Intelligence, based on reference image 1, is a linked secondary workspace.
3. Use a professional dark palette with restrained teal, amber, and red.
4. Keep typography legible and tables scannable.
5. Provide loading, empty, error, and unavailable states.
6. Controls must work; do not leave decorative buttons that imply functionality.
7. Ensure keyboard accessibility and responsive layouts.
8. Do not use static screenshots as a substitute for functional components.

## 6. Code Quality
1. Follow current linting, formatting, naming, and component patterns.
2. Reuse installed libraries before adding dependencies.
3. Validate all inputs on the server, even if the UI validates them too.
4. Handle network, model, file, and map errors explicitly.
5. Keep model adapters separate from presentation components.
6. Avoid secrets and personal data in logs.
7. Add or update tests for new logic.
8. Do not claim tests passed unless they were actually run.

## 7. Definition of Done
A change is complete only when:
- The relevant feature works in the existing app.
- Existing functionality remains intact.
- Loading/error/empty states are handled.
- Results are based on actual data or clearly labelled demo data.
- Access control is enforced for sensitive data.
- Tests/build checks are run and failures are reported accurately.
- Documentation is updated when behaviour or configuration changes.
