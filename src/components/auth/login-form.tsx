import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { useAuth } from '../../hooks/use-auth'

type FieldProps = { value: string; onChange: (value: string) => void }

function EmailField({ value, onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium">
        Email
      </label>
      <Input
        id="email"
        type="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        required
      />
    </div>
  )
}

function PasswordField({ value, onChange }: FieldProps) {
  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium">
        Password
      </label>
      <Input
        id="password"
        type="password"
        value={value}
        onChange={e => onChange(e.target.value)}
        required
      />
    </div>
  )
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EmailField value={email} onChange={setEmail} />
      <PasswordField value={password} onChange={setPassword} />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
