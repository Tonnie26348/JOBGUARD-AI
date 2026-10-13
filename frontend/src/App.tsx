import { useState, type FormEvent } from 'react'
import { Activity, AlertOctagon, ArrowRight, BadgeCheck, BriefcaseBusiness, CheckCircle2, ChevronDown, CircleHelp, FileSearch, Fingerprint, LoaderCircle, RotateCcw, Shield, ShieldAlert, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react'

type FormValues = { title: string; description: string; requirements: string; company_profile: string; benefits: string }
type Result = { model_name: string; risk_score: number; threshold: number; label: string; level: 'higher' | 'lower'; summary: string; checked_fields: string[]; disclaimer: string }
const emptyForm: FormValues = { title: '', description: '', requirements: '', company_profile: '', benefits: '' }
const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

function App() {
  const [form, setForm] = useState<FormValues>(emptyForm)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOptional, setShowOptional] = useState(true)
  const wordCount = [form.title, form.description, form.requirements, form.company_profile, form.benefits].join(' ').trim().split(/\s+/).filter(Boolean).length

  const update = (key: keyof FormValues, value: string) => setForm(previous => ({ ...previous, [key]: value }))
  const reset = () => { setForm(emptyForm); setResult(null); setError('') }
  const useSample = () => {
    setForm({
      title: 'Remote Data Entry Assistant — Immediate Start',
      description: 'Earn a high weekly income working from home. No experience required and all applicants are welcome. Successful candidates must pay a refundable onboarding and equipment registration fee before receiving their contract. Apply immediately by sending your personal details through this message.',
      requirements: 'Must be available immediately. No interview needed.',
      company_profile: '',
      benefits: 'Flexible hours, fast payment, work from anywhere.'
    })
    setResult(null); setError('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setResult(null)
    if (!form.title.trim() && !form.description.trim()) { setError('Add at least a job title or job description to continue.'); return }
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'The advertisement could not be checked. Please try again.')
      setResult(data as Result)
      window.setTimeout(() => document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
    } catch (err) {
      setError(err instanceof Error && err.message.includes('Failed to fetch')
        ? 'Cannot connect to the JOBGUARD AI API. Start the FastAPI backend on port 8000, then try again.'
        : err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  const percentage = result ? Math.round(result.risk_score * 100) : 0
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="JOBGUARD AI home"><span className="brand-mark"><ShieldCheck size={23} strokeWidth={2.2} /></span><span>JOBGUARD<span className="brand-ai"> AI</span><small>CAREER SAFETY INTELLIGENCE</small></span></a>
      <nav className="topnav"><a href="#how-it-works">How it works</a><a href="#safety">Safety guide</a><span className="prototype-pill"><span /> ML PROTOTYPE</span></nav>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={14} /> SMARTER JOB SEARCHES START HERE</div>
          <h1>Opportunity should feel exciting.<br /><span>Not suspicious.</span></h1>
          <p className="hero-subtitle">Screen a job advertisement for potential recruitment scam risk before you share personal information, commit your time, or send money.</p>
          <div className="hero-trust"><span><Shield size={17} /> AI-assisted screening</span><span><Fingerprint size={17} /> Your text isn't stored by this demo</span></div>
        </div>
        <div className="hero-visual" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="shield-illustration"><ShieldCheck size={92} strokeWidth={1.15}/></div><div className="floating-card card-top"><span className="mini-icon"><FileSearch size={17}/></span><span><b>Job details</b><small>Text pattern analysis</small></span><CheckCircle2 className="tiny-check" size={18}/></div><div className="floating-card card-bottom"><span className="status-dot"/><span><b>Risk screening</b><small>Review before you respond</small></span></div><div className="visual-glow"/></div>
      </section>

      <section className="workspace" aria-label="Job advertisement screening">
        <div className="section-heading"><div><span className="section-kicker">THE SCREENING TOOL</span><h2>Check a job advertisement</h2><p>Paste the information you have. The more relevant text you provide, the more context the model can assess.</p></div><div className="step-chip"><span>01</span> Enter details <ArrowRight size={14}/><span>02</span> Review result</div></div>
        <div className="work-grid">
          <form className="form-card" onSubmit={submit}>
            <div className="form-card-head"><div className="head-icon"><BriefcaseBusiness size={20}/></div><div><h3>Job details</h3><p>Required fields are marked with an asterisk.</p></div><button type="button" className="text-button sample-button" onClick={useSample}>Try sample ad <ArrowRight size={14}/></button></div>
            <label className="field-label" htmlFor="title">Job title <span>*</span></label>
            <input id="title" value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Customer Support Representative" maxLength={500} />
            <div className="label-row"><label className="field-label" htmlFor="description">Job description <span>*</span></label><span className="field-hint">Most useful field</span></div>
            <textarea id="description" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Paste the full job post here, including pay, application instructions, and any requests for payment or personal information…" rows={7} maxLength={30000}/>
            <button type="button" className="optional-toggle" onClick={() => setShowOptional(v => !v)} aria-expanded={showOptional}><span><ChevronDown size={16} className={showOptional ? 'rotate' : ''}/> Additional information <small>(optional)</small></span><span>{showOptional ? 'Hide fields' : 'Show fields'}</span></button>
            {showOptional && <div className="optional-fields">
              <div className="field-block"><label className="field-label" htmlFor="company">Company profile</label><textarea id="company" value={form.company_profile} onChange={e => update('company_profile', e.target.value)} placeholder="What the company says about itself…" rows={3} maxLength={10000}/></div>
              <div className="field-block"><label className="field-label" htmlFor="requirements">Requirements</label><textarea id="requirements" value={form.requirements} onChange={e => update('requirements', e.target.value)} placeholder="Skills, qualifications, experience…" rows={3} maxLength={15000}/></div>
              <div className="field-block"><label className="field-label" htmlFor="benefits">Benefits and compensation</label><textarea id="benefits" value={form.benefits} onChange={e => update('benefits', e.target.value)} placeholder="Salary, benefits, allowances, fees mentioned…" rows={3} maxLength={10000}/></div>
            </div>}
            <div className="form-footer"><span className="word-counter">{wordCount.toLocaleString()} words entered</span><button className="primary-button" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={18}/> Screening…</> : <><ShieldCheck size={18}/> Screen this job <ArrowRight size={16}/></>}</button></div>
            {error && <div className="error-message" role="alert"><AlertOctagon size={18}/><span>{error}</span></div>}
            <p className="privacy-note"><Shield size={14}/> This prototype processes text for prediction and does not include a database or save submissions.</p>
          </form>

          <aside className="result-column" id="result-panel" aria-live="polite">
            {!result && !loading && <div className="result-placeholder"><div className="placeholder-icon"><Activity size={29}/></div><span className="section-kicker">YOUR SCREENING REPORT</span><h3>Your result will appear here</h3><p>Submit a job title or description to receive a model-based risk indicator and next steps.</p><div className="placeholder-list"><span><CheckCircle2 size={16}/> Risk indicator</span><span><CheckCircle2 size={16}/> Model score and threshold</span><span><CheckCircle2 size={16}/> Practical safety reminders</span></div><div className="placeholder-bottom"><CircleHelp size={16}/> No automated result can replace independent verification.</div></div>}
            {loading && <div className="result-placeholder loading-card"><LoaderCircle className="spin" size={34}/><h3>Reviewing the advertisement</h3><p>The saved machine-learning model is comparing the submitted text with patterns learned during training.</p></div>}
            {result && <div className={`result-card ${result.level}`}>
              <div className="result-topline"><span className="section-kicker">SCREENING REPORT</span><button className="icon-button" type="button" onClick={reset} aria-label="Clear result and start over"><RotateCcw size={17}/></button></div>
              <div className={`result-symbol ${result.level}`}>{result.level === 'higher' ? <ShieldAlert size={30}/> : <ShieldCheck size={30}/>}</div>
              <h3>{result.label}</h3><p className="result-summary">{result.summary}</p>
              <div className="score-block"><div className="score-label-row"><span>Model risk score</span><strong>{percentage}%</strong></div><div className="score-track"><div className="score-fill" style={{ width: `${percentage}%` }}/></div><div className="score-meta"><span>0%</span><span>Screening threshold: {Math.round(result.threshold * 100)}%</span><span>100%</span></div><p className="score-caveat">A model score, not a calibrated probability of fraud.</p></div>
              <div className="checked-fields"><span className="field-list-title">Information assessed</span><div className="field-tags">{result.checked_fields.map(field => <span key={field}>{field.replace('_', ' ')}</span>)}</div></div>
              <div className="result-next"><h4><TriangleAlert size={17}/> Before you proceed</h4><ul><li>Never pay an application, interview, training, or equipment fee to secure a job.</li><li>Verify the vacancy on the employer's official website and contact the company using independently sourced details.</li><li>Be cautious with requests for ID documents, bank details, passwords, or one-time codes before verifying the employer.</li></ul></div>
              <p className="result-disclaimer">{result.disclaimer}</p><div className="model-footnote"><BadgeCheck size={15}/> {result.model_name} <span>•</span> text-based ML model</div>
              <button className="secondary-button full-width" type="button" onClick={reset}>Check another advertisement <ArrowRight size={16}/></button>
            </div>}
            <div className="safety-callout"><div className="callout-icon"><ShieldCheck size={19}/></div><div><b>Stay in control of your search</b><p>When in doubt, pause and verify. A legitimate employer should not pressure you to pay for a job offer.</p><a href="#safety">View the safety checklist <ArrowRight size={14}/></a></div></div>
          </aside>
        </div>
      </section>

      <section className="how-section" id="how-it-works"><div className="section-heading centered"><span className="section-kicker">BUILT ON MACHINE LEARNING</span><h2>Simple steps. More informed decisions.</h2><p>JOBGUARD AI is an academic prototype designed to demonstrate supervised text classification.</p></div><div className="process-grid"><article><div className="process-icon"><FileSearch size={22}/></div><span className="process-number">STEP 01</span><h3>Provide the job text</h3><p>Enter a title, description, requirements, company profile, or benefits from the advertisement.</p></article><article><div className="process-icon"><Activity size={22}/></div><span className="process-number">STEP 02</span><h3>Model analyses patterns</h3><p>The saved TF-IDF and Logistic Regression pipeline converts the text into features and estimates a fraud-risk score.</p></article><article><div className="process-icon"><ShieldCheck size={22}/></div><span className="process-number">STEP 03</span><h3>Review and verify</h3><p>Use the result as a prompt for further checks—not as a final verdict on a company or recruiter.</p></article></div></section>

      <section className="safety-section" id="safety"><div className="safety-heading"><div className="safety-icon"><ShieldCheck size={26}/></div><div><span className="section-kicker">YOUR SAFETY CHECKLIST</span><h2>Four checks worth making every time</h2></div></div><div className="safety-grid"><div><span>01</span><b>Check the source</b><p>Find the vacancy on the employer's official careers page.</p></div><div><span>02</span><b>Verify the contact</b><p>Check the sender's email domain and independently confirm the recruiter.</p></div><div><span>03</span><b>Reject pay-to-work demands</b><p>Be wary of fees for applications, interviews, training, or equipment.</p></div><div><span>04</span><b>Protect your information</b><p>Do not share passwords, one-time codes, or sensitive documents prematurely.</p></div></div><p className="scope-note"><CircleHelp size={15}/> Dataset scope: the model was trained on historical, international job-posting data. It has not been independently validated for current Kenyan recruitment scams.</p></section>
    </main>
    <footer><a className="brand footer-brand" href="#top"><span className="brand-mark"><ShieldCheck size={19}/></span><span>JOBGUARD<span className="brand-ai"> AI</span><small>CAREER SAFETY INTELLIGENCE</small></span></a><p>Academic machine-learning prototype · Not a fraud verdict</p><span className="footer-version">VERSION 1.0.0</span></footer>
  </div>
}

export default App
