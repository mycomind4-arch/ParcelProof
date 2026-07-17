# ParcelProof

ParcelProof is an evidence-first property due-diligence workspace. It helps a reviewer organize official parcel records, expose missing or conflicting evidence, and export a reproducible proof report.

The first release is deliberately local-first:

- No account or API key is required.
- Parcel data is never fabricated or silently inferred.
- Projects persist in the browser's local storage.
- Every verified conclusion must have a source URL or official reference number.
- Reports export as Markdown; complete projects export/import as JSON.

## Current workflow

1. Create a review using an address or APN.
2. Record parcel facts only when they are supported by evidence.
3. Work through the ten-category evidence register.
4. Resolve deterministic completeness, citation, missing-record, and conflict findings.
5. print the report or export Markdown/JSON.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Validate

```bash
npm test
npm run build
```

## Evidence model

The default register covers assessor identity, ownership, legal description, zoning, permits, code enforcement, taxes, access, utilities, and hazards. A record can be `not-started`, `requested`, `verified`, `missing`, or `conflict`.

ParcelProof organizes cited evidence. It does not provide legal, title, survey, engineering, or environmental advice.
