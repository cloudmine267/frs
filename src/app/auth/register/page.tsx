"use client"

import { useState } from 'react'
import { useLocalAuth } from '@/components/auth/LocalAuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, Lock, Mail, User, Building, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Tabs, Tab } from '@/components/ui/tabs' // Assume you have or will create a simple Tabs component
import Link from 'next/link'

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<'public' | 'professional' | 'organization'>('public')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: '',
    role: '',
    organizationName: '',
    contactPerson: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useLocalAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    let registrationData: any = {}
    let userRole = ''
    if (activeTab === 'public') {
      userRole = 'public'
      registrationData = {
        full_name: formData.fullName,
        role: userRole
      }
    } else if (activeTab === 'professional') {
      userRole = 'professional'
      registrationData = {
        full_name: formData.fullName,
        company: formData.company,
        role: userRole
      }
    } else if (activeTab === 'organization') {
      userRole = 'organization'
      registrationData = {
        organization_name: formData.organizationName,
        contact_person: formData.contactPerson,
        phone: formData.phone,
        role: userRole
      }
    }

    const { error } = await signUp(formData.email, formData.password, registrationData)
    if (error) {
      setError(error)
    } else {
      alert('Registration successful! Please check your email for verification.')
      router.push('/auth/login')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream to-brand-light-blue flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-navy bg-clip-text text-transparent mb-2">
            Botswana Financial Regulatory Platform
          </h1>
          <p className="text-gray-600">Create an account to access regulatory resources</p>
        </div>
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm border-brand-blue/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-brand-navy">Create Account</CardTitle>
              <p className="text-gray-600">Register for access to regulatory resources</p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <Tab value="public" label="Public User" />
                <Tab value="professional" label="Financial Professional" />
                <Tab value="organization" label="Financial Organization" />
              </Tabs>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
                {activeTab === 'public' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-navy">Full Name</label>
                      <Input
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
                {activeTab === 'professional' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-navy">Full Name</label>
                      <Input
                        placeholder="Jane Smith"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-navy">Company/Organization</label>
                      <Input
                        placeholder="ABC Financial Services"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
                {activeTab === 'organization' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-navy">Organization Name</label>
                      <Input
                        placeholder="XYZ Holdings"
                        value={formData.organizationName}
                        onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-navy">Contact Person</label>
                      <Input
                        placeholder="Contact Name"
                        value={formData.contactPerson}
                        onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-navy">Phone</label>
                      <Input
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-navy">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your.email@company.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-navy">Password</label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-brand-navy">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full hover:bg-brand-navy text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => router.push('/auth/login')}
                    className="text-brand-blue hover:underline font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
              <div className="mt-8 text-center">
                <Link href="/auth/admin-login">
                  <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
                    Admin Access
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
