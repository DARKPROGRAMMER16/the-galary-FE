import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import AppLogo from '../components/AppLogo'
import FormInput from '../components/FormInput'
import PrimaryButton from '../components/PrimaryButton'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: wire up auth
    navigate('/')
  }

  return (
    <AuthLayout>
      <AppLogo subtitle="Welcome back to the gallery." />

      <div className="bg-surface-container-lowest rounded-xl p-8 md:p-10 shadow-[0_40px_80px_-15px_rgba(50,50,50,0.04)]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <FormInput
            id="email"
            label="Email"
            icon="mail"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={setEmail}
            required
          />

          <FormInput
            id="password"
            label="Password"
            icon="lock"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
            required
            labelRight={
              <a
                href="#"
                className="text-xs font-semibold text-primary hover:text-primary-dim transition-colors tracking-tight"
              >
                Forgot Password?
              </a>
            }
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

          <PrimaryButton type="submit" className="w-full mt-4">
            Sign In
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
