# ParcelProof Release Candidate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a reproducible ParcelProof 0.2 release candidate with stricter evidence integrity, CI, static deployment readiness, and operator documentation.

**Architecture:** Preserve the current static React/Vite application. Strengthen the two existing deterministic domain modules (`project.ts` and `analysis.ts`), then add release infrastructure around the unchanged browser-local workflow.

**Tech Stack:** React 19.2.7, TypeScript 7.0.2, Vite 8.1.5, Vitest 4.1.10, jsdom 29.1.1, GitHub Actions, static hosting.

## Global Constraints

- Do not add cloud persistence, authentication, billing, AI extraction, or automated government-record collection.
- Do not claim title, legal, survey, engineering, environmental, or compliance certainty.
- Keep all direct dependency versions exact and consistent with `package-lock.json`.
- Require Node.js `>=22.13.0`.
- Work only on `agent/initial-parcelproof-mvp`; do not modify `main` directly.

---

### Task 1: Project import integrity

**Files:**
- Create: `src/lib/project.test.ts`
- Modify: `src/lib/project.ts`

**Interfaces:**
- Consumes: `ParcelProject`, `EvidenceItem`, `EvidenceCategory`, and the existing checklist.
- Produces: `isParcelProject(value: unknown): value is ParcelProject` with complete runtime shape validation.

- [ ] Write tests that accept a generated project and reject an unsupported status and a missing evidence category.
- [ ] Run `npm test -- src/lib/project.test.ts` and confirm the two rejection cases fail against the old validator.
- [ ] Add recognized status/category sets and validate every top-level and evidence field by type.
- [ ] Run `npm test -- src/lib/project.test.ts` and confirm all validator tests pass.

### Task 2: Verified-evidence provenance

**Files:**
- Modify: `src/lib/analysis.test.ts`
- Modify: `src/lib/analysis.ts`

**Interfaces:**
- Consumes: existing `analyzeProject(project: ParcelProject): ProjectAnalysis`.
- Produces: deterministic agency/date findings and an evidence-complete gate requiring citation, custodian, and date.

- [ ] Add a test showing cited required evidence without agency/date remains `REVIEW REQUIRED`.
- [ ] Run `npm test -- src/lib/analysis.test.ts` and confirm it fails because the old gate returns `EVIDENCE COMPLETE`.
- [ ] Add `agency-*` and `date-*` attention findings for verified records missing provenance.
- [ ] Extend the traceability gate to require citation, nonblank agency, and record date.
- [ ] Update the existing completion fixture to supply all three provenance fields.
- [ ] Run `npm test -- src/lib/analysis.test.ts` and confirm all analysis tests pass.

### Task 3: Reproducible toolchain

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces canonical scripts `test`, `build`, and `check`, plus the Node engine floor.

- [ ] Replace every `latest` direct dependency with the exact installed version.
- [ ] Add `description`, `license`, `engines.node`, and `check` metadata.
- [ ] Update the lockfile root package dependency declarations to the identical exact versions.
- [ ] Run `npm ci` to verify lockfile consistency.

### Task 4: Release infrastructure and documentation

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `vercel.json`
- Create: `README.md`
- Create: `LICENSE`
- Create: `SECURITY.md`
- Create: `docs/PRIVACY_AND_LIMITATIONS.md`
- Create: `docs/HUMBOLDT_OFFICIAL_SOURCES.md`

**Interfaces:**
- CI consumes `npm ci`, `npm test`, and `npm run build`.
- Vercel consumes the Vite build and publishes `dist/`.

- [ ] Add Node 22 CI for pull requests and pushes to `main`.
- [ ] Add static Vite hosting configuration with security headers.
- [ ] Document installation, workflow, exports, deployment, and evidence boundaries.
- [ ] Add MIT licensing and private security-report guidance.
- [ ] Document browser-local privacy behavior and professional-review limitations.
- [ ] Add an official-source directory limited to authoritative county/state/federal sources and explicit manual-verification warnings.

### Task 5: Full verification and pull-request handoff

**Files:**
- Modify: pull request #1 metadata only.

- [ ] Run `npm test` and confirm all test files pass with zero failures.
- [ ] Run `npm run build` and confirm the production build exits zero.
- [ ] Confirm the branch CI run completes successfully.
- [ ] Compare `main...agent/initial-parcelproof-mvp` and review every changed file for scope.
- [ ] Update PR #1 with release contents, verification evidence, known limitations, and the one remaining external step: connecting a production hosting account/domain.
- [ ] Mark PR #1 ready for review only after all checks are green.