import type { EvidenceCategory, EvidenceItem, ParcelProject } from '../types'

const checklist: Array<{
  category: EvidenceCategory
  title: string
  purpose: string
  required: boolean
}> = [
  { category: 'identity', title: 'Assessor parcel record', purpose: 'Confirms the APN, situs address, acreage, and assessor identity.', required: true },
  { category: 'ownership', title: 'Current vesting deed', purpose: 'Establishes the recorded owner and vesting language.', required: true },
  { category: 'legal-description', title: 'Legal description and parcel map', purpose: 'Connects the deed description to a mapped parcel boundary.', required: true },
  { category: 'zoning', title: 'Zoning and land-use designation', purpose: 'Documents allowed uses, overlays, and development constraints.', required: true },
  { category: 'permits', title: 'Permit history', purpose: 'Identifies permitted structures, open permits, and final inspections.', required: true },
  { category: 'code-enforcement', title: 'Code-enforcement history', purpose: 'Finds notices, orders, liens, and unresolved cases.', required: true },
  { category: 'taxes', title: 'Property-tax status', purpose: 'Confirms assessed status, delinquencies, and tax-default risk.', required: true },
  { category: 'access', title: 'Legal and physical access', purpose: 'Documents public frontage, easements, and route continuity.', required: true },
  { category: 'utilities', title: 'Water, wastewater, and power', purpose: 'Separates available service from assumed service.', required: false },
  { category: 'hazards', title: 'Hazard and environmental overlays', purpose: 'Checks flood, fire, seismic, coastal, and habitat constraints.', required: false },
]

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`

export function createProject(input: Pick<ParcelProject, 'name' | 'address' | 'apn' | 'jurisdiction'>): ParcelProject {
  const now = new Date().toISOString()
  return {
    id: makeId(),
    ...input,
    propertyType: '',
    intendedUse: '',
    analystNotes: '',
    createdAt: now,
    updatedAt: now,
    evidence: checklist.map((item): EvidenceItem => ({
      id: makeId(),
      ...item,
      status: 'not-started',
      agency: '',
      sourceUrl: '',
      referenceNumber: '',
      recordDate: '',
      notes: '',
      updatedAt: now,
    })),
  }
}

export function isParcelProject(value: unknown): value is ParcelProject {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ParcelProject>
  return Boolean(
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.apn === 'string' &&
    Array.isArray(candidate.evidence) &&
    candidate.evidence.every((item) => item && typeof item.id === 'string' && typeof item.status === 'string'),
  )
}
