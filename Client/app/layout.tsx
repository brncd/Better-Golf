import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { AuthProvider } from "@/context/AuthContext"
import { ErrorBoundary } from "@/components/atoms/ErrorBoundary"
import { config, validateConfig } from "@/lib/config"
import "./globals.css"

// Validate configuration on app startup
if (typeof window === 'undefined') {
  try {
    validateConfig()
  } catch (error) {
    console.error('Configuration validation failed:', error)
  }
}

export const metadata: Metadata = {
  title: config.app.name + " - Tournament Management System",
  description:
    "Professional golf tournament management system for organizing tournaments, managing players, and tracking scores",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <AuthProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </AuthProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
