import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FormInput from '../components/FormInput'
import PrimaryButton from '../components/PrimaryButton'
import { useAuth } from '../contexts/AuthContext'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { register, isLoading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    try {
      await register({ name, email, password, organisation, role: 'editor' })
      navigate('/library')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.'
      setError(message)
    }
  }

  return (
    <div className="bg-surface font-body text-on-background min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      <main className="grow flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-tertiary/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-120 z-10">
          <div className="text-center mb-12">
            <h1 className="font-headline font-bold text-3xl tracking-tight text-on-background mb-2">
              The Galary
            </h1>
            <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">
              Elevate your vision
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0_40px_80px_rgba(50,50,50,0.04)] border border-outline-variant/10">
            <div className="mb-10">
              <h2 className="font-headline text-2xl font-semibold text-on-background mb-3">
                Create Account
              </h2>
              <p className="text-on-surface-variant text-base leading-relaxed">
                Join our community of digital storytellers and start curating your gallery.
              </p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm font-medium">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="full_name"
                  label="Full Name"
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={setName}
                  required
                />
                <FormInput
                  id="organisation"
                  label="Organisation"
                  type="text"
                  placeholder="Acme Studios"
                  value={organisation}
                  onChange={setOrganisation}
                  required
                />
              </div>

              <FormInput
                id="email"
                label="Email Address"
                type="email"
                placeholder="jane@thegalary.com"
                value={email}
                onChange={setEmail}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  required
                />
                <FormInput
                  id="confirm_password"
                  label="Confirm"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  required
                />
              </div>

              <div className="pt-4">
                <PrimaryButton type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account…' : 'Create Account'}
                </PrimaryButton>
              </div>
            </form>

            <div className="mt-10 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-on-surface-variant text-sm">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary font-semibold ml-1 hover:underline underline-offset-4 decoration-2"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="font-label text-[10px] uppercase tracking-[0.2em] text-outline">
              The Galary © 2024
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
