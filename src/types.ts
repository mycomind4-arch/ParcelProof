export type EvidenceStatus = 'not-started' | 'requested' | 'verified' | 'missing' | 'conflict'

export type EvidenceCategory =
  | 'identity'
  | 'ownership'
  | 'legal-description'
  | 'zoning'
  | 'permits'
  | 'code-enforcement'
  | 'taxes'
  | 'access'
  | 'utilities'
  | 'hazards'

export interface EvidenceItem {
  id: string
  category: EvidenceCategory
  title: string
  purpose: string
  status: EvidenceStatus
  agency: string
  sourceUrl: string
  referenceNumber: string
  recordDate: string
  notes: string
  required: boolean
  updatedAt: string
}

export interface ParcelProject {
  id: string
  name: string
  address: string
  apn: string
  jurisdiction: string
  propertyType: string
  intendedUse: string
  analystNotes: string
  createdAt: string
  updatedAt: string
  evidence: EvidenceItem[]
}

export type FindingSeverity = 'clear' | 'attention' | 'critical'

export interface Finding {
  id: string
  severity: FindingSeverity
  title: string
  detail: string
  category?: EvidenceCategory
}

export interface ProjectAnalysis {
  completeness: number
  verified: number
  total: number
  findings: Finding[]
  decision: 'INSUFFICIENT EVIDENCE' | 'REVIEW REQUIRED' | 'EVIDENCE COMPLETE'
}
