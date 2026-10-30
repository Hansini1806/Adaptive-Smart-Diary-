import { useState } from 'react'
import { BookOpen, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import './AuthPages.css'

export default function AuthPages({ mode, onNavigate, onLogin, onSignup, initialError = '' }) {
  const isSignup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(initialError)
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (isSignup && password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isSignup) {
        const result = await onSignup({ name, email, password })
        if (result?.needsEmailConfirmation) {
          setSuccess('Your account was created. Check your email to confirm it, then log in.')
        }
      } else {
        await onLogin({ email, password })
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" aria-hidden="true" />
      <div className="auth-glow auth-glow-two" aria-hidden="true" />
      <section className="auth-card" aria-labelledby="auth-title">
        <a
          className="auth-brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onNavigate('/login')
          }}
        >
          <span className="brand-icon"><BookOpen size={22} strokeWidth={1.8} /></span>
          <span className="brand-copy">
            <strong>AI Smart Diary</strong>
            <span>Your thoughts, evolved.</span>
          </span>
        </a>

        <div className="auth-heading">
          <span className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL SPACE</span>
          <h1 id="auth-title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p>{isSignup ? 'Make a little space for your thoughts.' : 'Sign in to continue your journaling journey.'}</p>
        </div>

        {error && <p className="auth-error" role="alert">{error}</p>}
        {success && <p className="auth-success" role="status">{success}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label className="auth-field">
              <span>Full name</span>
              <span className="auth-input-wrap">
                <UserRound size={17} aria-hidden="true" />
                <input
                  autoComplete="name"
                  maxLength={80}
                  minLength={1}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  required
                  value={name}
                />
              </span>
            </label>
          )}
          <label className="auth-field">
            <span>Email address</span>
            <span className="auth-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>
          <label className="auth-field">
            <span>Password</span>
            <span className="auth-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                minLength={isSignup ? 8 : undefined}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="auth-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          {isSignup && (
            <label className="auth-field">
              <span>Confirm password</span>
              <span className="auth-input-wrap">
                <LockKeyhole size={17} aria-hidden="true" />
                <input
                  autoComplete="new-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Type your password again"
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                />
                <button
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="auth-password-toggle"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  type="button"
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
          )}
          <button className="auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? 'Already have an account?' : 'New to AI Smart Diary?'}{' '}
          <button type="button" onClick={() => onNavigate(isSignup ? '/login' : '/signup')}>
            {isSignup ? 'Log in' : 'Create an account'}
          </button>
        </p>
        <p className="auth-demo-notice">
          Authentication is handled by Supabase. Diary entries and goals are still stored locally in this browser.
        </p>
      </section>
    </main>
  )
}
