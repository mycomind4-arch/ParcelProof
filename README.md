# ParcelProof

ParcelProof is a local-first parcel due-diligence workspace. It helps a reviewer organize official records, document gaps and conflicts, and produce a portable evidence report without inventing facts about a property.

## What it does

- Creates an empty parcel review from an address or assessor parcel number.
- Tracks ten evidence categories: parcel identity, ownership, legal description, zoning, permits, code enforcement, taxes, access, utilities, and hazards.
- Records status, responsible agency, source URL, official reference number, record date, and reviewer notes.
- Generates deterministic completeness and findings from the evidence entered by the user.
- Requires verified evidence to include a citation, responsible source, and record date before reporting `EVIDENCE COMPLETE`.
- Stores projects in the current browser and supports portable JSON and Markdown exports.
- Produces a printable evidence report.

## What it does not do

ParcelProof does not certify title, ownership, boundaries, legal access, code compliance, buildability, environmental safety, or investment suitability. It is not legal, title, survey, engineering, environmental, appraisal, or tax advice. It does not automatically collect records or guarantee that a government source is complete or current.

## Run locally

Requirements:

- Node.js 22.13 or newer
- npm 10 or newer

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite.

## Verify the release

```bash
npm test
npm run build
```

Or run both with:

```bash
npm run check
```

## Evidence decisions

| Decision | Meaning |
| --- | --- |
| `INSUFFICIENT EVIDENCE` | The record is too incomplete to support a structured review. |
| `REVIEW REQUIRED` | Material evidence exists, but gaps, conflicts, or provenance requirements remain. |
| `EVIDENCE COMPLETE` | Every required category is verified and every verified item has a citation, responsible source, and record date. This is still not a title or legal opinion. |

Requested records receive partial completeness credit so progress can be tracked, but they are not treated as verified.

## Import and export

The **Export** control downloads the active project as JSON. The **Proof report** view downloads a Markdown report and supports browser printing.

Imported JSON is validated before it enters application state. Files with unsupported statuses, categories, missing fields, or invalid field types are rejected.

Important projects should be exported regularly. Browser storage is tied to the current browser profile and website origin and may be erased by browser cleanup, private-browsing behavior, device loss, or a domain change.

## Deployment

ParcelProof is a static Vite application. `vercel.json` configures a locked install, production build, `dist/` publishing, and baseline response security headers.

For a Vercel deployment:

1. Import this repository into Vercel.
2. Keep the detected Vite framework settings.
3. Deploy the selected release branch or `main` after review.
4. Use HTTPS and a stable production domain.
5. Warn users before changing domains because local browser projects do not move automatically.

No server, database, or environment secrets are required for version 0.2.

## Humboldt County research starting points

See [`docs/HUMBOLDT_OFFICIAL_SOURCES.md`](docs/HUMBOLDT_OFFICIAL_SOURCES.md). The directory intentionally links to authoritative starting points rather than treating a single portal or map as conclusive evidence.

## Privacy and limitations

See [`docs/PRIVACY_AND_LIMITATIONS.md`](docs/PRIVACY_AND_LIMITATIONS.md). Do not enter confidential, privileged, health, financial-account, identity-theft-sensitive, or otherwise regulated information into a deployment you do not control.

## Security

See [`SECURITY.md`](SECURITY.md) for supported versions and private reporting guidance.

## License

MIT. See [`LICENSE`](LICENSE).