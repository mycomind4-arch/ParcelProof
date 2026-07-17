import type { Finding, ParcelProject, ProjectAnalysis } from '../types'

const statusWeight = {
  'not-started': 0,
  requested: 0.35,
  verified: 1,
  missing: 0,
  conflict: 0,
} as const

export function analyzeProject(project: ParcelProject): ProjectAnalysis {
  const total = project.evidence.length
  const verified = project.evidence.filter((item) => item.status === 'verified').length
  const weighted = project.evidence.reduce((sum, item) => sum + statusWeight[item.status], 0)
  const completeness = total ? Math.round((weighted / total) * 100 + 1e-9) : 0
  const findings: Finding[] = []

  project.evidence.forEach((item) => {
    if (item.status === 'conflict') {
      findings.push({
        id: `conflict-${item.id}`,
        severity: 'critical',
        title: `Conflicting ${item.title.toLowerCase()}`,
        detail: item.notes.trim() || 'The collected records disagree. Document the conflict before relying on this category.',
        category: item.category,
      })
    } else if (item.status === 'missing' && item.required) {
      findings.push({
        id: `missing-${item.id}`,
        severity: 'critical',
        title: `Required record unavailable: ${item.title}`,
        detail: item.notes.trim() || 'A required source could not be obtained, leaving a material evidence gap.',
        category: item.category,
      })
    } else if (item.status !== 'verified' && item.required) {
      findings.push({
        id: `pending-${item.id}`,
        severity: 'attention',
        title: `${item.title} is not verified`,
        detail: item.status === 'requested' ? 'The record has been requested but not reviewed.' : 'Collect and review this record before making a parcel decision.',
        category: item.category,
      })
    }

    if (item.status === 'verified' && !item.sourceUrl && !item.referenceNumber) {
      findings.push({
        id: `trace-${item.id}`,
        severity: 'attention',
        title: `${item.title} needs a traceable citation`,
        detail: 'Add a source URL or official reference number so another reviewer can reproduce the finding.',
        category: item.category,
      })
    }
  })

  const critical = findings.some((finding) => finding.severity === 'critical')
  const requiredComplete = project.evidence.filter((item) => item.required).every((item) => item.status === 'verified')
  const traceable = project.evidence.filter((item) => item.status === 'verified').every((item) => item.sourceUrl || item.referenceNumber)

  let decision: ProjectAnalysis['decision'] = 'INSUFFICIENT EVIDENCE'
  if (!critical && completeness >= 65) decision = 'REVIEW REQUIRED'
  if (requiredComplete && traceable && !critical) decision = 'EVIDENCE COMPLETE'

  if (findings.length === 0) {
    findings.push({
      id: 'clear',
      severity: 'clear',
      title: 'No unresolved evidence gaps',
      detail: 'All required categories are verified and traceable to a cited source.',
    })
  }

  return { completeness, verified, total, findings, decision }
}
