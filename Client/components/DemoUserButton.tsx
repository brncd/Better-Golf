"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { config } from "@/lib/config"

export function DemoUserButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // First, try to login with demo user (correct credentials)
      await login({ emailOrUsername: 'demo', password: 'demo' })
      
      // If we get here, login was successful
      // Try to seed demo data
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          const response = await fetch(`${config.api.baseUrl}/api/seed-demo-data`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            router.push('/dashboard')
          } else {
            // Even if seeding fails, redirect to dashboard since login was successful
            router.push('/dashboard')
          }
        } else {
          router.push('/dashboard')
        }
      } catch (seedError) {
        console.error('Demo data seeding failed:', seedError)
        // Still redirect to dashboard since login was successful
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Demo login error:', error)
      setError('Demo login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-sm text-red-600 text-center">
          {error}
        </div>
      )}
      <Button 
        onClick={handleDemoLogin} 
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        {isLoading ? "Logging in..." : "Try Demo User"}
      </Button>
    </div>
  )
}
