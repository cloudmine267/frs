"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { localDB, User } from '@/lib/localStorage'
import { saveAuditLog } from '@/lib/localStorage'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAdmin: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize local database
    localDB.init()
    
    // Check for existing session
    const currentUser = localDB.auth.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const { user: loggedInUser, error } = localDB.auth.login(email, password)
    
    if (loggedInUser) {
      setUser(loggedInUser)
      saveAuditLog({
        action: 'login',
        email: loggedInUser.email,
        timestamp: new Date().toISOString(),
        status: 'success'
      })
    } else {
      saveAuditLog({
        action: 'login',
        email,
        timestamp: new Date().toISOString(),
        status: 'failure'
      })
    }
    
    setIsLoading(false)
    return { error }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    setIsLoading(true)

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Assign permissions based on role
    let permissions: string[] = []
    const role = metadata?.role
    if (role === 'public') {
      permissions = ['view_home', 'view_search']
    } else if (role === 'professional') {
      permissions = ['view_home', 'view_search', 'view_profile', 'view_requirements', 'view_admin', 'view_documents', 'view_news', 'view_events']
    } else if (role === 'organization') {
      permissions = ['view_home', 'view_search', 'view_profile', 'view_requirements', 'view_admin', 'view_documents', 'view_news', 'view_events', 'view_licensing']
    }
    const { user: newUser, error } = localDB.auth.register(email, password, { ...metadata, permissions })
    if (!error && newUser) {
      saveAuditLog({
        action: 'register',
        email: newUser.email,
        timestamp: new Date().toISOString(),
        status: 'success'
      })
    } else {
      saveAuditLog({
        action: 'register',
        email,
        timestamp: new Date().toISOString(),
        status: 'failure'
      })
    }
    setIsLoading(false)
    return { error }
  }

  const signOut = async () => {
    if (user) {
      saveAuditLog({
        action: 'logout',
        email: user.email,
        timestamp: new Date().toISOString(),
        status: 'success'
      })
    }
    localDB.auth.logout()
    setUser(null)
    return { error: null }
  }

  const isAdmin = user?.is_admin || false
  const isAuthenticated = !!user

  const value = {
    user: user ? { permissions: user.permissions || [], ...user } : null,
    isLoading,
    isAdmin,
    isAuthenticated,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useLocalAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider')
  }
  return context
}