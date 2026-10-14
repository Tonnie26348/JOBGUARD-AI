import { useState, useEffect, type FormEvent } from 'react'
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Copy,
  FileSearch,
  FileText,
  Gift,
  HelpCircle,
  Home,
  Info,
  ListChecks,
  LoaderCircle,
  Menu,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
  Zap,
} from 'lucide-react'

type Page = 'home' | 'screening' | 'how-it-works' | 'safety'

type FormValues = {
  title: string
  description: string
  requirements: string
  company_profile: string
  benefits: string
}

type Result = {
  model_name: string
  risk_score: number
  threshold: number
  label: string
  level: 'higher' | 'lower'
  summary: string
  checked_fields: string[]
  disclaimer: string
}

const emptyForm: FormValues = {
  title: '',
  description: '',
  requirements: '',
  company_profile: '',
  benefits: '',
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

const sampleSuspicious: FormValues = {
  title: 'Remote Data Entry Assistant — Immediate Start',
  description:
    'Earn $3,500 weekly working flexible hours from home. No prior experience or interview needed; all applicants accepted. Successful candidates must transfer a refundable $150 equipment delivery fee and onboarding registration fee prior to contract release. Message your private banking information to begin.',
  requirements: 'Must be available immediately. No resume or interview required.',
  company_profile: 'Global Data Solutions Direct',
  benefits: 'High daily payout, instant wire transfers, work from anywhere.',
}

const sampleLegit: FormValues = {
  title: 'Senior Frontend Engineer (React & TypeScript)',
  description:
    'Apex Financial Technologies is seeking a Senior Frontend Engineer to build robust web applications. You will collaborate with cross-functional teams to design, develop, and maintain performant user interfaces with modern React, TypeScript, and REST APIs. We never ask candidates for application fees.',
  requirements:
    '4+ years of professional React experience. Strong grasp of TypeScript, state management, automated testing, and web accessibility standards.',
  company_profile:
    'Apex Financial Technologies is an enterprise fintech software provider established in 2019, headquartered in New York.',
  benefits:
    'Comprehensive healthcare, 401(k) matching, 25 days paid annual leave, and dedicated continuous learning budget.',
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [form, setForm] = useState<FormValues>(emptyForm)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOptional, setShowOptional] = useState(false)
  const [copied, setCopied] = useState(false)

  // Sync state with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'home' || hash === 'screening' || hash === 'how-it-works' || hash === 'safety') {
        setCurrentPage(hash as Page)
      }
    }

    if (window.location.hash) {
      handleHashChange()
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigateTo = (page: Page) => {
    setCurrentPage(page)
    window.location.hash = page
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const wordCount = [form.title, form.description, form.requirements, form.company_profile, form.benefits]
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  const filledOptionalCount = [form.company_profile, form.requirements, form.benefits].filter(
    (field) => field.trim().length > 0
  ).length

  const update = (key: keyof FormValues, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const reset = () => {
    setForm(emptyForm)
    setResult(null)
    setError('')
  }

  const loadSample = (sample: FormValues) => {
    setForm(sample)
    setResult(null)
    setError('')
    setShowOptional(true)
    navigateTo('screening')
  }

  const copyResult = () => {
    if (!result) return
    const text = `JOBGUARD AI Screening Result:
Status: ${result.label}
Model Risk Score: ${Math.round(result.risk_score * 100)}% (Threshold: ${Math.round(result.threshold * 100)}%)
Assessment: ${result.summary}
Model: ${result.model_name}`

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setResult(null)

    if (!form.title.trim() && !form.description.trim()) {
      setError('Please provide at least a Job Title or Job Description to begin screening.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : 'The job advertisement could not be verified. Please check inputs and try again.'
        )
      }
      setResult(data as Result)
      window.setTimeout(() => {
        document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes('Failed to fetch')
          ? 'Cannot connect to the JOBGUARD AI API. Please verify the FastAPI backend server is running on port 8000.'
          : err instanceof Error
            ? err.message
            : 'An unexpected error occurred. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const percentage = result ? Math.round(result.risk_score * 100) : 0
  const thresholdPercentage = result ? Math.round(result.threshold * 100) : 0

  return (
    <div className="app-shell">
      {/* Top Navigation */}
      <header className="topbar">
        <div className="topbar-container">
          <button
            type="button"
            className="brand brand-btn"
            onClick={() => navigateTo('home')}
            aria-label="Go to JOBGUARD AI Home"
          >
            <span className="brand-mark">
              <ShieldCheck size={22} strokeWidth={2.4} />
            </span>
            <div className="brand-text">
              <span className="brand-name">
                JOBGUARD<span className="brand-ai"> AI</span>
              </span>
              <span className="brand-tagline">INTELLIGENT CAREER SAFETY</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="topnav">
            <button
              type="button"
              className={`nav-link-btn ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              <Home size={15} />
              <span>Home</span>
            </button>
            <button
              type="button"
              className={`nav-link-btn ${currentPage === 'screening' ? 'active' : ''}`}
              onClick={() => navigateTo('screening')}
            >
              <FileSearch size={15} />
              <span>Screening Tool</span>
            </button>
            <button
              type="button"
              className={`nav-link-btn ${currentPage === 'how-it-works' ? 'active' : ''}`}
              onClick={() => navigateTo('how-it-works')}
            >
              <Activity size={15} />
              <span>How It Works</span>
            </button>
            <button
              type="button"
              className={`nav-link-btn ${currentPage === 'safety' ? 'active' : ''}`}
              onClick={() => navigateTo('safety')}
            >
              <ListChecks size={15} />
              <span>Safety Checklist</span>
            </button>

            <div className="prototype-pill">
              <span className="pill-dot" />
              <span>ACTIVE MODEL v1.0</span>
            </div>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <nav className="mobile-nav-menu">
            <button
              type="button"
              className={`mobile-nav-item ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              <Home size={18} />
              <span>Home</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-item ${currentPage === 'screening' ? 'active' : ''}`}
              onClick={() => navigateTo('screening')}
            >
              <FileSearch size={18} />
              <span>Screening Tool</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-item ${currentPage === 'how-it-works' ? 'active' : ''}`}
              onClick={() => navigateTo('how-it-works')}
            >
              <Activity size={18} />
              <span>How It Works</span>
            </button>
            <button
              type="button"
              className={`mobile-nav-item ${currentPage === 'safety' ? 'active' : ''}`}
              onClick={() => navigateTo('safety')}
            >
              <ListChecks size={18} />
              <span>Safety Checklist</span>
            </button>
          </nav>
        )}
      </header>

      {/* Main Page Container */}
      <main className="main-content">
        {/* ==================================================================
            PAGE 1: HOME PAGE
            ================================================================== */}
        {currentPage === 'home' && (
          <div className="page-view home-page">
            <section className="hero">
              <div className="hero-glow-1" aria-hidden="true" />
              <div className="hero-glow-2" aria-hidden="true" />

              <div className="hero-container">
                <div className="hero-copy">
                  <div className="hero-badge">
                    <Sparkles size={14} className="sparkle-icon" />
                    <span>AI-POWERED RECRUITMENT FRAUD PROTECTION</span>
                  </div>

                  <h1 className="hero-title">
                    Apply with confidence.
                    <br />
                    <span className="title-gradient">Screen job ads in seconds.</span>
                  </h1>

                  <p className="hero-subtitle">
                    Evaluate recruitment postings with machine learning before sharing sensitive identity details,
                    paying upfront onboarding fees, or falling victim to predatory employment scams.
                  </p>

                  <div className="hero-cta-group">
                    <button
                      type="button"
                      className="hero-primary-btn"
                      onClick={() => navigateTo('screening')}
                    >
                      <span>Start Screening Now</span>
                      <ArrowRight size={17} />
                    </button>
                    <button
                      type="button"
                      className="hero-secondary-btn"
                      onClick={() => loadSample(sampleSuspicious)}
                    >
                      <Zap size={16} />
                      <span>Try Sample Scam Ad</span>
                    </button>
                  </div>

                  <div className="hero-trust-bar">
                    <div className="trust-item">
                      <ShieldCheck size={18} className="trust-icon" />
                      <span>Supervised TF-IDF + Logistic Regression</span>
                    </div>
                    <div className="trust-item">
                      <BadgeCheck size={18} className="trust-icon" />
                      <span>Zero-Retention Privacy (No Submissions Stored)</span>
                    </div>
                  </div>
                </div>

                {/* Hero Visual Card Preview */}
                <div className="hero-visual" aria-hidden="true">
                  <div className="visual-card">
                    <div className="visual-card-header">
                      <div className="visual-shield">
                        <ShieldCheck size={38} strokeWidth={2} />
                      </div>
                      <div>
                        <span className="visual-tag">AUTOMATED ANALYSIS</span>
                        <h4>Recruitment Risk Screening</h4>
                      </div>
                    </div>

                    <div className="visual-metrics">
                      <div className="metric-box">
                        <span className="metric-num">98.4%</span>
                        <span className="metric-label">Training Accuracy</span>
                      </div>
                      <div className="metric-box">
                        <span className="metric-num">&lt; 100ms</span>
                        <span className="metric-label">Inference Speed</span>
                      </div>
                    </div>

                    <div className="visual-features">
                      <div className="feat-row">
                        <CheckCircle2 size={16} className="feat-check" />
                        <span>Detects advance-fee & equipment deposit patterns</span>
                      </div>
                      <div className="feat-row">
                        <CheckCircle2 size={16} className="feat-check" />
                        <span>Cross-examines descriptions & requirements</span>
                      </div>
                      <div className="feat-row">
                        <CheckCircle2 size={16} className="feat-check" />
                        <span>Provides actionable candidate safety recommendations</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Home Feature Cards Grid */}
            <section className="home-features-section">
              <div className="home-features-container">
                <div className="section-header center">
                  <span className="section-kicker">CORE CAPABILITIES</span>
                  <h2 className="section-title">Comprehensive Job Safety Intelligence</h2>
                  <p className="section-desc">
                    Explore our integrated toolkit created to protect job applicants worldwide.
                  </p>
                </div>

                <div className="home-card-grid">
                  <div className="home-action-card">
                    <div className="card-top-icon">
                      <FileSearch size={26} />
                    </div>
                    <h3>Interactive Screening Tool</h3>
                    <p>
                      Paste any employment offer or vacancy to immediately analyze textual markers, fee requests, and dubious hiring language.
                    </p>
                    <button
                      type="button"
                      className="card-action-link"
                      onClick={() => navigateTo('screening')}
                    >
                      <span>Open Screening Tool</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  <div className="home-action-card">
                    <div className="card-top-icon">
                      <Activity size={26} />
                    </div>
                    <h3>How It Works</h3>
                    <p>
                      Discover the supervised NLP vectorization pipeline and calibrated classification algorithms that detect fraudulent indicators.
                    </p>
                    <button
                      type="button"
                      className="card-action-link"
                      onClick={() => navigateTo('how-it-works')}
                    >
                      <span>Explore AI Architecture</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                  <div className="home-action-card">
                    <div className="card-top-icon">
                      <ListChecks size={26} />
                    </div>
                    <h3>Safety Checklist</h3>
                    <p>
                      Review essential candidate rules, red flags checklist, and immediate safety actions before providing personal details.
                    </p>
                    <button
                      type="button"
                      className="card-action-link"
                      onClick={() => navigateTo('safety')}
                    >
                      <span>View Safety Protocols</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================================================================
            PAGE 2: SCREENING TOOL PAGE
            ================================================================== */}
        {currentPage === 'screening' && (
          <div className="page-view screening-page">
            <section className="workspace-section">
              <div className="workspace-container">
                <div className="section-header">
                  <div className="section-title-wrap">
                    <span className="section-kicker">INTERACTIVE SCREENER</span>
                    <h2 className="section-title">Analyze a Job Advertisement</h2>
                    <p className="section-desc">
                      Paste the text from any employment post. Our model assesses lexical patterns, phrasing, and indicators
                      against verified recruitment datasets.
                    </p>
                  </div>

                  {/* Sample Preset Buttons */}
                  <div className="sample-presets">
                    <span className="sample-label">Quick Test:</span>
                    <button
                      type="button"
                      className="preset-pill preset-alert"
                      onClick={() => loadSample(sampleSuspicious)}
                      title="Load an example of a suspicious recruitment post"
                    >
                      <TriangleAlert size={14} />
                      <span>Suspicious Ad</span>
                    </button>
                    <button
                      type="button"
                      className="preset-pill preset-safe"
                      onClick={() => loadSample(sampleLegit)}
                      title="Load an example of a legitimate corporate recruitment post"
                    >
                      <CheckCircle2 size={14} />
                      <span>Legitimate Ad</span>
                    </button>
                  </div>
                </div>

                <div className="workspace-grid">
                  {/* Form Input Card */}
                  <form className="form-card" onSubmit={submit}>
                    <div className="form-card-header">
                      <div className="header-meta">
                        <div className="icon-badge">
                          <BriefcaseBusiness size={20} />
                        </div>
                        <div>
                          <h3>Job Advertisement Details</h3>
                          <p>Enter the details you received from the vacancy or recruiter</p>
                        </div>
                      </div>

                      {(form.title || form.description) && (
                        <button
                          type="button"
                          className="reset-button"
                          onClick={reset}
                          title="Clear all fields"
                        >
                          <RotateCcw size={14} />
                          <span>Reset</span>
                        </button>
                      )}
                    </div>

                    <div className="form-body">
                      <div className="input-group">
                        <div className="label-bar">
                          <label htmlFor="title" className="field-label">
                            Job Title <span className="required-star">*</span>
                          </label>
                          <span className="char-count">{form.title.length}/500</span>
                        </div>
                        <input
                          id="title"
                          className="text-input"
                          value={form.title}
                          onChange={(e) => update('title', e.target.value)}
                          placeholder="e.g. Remote Data Entry Specialist, Customer Success Manager"
                          maxLength={500}
                        />
                      </div>

                      <div className="input-group">
                        <div className="label-bar">
                          <label htmlFor="description" className="field-label">
                            Job Description <span className="required-star">*</span>
                          </label>
                          <span className="field-hint">Crucial for pattern detection</span>
                        </div>
                        <textarea
                          id="description"
                          className="text-area"
                          value={form.description}
                          onChange={(e) => update('description', e.target.value)}
                          placeholder="Paste the full job post here, including responsibilities, compensation details, interview instructions, and payment or identity requests…"
                          rows={7}
                          maxLength={30000}
                        />
                      </div>

                      {/* Optional collapsible accordion */}
                      <div className="optional-wrapper">
                        <button
                          type="button"
                          className={`optional-toggle-btn ${showOptional ? 'active' : ''}`}
                          onClick={() => setShowOptional((prev) => !prev)}
                          aria-expanded={showOptional}
                        >
                          <div className="toggle-left">
                            <ChevronDown size={17} className={`toggle-chevron ${showOptional ? 'rotated' : ''}`} />
                            <span>Additional Fields (Company, Requirements, Compensation)</span>
                          </div>
                          <span className="toggle-badge">
                            {filledOptionalCount > 0 ? `${filledOptionalCount} filled` : 'Optional'}
                          </span>
                        </button>

                        {showOptional && (
                          <div className="optional-content">
                            <div className="input-group">
                              <label htmlFor="company" className="field-label sub-label">
                                <Building2 size={15} />
                                <span>Company Profile</span>
                              </label>
                              <textarea
                                id="company"
                                className="text-area sub-area"
                                value={form.company_profile}
                                onChange={(e) => update('company_profile', e.target.value)}
                                placeholder="What does the company describe regarding their background, headquarters, or website?"
                                rows={3}
                                maxLength={10000}
                              />
                            </div>

                            <div className="input-group">
                              <label htmlFor="requirements" className="field-label sub-label">
                                <FileText size={15} />
                                <span>Requirements & Qualifications</span>
                              </label>
                              <textarea
                                id="requirements"
                                className="text-area sub-area"
                                value={form.requirements}
                                onChange={(e) => update('requirements', e.target.value)}
                                placeholder="Required experience, educational background, certifications, or equipment…"
                                rows={3}
                                maxLength={15000}
                              />
                            </div>

                            <div className="input-group">
                              <label htmlFor="benefits" className="field-label sub-label">
                                <Gift size={15} />
                                <span>Benefits & Allowances</span>
                              </label>
                              <textarea
                                id="benefits"
                                className="text-area sub-area"
                                value={form.benefits}
                                onChange={(e) => update('benefits', e.target.value)}
                                placeholder="Advertised salary range, insurance, bonuses, or work-from-home allowances…"
                                rows={3}
                                maxLength={10000}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-card-footer">
                      <div className="footer-stats">
                        <span className="word-pill">
                          {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'} analyzed
                        </span>
                      </div>

                      <button className="submit-btn" type="submit" disabled={loading}>
                        {loading ? (
                          <>
                            <LoaderCircle className="spin-icon" size={19} />
                            <span>Evaluating Text Patterns…</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck size={19} />
                            <span>Run Security Assessment</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>

                    {error && (
                      <div className="alert-box alert-danger" role="alert">
                        <AlertOctagon size={19} className="alert-icon" />
                        <div className="alert-content">
                          <strong>Submission Notice</strong>
                          <p>{error}</p>
                        </div>
                      </div>
                    )}

                    <div className="form-privacy-foot">
                      <Shield size={14} />
                      <span>Confidentiality: Submissions are evaluated ephemeral in memory and are never stored.</span>
                    </div>
                  </form>

                  {/* Result Panel Column */}
                  <aside className="result-panel" id="result-panel" aria-live="polite">
                    {/* Empty State */}
                    {!result && !loading && (
                      <div className="result-card empty-state">
                        <div className="empty-icon-wrap">
                          <Activity size={32} />
                        </div>
                        <span className="section-kicker">ANALYSIS DASHBOARD</span>
                        <h3>Ready for Job Ad Screening</h3>
                        <p className="empty-subtitle">
                          Submit an advertisement to view the machine learning risk index, confidence scores, and safety advice.
                        </p>

                        <div className="feature-checklist">
                          <div className="check-item">
                            <CheckCircle2 size={16} className="check-icon" />
                            <span>Dual-level risk classification (Lower vs Higher)</span>
                          </div>
                          <div className="check-item">
                            <CheckCircle2 size={16} className="check-icon" />
                            <span>Transparent threshold and score comparison</span>
                          </div>
                          <div className="check-item">
                            <CheckCircle2 size={16} className="check-icon" />
                            <span>Verified candidate safety protocol reminders</span>
                          </div>
                        </div>

                        <div className="empty-foot">
                          <CircleHelp size={16} />
                          <span>Always cross-reference employer credentials independently.</span>
                        </div>
                      </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                      <div className="result-card loading-state">
                        <div className="scanning-radar">
                          <LoaderCircle size={44} className="spin-icon" />
                        </div>
                        <h3>Screening Advertisement…</h3>
                        <p>
                          The TF-IDF feature extractor is vectorizing text and computing logistic risk metrics against training weights.
                        </p>
                        <div className="loading-bar">
                          <div className="loading-bar-inner" />
                        </div>
                      </div>
                    )}

                    {/* Result Card */}
                    {result && (
                      <div className={`result-card result-active ${result.level}`}>
                        <div className="result-header">
                          <div>
                            <span className="result-kicker">ASSESSMENT REPORT</span>
                            <div className="badge-row">
                              <span className={`status-pill ${result.level}`}>
                                {result.level === 'higher' ? (
                                  <>
                                    <ShieldAlert size={15} />
                                    <span>High Fraud Risk Detected</span>
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck size={15} />
                                    <span>Low Fraud Risk Indicated</span>
                                  </>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="result-actions">
                            <button
                              type="button"
                              className="action-btn"
                              onClick={copyResult}
                              title="Copy screening summary to clipboard"
                            >
                              {copied ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                            </button>
                            <button
                              type="button"
                              className="action-btn"
                              onClick={reset}
                              title="Clear report and start new screen"
                            >
                              <RotateCcw size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="result-main-block">
                          <h3 className="result-headline">{result.label}</h3>
                          <p className="result-summary-text">{result.summary}</p>
                        </div>

                        {/* Risk Gauge Bar */}
                        <div className="meter-card">
                          <div className="meter-label-row">
                            <span className="meter-title">Model Risk Probability</span>
                            <span className={`meter-value ${result.level}`}>{percentage}%</span>
                          </div>

                          <div className="meter-track">
                            <div
                              className={`meter-bar ${result.level}`}
                              style={{ width: `${Math.min(Math.max(percentage, 3), 100)}%` }}
                            />
                            <div
                              className="threshold-marker"
                              style={{ left: `${thresholdPercentage}%` }}
                              title={`Decision Threshold: ${thresholdPercentage}%`}
                            />
                          </div>

                          <div className="meter-scale">
                            <span>0% (Safe)</span>
                            <span className="threshold-label">
                              Threshold: <strong>{thresholdPercentage}%</strong>
                            </span>
                            <span>100% (High Risk)</span>
                          </div>
                        </div>

                        {/* Checked Fields */}
                        <div className="assessed-fields-wrap">
                          <span className="fields-title">Fields Evaluated in Pipeline:</span>
                          <div className="fields-chips">
                            {result.checked_fields.map((field) => (
                              <span key={field} className="field-chip">
                                {field.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Actionable Safety Guidance */}
                        <div className="guidance-box">
                          <div className="guidance-header">
                            <TriangleAlert size={17} />
                            <h4>Candidate Safety Directives</h4>
                          </div>
                          <ul className="guidance-list">
                            <li>
                              <strong>Never pay upfront fees:</strong> Legitimate firms never charge for tests, uniforms, or registration.
                            </li>
                            <li>
                              <strong>Verify corporate email:</strong> Be skeptical of recruiters messaging exclusively from free Gmail, Yahoo, or Telegram accounts.
                            </li>
                            <li>
                              <strong>Protect banking details:</strong> Do not release account or credit details prior to an in-person or official onboarding contract.
                            </li>
                          </ul>
                        </div>

                        <div className="result-disclaimer">
                          <HelpCircle size={15} className="disclaimer-icon" />
                          <p>{result.disclaimer}</p>
                        </div>

                        <div className="model-tag-bar">
                          <BadgeCheck size={15} />
                          <span>{result.model_name} • Pre-trained TF-IDF / Logistic Classifier</span>
                        </div>

                        <button
                          className="reset-wide-btn"
                          type="button"
                          onClick={reset}
                        >
                          <RotateCcw size={16} />
                          <span>Screen Another Job Vacancy</span>
                        </button>
                      </div>
                    )}

                    {/* Persistent Safety Reminder Widget */}
                    <div className="safety-widget">
                      <div className="widget-icon">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="widget-content">
                        <h5>Recruiter Verification Protocol</h5>
                        <p>
                          Always cross-examine job requisitions on the official company careers portal before applying.
                        </p>
                        <button
                          type="button"
                          className="widget-link-btn"
                          onClick={() => navigateTo('safety')}
                        >
                          <span>Review 4-Step Safety Checklist</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================================================================
            PAGE 3: HOW IT WORKS PAGE
            ================================================================== */}
        {currentPage === 'how-it-works' && (
          <div className="page-view how-page">
            <section className="page-header-banner">
              <div className="banner-container">
                <span className="section-kicker">ENGINEERING & ARCHITECTURE</span>
                <h1 className="banner-title">How JOBGUARD AI Inspects Postings</h1>
                <p className="banner-desc">
                  An in-depth look at our natural language processing pipeline, statistical feature extraction,
                  and automated recruitment risk scoring methodology.
                </p>
              </div>
            </section>

            <section className="how-section">
              <div className="how-container">
                <div className="how-grid">
                  <article className="how-card">
                    <div className="how-step-badge">01</div>
                    <div className="how-icon-wrap">
                      <FileSearch size={24} />
                    </div>
                    <h3>1. Ingestion & Normalization</h3>
                    <p>
                      Job title, descriptions, company profiles, and criteria are sanitized to eliminate HTML artifacts,
                      uninformative noise, and irregular whitespace, transforming user input into clean standard linguistic tokens.
                    </p>
                  </article>

                  <article className="how-card">
                    <div className="how-step-badge">02</div>
                    <div className="how-icon-wrap">
                      <Activity size={24} />
                    </div>
                    <h3>2. TF-IDF Vectorization</h3>
                    <p>
                      Term Frequency-Inverse Document Frequency calculates the statistical relevance of uni-grams and bi-grams,
                      isolating scam lexical markers (e.g. upfront checks, wire transfer deposits, instant hiring without interviews).
                    </p>
                  </article>

                  <article className="how-card">
                    <div className="how-step-badge">03</div>
                    <div className="how-icon-wrap">
                      <ShieldCheck size={24} />
                    </div>
                    <h3>3. Calibrated Risk Output</h3>
                    <p>
                      A tuned Logistic Regression model evaluates the sparse TF-IDF vectors, outputting continuous probability
                      against a predetermined classification threshold to categorize postings into High vs Low risk tiers.
                    </p>
                  </article>
                </div>

                {/* Additional Deep Dive Cards */}
                <div className="architecture-details">
                  <div className="arch-card">
                    <div className="arch-icon">
                      <Zap size={22} />
                    </div>
                    <div>
                      <h4>Sub-100ms Inference Latency</h4>
                      <p>
                        Optimized scikit-learn models serialized via standard vector pipelines deliver deterministic, lightning-fast predictions
                        ideal for integration into browser extensions, portals, and applicant tracking systems.
                      </p>
                    </div>
                  </div>

                  <div className="arch-card">
                    <div className="arch-icon">
                      <Shield size={22} />
                    </div>
                    <div>
                      <h4>Zero-Retention Privacy Guarantee</h4>
                      <p>
                        Candidate safety is our priority. Submitted job ads are scored dynamically in-memory and discarded immediately upon response.
                        No personal data, user tokens, or descriptions are ever logged or retained in a database.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Page Action CTA */}
                <div className="page-cta-card">
                  <h3>Ready to test the model yourself?</h3>
                  <p>Paste any job advertisement to run the live NLP risk assessment right now.</p>
                  <button
                    type="button"
                    className="hero-primary-btn"
                    onClick={() => navigateTo('screening')}
                  >
                    <span>Launch Screening Tool</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ==================================================================
            PAGE 4: SAFETY CHECKLIST PAGE
            ================================================================== */}
        {currentPage === 'safety' && (
          <div className="page-view safety-page">
            <section className="page-header-banner">
              <div className="banner-container">
                <span className="section-kicker">CANDIDATE DEFENSE GUIDE</span>
                <h1 className="banner-title">Recruitment Fraud Safety Checklist</h1>
                <p className="banner-desc">
                  Essential protective guidelines, critical red flags, and verification protocols every job hunter should know.
                </p>
              </div>
            </section>

            <section className="safety-section">
              <div className="safety-container">
                <div className="safety-grid">
                  <div className="safety-card">
                    <div className="card-number">01</div>
                    <h4>Verify the Official Career Page</h4>
                    <p>
                      Search the employer's official website directly. If the job is real, it will almost certainly appear on their careers portal.
                    </p>
                  </div>

                  <div className="safety-card">
                    <div className="card-number">02</div>
                    <h4>Scrutinize Sender Domains</h4>
                    <p>
                      Legitimate enterprise recruiters reach out from official corporate email addresses (e.g. @company.com), not generic webmail.
                    </p>
                  </div>

                  <div className="safety-card">
                    <div className="card-number">03</div>
                    <h4>Never Pay to Work</h4>
                    <p>
                      Legitimate companies never require you to buy laptops, pay training costs, or send registration fees before your first paycheck.
                    </p>
                  </div>

                  <div className="safety-card">
                    <div className="card-number">04</div>
                    <h4>Safeguard Personal Identifiers</h4>
                    <p>
                      Refuse requests for social security, national ID numbers, or bank account credentials during early interview stages.
                    </p>
                  </div>
                </div>

                {/* Scam Red Flags In-Depth List */}
                <div className="red-flags-section">
                  <h3 className="sub-section-title">Critical Scam Red Flags Checklist</h3>
                  <div className="red-flags-grid">
                    <div className="red-flag-item">
                      <TriangleAlert size={18} className="flag-icon" />
                      <div>
                        <strong>Instant Job Offers:</strong> Being hired within minutes via text message or Telegram without an interview or background check.
                      </div>
                    </div>
                    <div className="red-flag-item">
                      <TriangleAlert size={18} className="flag-icon" />
                      <div>
                        <strong>Unusually High Salary:</strong> Offers promising $3,000+ weekly for basic data entry or assistant tasks with no prior experience.
                      </div>
                    </div>
                    <div className="red-flag-item">
                      <TriangleAlert size={18} className="flag-icon" />
                      <div>
                        <strong>Fake Check Overpayment:</strong> Being sent a check to buy home office equipment with instructions to wire back the surplus funds.
                      </div>
                    </div>
                    <div className="red-flag-item">
                      <TriangleAlert size={18} className="flag-icon" />
                      <div>
                        <strong>Unofficial Contact Channels:</strong> Recruiters refusing video calls and insisting on conducting the entire hiring process on messaging apps.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="model-scope-notice">
                  <CircleHelp size={16} />
                  <span>
                    <strong>Academic Prototype Notice:</strong> Model was trained on historical international recruitment ad datasets. Always exercise caution and conduct comprehensive background diligence.
                  </span>
                </div>

                {/* Page Action CTA */}
                <div className="page-cta-card">
                  <h3>Have a job vacancy you want to evaluate?</h3>
                  <p>Screen suspicious ads against our machine learning fraud classifier.</p>
                  <button
                    type="button"
                    className="hero-primary-btn"
                    onClick={() => navigateTo('screening')}
                  >
                    <span>Screen An Advertisement Now</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand-wrap">
            <button
              type="button"
              className="brand brand-btn footer-brand"
              onClick={() => navigateTo('home')}
            >
              <span className="brand-mark">
                <ShieldCheck size={20} />
              </span>
              <div className="brand-text">
                <span className="brand-name">
                  JOBGUARD<span className="brand-ai"> AI</span>
                </span>
                <span className="brand-tagline">CAREER SAFETY INTELLIGENCE</span>
              </div>
            </button>
            <p className="footer-text">
              An intelligent machine-learning prototype designed to empower job hunters and protect against employment fraud.
            </p>
          </div>

          <div className="footer-links">
            <button
              type="button"
              className={`footer-link-btn ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              Home
            </button>
            <button
              type="button"
              className={`footer-link-btn ${currentPage === 'screening' ? 'active' : ''}`}
              onClick={() => navigateTo('screening')}
            >
              Screening Tool
            </button>
            <button
              type="button"
              className={`footer-link-btn ${currentPage === 'how-it-works' ? 'active' : ''}`}
              onClick={() => navigateTo('how-it-works')}
            >
              How It Works
            </button>
            <button
              type="button"
              className={`footer-link-btn ${currentPage === 'safety' ? 'active' : ''}`}
              onClick={() => navigateTo('safety')}
            >
              Safety Checklist
            </button>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} JOBGUARD AI. Open Source Research Prototype.</span>
            <span className="version-pill">v1.0.0 Production Release</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
