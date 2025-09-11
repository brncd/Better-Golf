"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/authService"
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner"
import { Users, Trophy, Target, Calendar } from "lucide-react"
import { AuthResponse } from "@/types"
import { useAuth } from "@/context/AuthContext"
import { config } from "@/lib/config"

interface DemoUserButtonProps {
  className?: string
}

export function DemoUserButton({ className }: DemoUserButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login, token } = useAuth()

  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Use AuthContext login method
      await login({
        email: "demo@bettergolf.com",
        password: "Demo123!"
      })

      // Get token from localStorage after login
      const currentToken = localStorage.getItem('authToken')
      if (currentToken) {
        const response = await fetch(`${config.api.baseUrl}/api/seed-demo-data`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          router.push('/dashboard')
        } else {
          // Even if seeding fails, still redirect to dashboard
          router.push('/dashboard')
        }
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      // If login fails, try to register first
      try {
        await authClient.register({
          email: "demo@bettergolf.com",
          password: "Demo123!"
        })

        // Then login using AuthContext
        await login({
          email: "demo@bettergolf.com",
          password: "Demo123!"
        })

        // Get token from localStorage after login
        const currentToken = localStorage.getItem('authToken')
        if (currentToken) {
          const response = await fetch(`${config.api.baseUrl}/api/seed-demo-data`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json'
            }
          })
        }

        router.push('/dashboard')
      } catch (registerErr) {
        setError("Failed to create or login to demo account")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Demo Account
        </CardTitle>
        <CardDescription>
          Try Better Golf with pre-loaded demo data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Badge variant="outline" className="justify-center">
            <Users className="h-3 w-3 mr-1" />
            5 Players
          </Badge>
          <Badge variant="outline" className="justify-center">
            <Trophy className="h-3 w-3 mr-1" />
            3 Tournaments
          </Badge>
          <Badge variant="outline" className="justify-center">
            <Target className="h-3 w-3 mr-1" />
            Demo Course
          </Badge>
          <Badge variant="outline" className="justify-center">
            <Calendar className="h-3 w-3 mr-1" />
            Scorecards
          </Badge>
        </div>
        
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
        
        <Button 
          onClick={handleDemoLogin} 
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Setting up demo...
            </>
          ) : (
            "Try Demo Account"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
