import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { config, validateConfig } from "@/lib/config"
import { Providers } from "./providers"
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
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}