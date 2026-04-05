import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import FormInput from '../components/FormInput'
import PrimaryButton from '../components/PrimaryButton'
import { registerSuperAdminApi } from '../api/auth.api'
import { z } from 'zod'
import { superAdminSignUpSchema } from '../utils/validationSchemas'

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'confirmPassword' | 'secretKey', string>>

function collectErrors(issues: z.core.$ZodIssue[]): FieldErrors {
  const errs: FieldErrors = {}
  for (const issue of issues) {
    const key = issue.path[0] as keyof FieldErrors
    if (!errs[key]) errs[key] = issue.message
  }
  return errs
}

export default function SuperAdminRegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const result = superAdminSignUpSchema.safeParse({ name, email, password, confirmPassword, secretKey })
    if (!result.success) {
      setFieldErrors(collectErrors(result.error.issues))
      return
    }

    setIsLoading(true)
    try {
      await registerSuperAdminApi({ name, email, password, secretKey })
      toast.success('Superadmin account created. Please sign in.')
      navigate('/login')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please check your secret key and try again.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-surface font-body text-on-background min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      <main className="grow flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-error/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-120 z-10">
          {/* Brand */}
          <div className="text-center mb-12">
            <h1 className="font-headline font-bold text-3xl tracking-tight text-on-background mb-2">
              The Galary
            </h1>
            <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">
              Superadmin Registration
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-[0_40px_80px_rgba(50,50,50,0.04)] border border-outline-variant/10">
            {/* Header */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-lg">shield_person</span>
                </div>
                <h2 className="font-headline text-2xl font-semibold text-on-background">
                  Create Superadmin
                </h2>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                This page is restricted. You need the server secret key to register a superadmin account.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="sa_name"
                  label="Full Name"
                  type="text"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={setName}
                  error={fieldErrors.name}
                />
                <FormInput
                  id="sa_email"
                  label="Email Address"
                  type="email"
                  placeholder="superadmin@example.com"
                  value={email}
                  onChange={setEmail}
                  error={fieldErrors.email}
                />
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="sa_password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                  error={fieldErrors.password}
                />
                <FormInput
                  id="sa_confirm"
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  error={fieldErrors.confirmPassword}
                />
              </div>

              {/* Secret key */}
              <div>
                <FormInput
                  id="sa_secret"
                  label="Server Secret Key"
                  icon="key"
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter the SUPERADMIN_SECRET from the server"
                  value={secretKey}
                  onChange={setSecretKey}
                  error={fieldErrors.secretKey}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowSecret((v) => !v)}
                      className="text-outline hover:text-on-surface transition-colors"
                      aria-label={showSecret ? 'Hide key' : 'Show key'}
                    >
                      <span className="material-symbols-outlined">
                        {showSecret ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  }
                />
                <p className="text-xs text-on-surface-variant/60 mt-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Set <code className="font-mono bg-surface-container-high px-1 rounded">SUPERADMIN_SECRET</code> in your server <code className="font-mono bg-surface-container-high px-1 rounded">.env</code> file.
                </p>
              </div>

              <div className="pt-2">
                <PrimaryButton type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account…' : 'Create Superadmin Account'}
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
