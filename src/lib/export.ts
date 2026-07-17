import { analyzeProject } from './analysis'
import type { ParcelProject } from '../types'

const safe = (value: string) => value.trim() || 'Not provided'

export function toMarkdown(project: ParcelProject): string {
  const analysis = analyzeProject(project)
  const evidence = project.evidence.map((item) => [
    `### ${item.title}`,
    `- Status: ${item.status}`,
    `- Agency: ${safe(item.agency)}`,
    `- Record date: ${safe(item.recordDate)}`,
    `- Reference: ${safe(item.referenceNumber)}`,
    `- Source: ${safe(item.sourceUrl)}`,
    `- Notes: ${safe(item.notes)}`,
  ].join('\n')).join('\n\n')

  const findings = analysis.findings.map((finding) => `- **${finding.severity.toUpperCase()} — ${finding.title}:** ${finding.detail}`).join('\n')

  return `# ParcelProof Evidence Report\n\nGenerated: ${new Date().toLocaleString()}\n\n## Parcel\n\n- Project: ${safe(project.name)}\n- Address: ${safe(project.address)}\n- APN: ${safe(project.apn)}\n- Jurisdiction: ${safe(project.jurisdiction)}\n- Property type: ${safe(project.propertyType)}\n- Intended use: ${safe(project.intendedUse)}\n\n## Evidence posture\n\n- Decision: **${analysis.decision}**\n- Completeness: ${analysis.completeness}%\n- Verified categories: ${analysis.verified} of ${analysis.total}\n\n## Findings\n\n${findings}\n\n## Evidence register\n\n${evidence}\n\n## Analyst notes\n\n${safe(project.analystNotes)}\n\n---\nParcelProof organizes cited evidence; it does not provide legal, title, survey, engineering, or environmental advice. Verify material decisions with qualified professionals and the responsible agencies.\n`
}

export function downloadText(filename: string, content: string, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function filenameFor(project: ParcelProject, extension: string) {
  const base = (project.apn || project.name || 'parcel-report').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${base || 'parcel-report'}.${extension}`
}
