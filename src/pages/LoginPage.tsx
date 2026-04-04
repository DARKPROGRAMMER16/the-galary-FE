import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import AuthLayout from '../components/AuthLayout'
import AppLogo from '../components/AppLogo'
import FormInput from '../components/FormInput'
import PrimaryButton from '../components/PrimaryButton'
import { useAuth } from '../contexts/AuthContext'
import { z } from 'zod'
import { loginSchema } from '../utils/validationSchemas'

type FieldErrors = Partial<Record<'email' | 'password', string>>

function collectErrors(issues: z.core.$ZodIssue[]): FieldErrors {
  const errs: FieldErrors = {}
  for (const issue of issues) {
    const key = issue.path[0] as keyof FieldErrors
    if (!errs[key]) errs[key] = issue.message
  }
  return errs
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setFieldErrors({})

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setFieldErrors(collectErrors(result.error.issues))
      return
    }

    try {
      await login({ email, password })
      navigate('/library')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid email or password.'
      toast.error(message)
    }
  }

  return (
    <AuthLayout>
      <AppLogo subtitle="Welcome back to the gallery." />

      <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-15px_rgba(50,50,50,0.04)]">
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <FormInput
            id="email"
            label="Email"
            icon="mail"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={setEmail}
            error={fieldErrors.email}
          />

          <FormInput
            id="password"
            label="Password"
            icon="lock"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-outline hover:text-on-surface transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            }
          />

          <PrimaryButton type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign In'}
          </PrimaryButton>
        </form>

        <div className="mt-8 text-center">
          <p className="text-on-surface-variant text-sm">
            Need an account?{' '}
            <Link
              to="/signup"
              className="text-primary font-bold hover:underline underline-offset-4 ml-1"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
