# Security Policy

## Supported versions

Security fixes are applied to the current `0.2.x` release line and the default branch after that release is merged.

## Reporting a vulnerability

Do not post an exploitable vulnerability, sensitive project export, or personal property record in a public issue.

Use GitHub's private vulnerability-reporting or security-advisory workflow when it is available for this repository. If that workflow is not available, contact the repository owner privately through their GitHub profile and provide:

- the affected commit or version;
- a concise description of the issue;
- reproduction steps using synthetic data;
- the expected security impact; and
- a proposed mitigation, when known.

Never include real confidential records, credentials, access tokens, financial-account data, Social Security numbers, or other regulated personal information in a report.

## Security model

ParcelProof 0.2 is a static browser application. It has no application server, user accounts, cloud database, or analytics service. Projects are stored in browser local storage until a user explicitly exports them.

This reduces server-side exposure but does not make the application a secure records repository. Anyone with access to the same unlocked browser profile may be able to read stored projects. Browser extensions, compromised devices, shared operating-system accounts, browser synchronization, backups, and host-level scripts may also affect confidentiality.

Deployments should:

- use HTTPS on a stable domain;
- preserve the response headers in `vercel.json` or equivalent controls;
- avoid third-party scripts and analytics unless the privacy model is deliberately revised;
- notify users before changing domains because local data does not migrate automatically; and
- instruct users to export important work and protect exported files appropriately.

## Sensitive-data boundary

ParcelProof is intended for public records and material the user is authorized to review. It is not approved for confidential legal files, protected health information, financial-account records, identity documents, criminal-justice records, child records, or other regulated data.