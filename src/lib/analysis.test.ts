import { describe, expect, it } from 'vitest'
import { analyzeProject } from './analysis'
import { createProject } from './project'

const newProject = () => createProject({ name: 'Test parcel', address: '', apn: '000-000-000', jurisdiction: 'Test County' })

describe('analyzeProject', () => {
  it('starts with insufficient evidence and no invented parcel facts', () => {
    const project = newProject()
    const result = analyzeProject(project)
    expect(result.decision).toBe('INSUFFICIENT EVIDENCE')
    expect(result.completeness).toBe(0)
    expect(project.evidence.every((item) => item.agency === '' && item.notes === '')).toBe(true)
  })

  it('counts requested records as partial progress', () => {
    const project = newProject()
    project.evidence[0].status = 'requested'
    expect(analyzeProject(project).completeness).toBe(4)
  })

  it('flags a conflict as critical', () => {
    const project = newProject()
    project.evidence[0].status = 'conflict'
    expect(analyzeProject(project).findings.some((finding) => finding.severity === 'critical')).toBe(true)
  })

  it('requires citations before declaring evidence complete', () => {
    const project = newProject()
    project.evidence.filter((item) => item.required).forEach((item) => { item.status = 'verified' })
    expect(analyzeProject(project).decision).toBe('REVIEW REQUIRED')

    project.evidence.filter((item) => item.required).forEach((item) => {
      item.referenceNumber = `REF-${item.id}`
      item.agency = 'County records office'
      item.recordDate = '2026-07-18'
    })
    expect(analyzeProject(project).decision).toBe('EVIDENCE COMPLETE')
  })

  it('requires custodian and record dates for required verified evidence', () => {
    const project = newProject()
    project.evidence.filter((item) => item.required).forEach((item) => {
      item.status = 'verified'
      item.referenceNumber = `REF-${item.id}`
    })

    const withoutProvenance = analyzeProject(project)
    expect(withoutProvenance.decision).toBe('REVIEW REQUIRED')
    expect(withoutProvenance.findings.some((finding) => finding.title.includes('needs a responsible source'))).toBe(true)
    expect(withoutProvenance.findings.some((finding) => finding.title.includes('needs a record date'))).toBe(true)

    project.evidence.filter((item) => item.required).forEach((item) => {
      item.agency = 'County records office'
      item.recordDate = '2026-07-18'
    })
    expect(analyzeProject(project).decision).toBe('EVIDENCE COMPLETE')
  })
})