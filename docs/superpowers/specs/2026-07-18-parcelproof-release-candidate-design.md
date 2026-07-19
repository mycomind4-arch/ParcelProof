# ParcelProof Release Candidate Design

## Objective

Turn the existing local-first ParcelProof MVP into a reproducible, reviewable release candidate without expanding it into an automated title, legal, or government-record system.

## Product boundary

ParcelProof creates and preserves a parcel due-diligence work file. It does not invent parcel facts, scrape restricted systems, certify title, determine legal ownership, or replace legal, survey, engineering, environmental, or professional accessibility review.

Version 0.2 remains browser-local. Users explicitly export JSON or Markdown when they want a portable copy. No authentication, cloud database, billing, AI extraction, or unattended record collection is included.

## Release requirements

### Evidence integrity

- Imported JSON must match the complete ParcelProof project shape.
- Evidence categories and statuses must be recognized values.
- A required record marked verified must include a citation, responsible agency or custodian, and record date before the project can reach `EVIDENCE COMPLETE`.
- Missing provenance must produce deterministic review findings.

### Reproducibility

- Every direct dependency is pinned to the exact version represented in `package-lock.json`.
- Node.js 22.13 or newer is required because the current jsdom/Vite toolchain requires that floor.
- `npm ci`, `npm test`, and `npm run build` are the canonical validation commands.

### Release operations

- GitHub Actions runs install, unit/interaction tests, and the production build on pushes and pull requests.
- Static-host configuration supports a Vite production build without introducing a server dependency.
- The repository includes an MIT license, security reporting guidance, privacy and limitations documentation, and a current Humboldt County official-source directory.

### Deployment

The application remains a static single-page application. A production host serves `dist/` over HTTPS. Browser storage remains origin-specific; changing domains does not migrate stored projects. Operators must clearly warn users to export important project files.

## Architecture

The existing boundaries remain intact:

- `src/lib/project.ts` owns project creation and runtime import validation.
- `src/lib/analysis.ts` owns deterministic completeness and finding logic.
- `src/lib/export.ts` owns portable report generation.
- `src/App.tsx` owns browser state and workflow presentation.

No unrelated component refactor is part of this release.

## Error handling

Invalid imports are rejected before they enter application state. The UI continues to display the existing invalid-export alert. Unsupported statuses, categories, missing fields, and invalid field types fail validation rather than being partially accepted.

## Testing

- Project validator tests cover valid exports, unsupported statuses, and missing required fields.
- Analysis tests cover provenance requirements and the transition from review required to evidence complete.
- Existing React interaction coverage remains in place.
- CI runs the complete suite and production build on Node 22.

## Acceptance criteria

The release candidate is complete when:

1. all direct dependency ranges are exact and match the lockfile;
2. malformed project imports are rejected;
3. required verified evidence without custodian or record date cannot yield `EVIDENCE COMPLETE`;
4. all automated tests pass;
5. the Vite production build succeeds;
6. CI, deployment configuration, license, security, privacy, limitations, and official-source documentation are present; and
7. the draft pull request accurately describes verification evidence and remaining deployment-account work.