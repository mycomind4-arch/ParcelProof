import { describe, expect, it } from 'vitest'
import { createProject, isParcelProject } from './project'

describe('isParcelProject', () => {
  it('accepts a complete ParcelProof export', () => {
    const project = createProject({ name: 'Test', address: '', apn: '123', jurisdiction: 'Test County' })
    expect(isParcelProject(project)).toBe(true)
  })

  it('rejects an export with an unsupported evidence status', () => {
    const project = createProject({ name: 'Test', address: '', apn: '123', jurisdiction: 'Test County' })
    const invalid = structuredClone(project) as unknown as { evidence: Array<{ status: string }> }
    invalid.evidence[0].status = 'approved'
    expect(isParcelProject(invalid)).toBe(false)
  })

  it('rejects an export missing required evidence fields', () => {
    const project = createProject({ name: 'Test', address: '', apn: '123', jurisdiction: 'Test County' })
    const invalid = structuredClone(project) as unknown as { evidence: Array<Record<string, unknown>> }
    delete invalid.evidence[0].category
    expect(isParcelProject(invalid)).toBe(false)
  })
})