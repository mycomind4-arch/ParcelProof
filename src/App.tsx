import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileDown,
  FileSearch,
  FolderOpen,
  Gauge,
  Import,
  Landmark,
  MapPinned,
  Menu,
  Plus,
  Printer,
  Save,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import { analyzeProject } from './lib/analysis'
import { downloadText, filenameFor, toMarkdown } from './lib/export'
import { createProject, isParcelProject } from './lib/project'
import type { EvidenceItem, EvidenceStatus, ParcelProject } from './types'

const STORAGE_KEY = 'parcelproof.projects.v1'

type View = 'overview' | 'facts' | 'evidence' | 'findings' | 'report'

const nav: Array<{ id: View; label: string; icon: typeof Gauge }> = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'facts', label: 'Parcel facts', icon: MapPinned },
  { id: 'evidence', label: 'Evidence register', icon: FileSearch },
  { id: 'findings', label: 'Findings', icon: AlertTriangle },
  { id: 'report', label: 'Proof report', icon: FileCheck2 },
]

const statuses: Array<{ value: EvidenceStatus; label: string }> = [
  { value: 'not-started', label: 'Not started' },
  { value: 'requested', label: 'Requested' },
  { value: 'verified', label: 'Verified' },
  { value: 'missing', label: 'Unavailable' },
  { value: 'conflict', label: 'Conflict' },
]

function loadProjects(): ParcelProject[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(isParcelProject) : []
  } catch {
    return []
  }
}

function NewProjectDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (project: ParcelProject) => void }) {
  const [form, setForm] = useState({ name: '', address: '', apn: '', jurisdiction: 'Humboldt County, California' })
  const canCreate = Boolean(form.name.trim() && (form.address.trim() || form.apn.trim()) && form.jurisdiction.trim())

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title">
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        <div className="modal-icon"><MapPinned size={26} /></div>
        <h2 id="new-project-title">Start a parcel review</h2>
        <p>Create an empty evidence file. ParcelProof will not assume or invent facts about the property.</p>
        <div className="form-grid">
          <label className="field full"><span>Project name</span><input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Murray Road acquisition" /></label>
          <label className="field full"><span>Street address</span><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Property street address" /></label>
          <label className="field"><span>Assessor parcel number</span><input value={form.apn} onChange={(e) => setForm({ ...form, apn: e.target.value })} placeholder="APN" /></label>
          <label className="field"><span>Jurisdiction</span><input value={form.jurisdiction} onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} /></label>
        </div>
        <div className="modal-actions">
          <button className="button secondary" onClick={onClose}>Cancel</button>
          <button className="button primary" disabled={!canCreate} onClick={() => onCreate(createProject({ ...form, name: form.name.trim() }))}>Create evidence file <ArrowRight size={16} /></button>
        </div>
      </section>
    </div>
  )
}

function EvidenceEditor({ item, onChange }: { item: EvidenceItem; onChange: (item: EvidenceItem) => void }) {
  const [expanded, setExpanded] = useState(false)
  const patch = (values: Partial<EvidenceItem>) => onChange({ ...item, ...values, updatedAt: new Date().toISOString() })

  return (
    <article className={`evidence-item ${expanded ? 'expanded' : ''}`}>
      <button className="evidence-summary" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
        <span className={`status-dot ${item.status}`}><CircleDot size={16} /></span>
        <span className="evidence-copy"><strong>{item.title}</strong><small>{item.purpose}</small></span>
        {item.required && <span className="required-label">Required</span>}
        <span className={`status-label ${item.status}`}>{statuses.find((status) => status.value === item.status)?.label}</span>
        <ChevronRight className="chevron" size={18} />
      </button>
      {expanded && (
        <div className="evidence-detail">
          <div className="form-grid">
            <label className="field"><span>Evidence status</span><select value={item.status} onChange={(e) => patch({ status: e.target.value as EvidenceStatus })}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
            <label className="field"><span>Responsible agency or source</span><input value={item.agency} onChange={(e) => patch({ agency: e.target.value })} placeholder="Agency, office, or custodian" /></label>
            <label className="field full"><span>Source URL</span><input type="url" value={item.sourceUrl} onChange={(e) => patch({ sourceUrl: e.target.value })} placeholder="https:// official source or document URL" /></label>
            <label className="field"><span>Reference / instrument number</span><input value={item.referenceNumber} onChange={(e) => patch({ referenceNumber: e.target.value })} placeholder="Document, case, or permit number" /></label>
            <label className="field"><span>Record date</span><input type="date" value={item.recordDate} onChange={(e) => patch({ recordDate: e.target.value })} /></label>
            <label className="field full"><span>Evidence notes</span><textarea value={item.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Record what this source proves, what it does not prove, and any conflict requiring follow-up." /></label>
          </div>
        </div>
      )}
    </article>
  )
}

function ScoreRing({ value }: { value: number }) {
  return <div className="score-ring" style={{ '--score': `${value * 3.6}deg` } as React.CSSProperties}><div><strong>{value}%</strong><span>complete</span></div></div>
}

export default function App() {
  const [projects, setProjects] = useState<ParcelProject[]>(loadProjects)
  const [activeId, setActiveId] = useState(() => loadProjects()[0]?.id || '')
  const [view, setView] = useState<View>('overview')
  const [showNew, setShowNew] = useState(() => loadProjects().length === 0)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [saved, setSaved] = useState(true)
  const importRef = useRef<HTMLInputElement>(null)
  const project = projects.find((item) => item.id === activeId) || projects[0]
  const analysis = useMemo(() => project ? analyzeProject(project) : null, [project])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
    setSaved(true)
  }, [projects])

  const updateProject = (patch: Partial<ParcelProject>) => {
    if (!project) return
    setSaved(false)
    setProjects((items) => items.map((item) => item.id === project.id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item))
  }

  const updateEvidence = (next: EvidenceItem) => updateProject({ evidence: project.evidence.map((item) => item.id === next.id ? next : item) })

  const addProject = (next: ParcelProject) => {
    setProjects((items) => [next, ...items])
    setActiveId(next.id)
    setView('overview')
    setShowNew(false)
  }

  const importProject = async (file?: File) => {
    if (!file) return
    try {
      const value: unknown = JSON.parse(await file.text())
      if (!isParcelProject(value)) throw new Error('Invalid ParcelProof project')
      const next = { ...value, id: globalThis.crypto.randomUUID(), updatedAt: new Date().toISOString() }
      addProject(next)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'The selected file is not a valid ParcelProof export.')
    }
  }

  if (!project || !analysis) {
    return (
      <main className="empty-shell">
        <div className="empty-brand"><ShieldCheck size={30} /><span>ParcelProof</span></div>
        <section className="empty-state">
          <div className="empty-visual"><Landmark size={54} /><span className="scan-line" /></div>
          <h1>Build the parcel record before you trust it.</h1>
          <p>Organize deeds, zoning, permits, enforcement, access, taxes, utilities, and hazards into one traceable evidence file.</p>
          <button className="button primary large" onClick={() => setShowNew(true)}><Plus size={18} /> Start a parcel review</button>
          <button className="text-button" onClick={() => importRef.current?.click()}><Import size={16} /> Import a ParcelProof file</button>
          <p className="privacy-note"><ShieldCheck size={15} /> Your work stays in this browser unless you export it.</p>
        </section>
        <input ref={importRef} hidden type="file" accept="application/json,.json" onChange={(e) => importProject(e.target.files?.[0])} />
        {showNew && <NewProjectDialog onClose={() => setShowNew(false)} onCreate={addProject} />}
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${showMobileNav ? 'mobile-open' : ''}`}>
        <div className="brand"><ShieldCheck size={26} /><span>ParcelProof</span><button className="icon-button mobile-only" onClick={() => setShowMobileNav(false)}><X size={18} /></button></div>
        <div className="project-switcher">
          <span>ACTIVE FILE</span>
          <select value={project.id} onChange={(e) => { setActiveId(e.target.value); setView('overview') }}>
            {projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button onClick={() => setShowNew(true)}><Plus size={15} /> New parcel review</button>
        </div>
        <nav>
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} className={view === id ? 'active' : ''} onClick={() => { setView(id); setShowMobileNav(false) }}><Icon size={18} /><span>{label}</span>{id === 'findings' && <b>{analysis.findings.filter((finding) => finding.severity !== 'clear').length}</b>}</button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span><ShieldCheck size={16} /> Local-first workspace</span>
          <small>Evidence, not assumptions.</small>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setShowMobileNav(true)}><Menu size={20} /></button>
          <div><span className="breadcrumb">PARCEL REVIEW / {view.replace('-', ' ').toUpperCase()}</span><h1>{project.name}</h1></div>
          <div className="top-actions"><span className="save-state"><Save size={14} /> {saved ? 'Saved locally' : 'Saving…'}</span><button className="button secondary compact" onClick={() => { downloadText(filenameFor(project, 'json'), JSON.stringify(project, null, 2), 'application/json') }}><Download size={16} /> Export</button></div>
        </header>

        <div className="content">
          {view === 'overview' && (
            <section>
              <div className="hero-row">
                <div><span className={`decision ${analysis.decision.toLowerCase().replaceAll(' ', '-')}`}>{analysis.decision}</span><h2>What can the current record prove?</h2><p>ParcelProof scores evidence coverage—not whether a property is “good.” Resolve missing and conflicting records before relying on the report.</p></div>
                <ScoreRing value={analysis.completeness} />
              </div>
              <div className="metric-strip">
                <div><strong>{analysis.verified}</strong><span>Verified sources</span></div>
                <div><strong>{project.evidence.filter((item) => item.status === 'requested').length}</strong><span>Records requested</span></div>
                <div><strong>{analysis.findings.filter((item) => item.severity === 'critical').length}</strong><span>Critical gaps</span></div>
                <div><strong>{project.evidence.filter((item) => item.sourceUrl || item.referenceNumber).length}</strong><span>Traceable citations</span></div>
              </div>
              <div className="section-heading"><div><h3>Evidence progress</h3><p>Ten record categories create a reproducible parcel file.</p></div><button className="text-button" onClick={() => setView('evidence')}>Open register <ArrowRight size={15} /></button></div>
              <div className="progress-list">
                {project.evidence.map((item) => <button key={item.id} onClick={() => setView('evidence')}><span className={`status-dot ${item.status}`}><CircleDot size={15} /></span><span><strong>{item.title}</strong><small>{item.required ? 'Required evidence' : 'Supporting evidence'}</small></span><span className={`status-label ${item.status}`}>{statuses.find((status) => status.value === item.status)?.label}</span><ChevronRight size={17} /></button>)}
              </div>
            </section>
          )}

          {view === 'facts' && (
            <section className="narrow-section">
              <div className="page-intro"><div className="page-icon"><MapPinned size={24} /></div><div><h2>Parcel facts</h2><p>Record only facts you can tie to a source. Leave unknown fields empty.</p></div></div>
              <div className="form-surface form-grid">
                <label className="field full"><span>Project name</span><input value={project.name} onChange={(e) => updateProject({ name: e.target.value })} /></label>
                <label className="field full"><span>Property address</span><input value={project.address} onChange={(e) => updateProject({ address: e.target.value })} /></label>
                <label className="field"><span>Assessor parcel number</span><input value={project.apn} onChange={(e) => updateProject({ apn: e.target.value })} /></label>
                <label className="field"><span>Jurisdiction</span><input value={project.jurisdiction} onChange={(e) => updateProject({ jurisdiction: e.target.value })} /></label>
                <label className="field"><span>Property type</span><input value={project.propertyType} onChange={(e) => updateProject({ propertyType: e.target.value })} placeholder="Only if verified" /></label>
                <label className="field"><span>Intended use under review</span><input value={project.intendedUse} onChange={(e) => updateProject({ intendedUse: e.target.value })} placeholder="Purchase, build, finance, insure…" /></label>
                <label className="field full"><span>Analyst notes</span><textarea value={project.analystNotes} onChange={(e) => updateProject({ analystNotes: e.target.value })} placeholder="Context, questions, and scope limits for this review." /></label>
              </div>
            </section>
          )}

          {view === 'evidence' && (
            <section>
              <div className="page-intro"><div className="page-icon"><FileSearch size={24} /></div><div><h2>Evidence register</h2><p>Capture the custodian, citation, date, and conclusion for each official record.</p></div></div>
              <div className="evidence-list">{project.evidence.map((item) => <EvidenceEditor key={item.id} item={item} onChange={updateEvidence} />)}</div>
            </section>
          )}

          {view === 'findings' && (
            <section>
              <div className="page-intro"><div className="page-icon"><ClipboardCheck size={24} /></div><div><h2>Findings</h2><p>Deterministic flags based on evidence status and citation coverage.</p></div></div>
              <div className="findings-list">
                {analysis.findings.map((finding) => <article key={finding.id} className={`finding ${finding.severity}`}><span>{finding.severity === 'critical' ? <AlertTriangle size={20} /> : finding.severity === 'clear' ? <Check size={20} /> : <Search size={20} />}</span><div><small>{finding.severity}</small><h3>{finding.title}</h3><p>{finding.detail}</p></div></article>)}
              </div>
            </section>
          )}

          {view === 'report' && (
            <section>
              <div className="report-toolbar"><div><h2>ParcelProof report</h2><p>A portable evidence summary for review—not a title opinion.</p></div><div><button className="button secondary" onClick={() => window.print()}><Printer size={16} /> Print</button><button className="button primary" onClick={() => downloadText(filenameFor(project, 'md'), toMarkdown(project), 'text/markdown')}><FileDown size={16} /> Download report</button></div></div>
              <article className="report-sheet">
                <header><div className="report-brand"><ShieldCheck size={24} /> ParcelProof</div><span>{new Date(project.updatedAt).toLocaleDateString()}</span></header>
                <div className="report-title"><span className={`decision ${analysis.decision.toLowerCase().replaceAll(' ', '-')}`}>{analysis.decision}</span><h1>{project.name}</h1><p>{[project.address, project.apn && `APN ${project.apn}`, project.jurisdiction].filter(Boolean).join(' · ')}</p></div>
                <div className="report-stats"><div><strong>{analysis.completeness}%</strong><span>Evidence completeness</span></div><div><strong>{analysis.verified}/{analysis.total}</strong><span>Verified categories</span></div><div><strong>{analysis.findings.filter((item) => item.severity === 'critical').length}</strong><span>Critical gaps</span></div></div>
                <h2>Evidence register</h2>
                <table><thead><tr><th>Record</th><th>Status</th><th>Custodian / citation</th></tr></thead><tbody>{project.evidence.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.purpose}</small></td><td><span className={`status-label ${item.status}`}>{statuses.find((status) => status.value === item.status)?.label}</span></td><td>{[item.agency, item.referenceNumber, item.recordDate].filter(Boolean).join(' · ') || 'No citation recorded'}</td></tr>)}</tbody></table>
                <h2>Material findings</h2>
                <ul className="report-findings">{analysis.findings.map((finding) => <li key={finding.id}><strong>{finding.title}</strong><span>{finding.detail}</span></li>)}</ul>
                <footer>ParcelProof organizes cited evidence. It is not legal, title, survey, engineering, or environmental advice.</footer>
              </article>
            </section>
          )}
        </div>
      </main>
      <input ref={importRef} hidden type="file" accept="application/json,.json" onChange={(e) => importProject(e.target.files?.[0])} />
      {showNew && <NewProjectDialog onClose={() => setShowNew(false)} onCreate={addProject} />}
    </div>
  )
}
