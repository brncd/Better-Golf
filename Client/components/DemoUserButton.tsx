"use client"

import { Button } from "@/components/ui/button"

interface DemoUserButtonProps {
  onFillDemoCredentials: () => void
}

export function DemoUserButton({ onFillDemoCredentials }: DemoUserButtonProps) {
  return (
    <div className="space-y-2">
      <Button 
        onClick={onFillDemoCredentials}
        variant="outline" 
        className="w-full"
        type="button"
      >
        Fill Demo Credentials
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Email: demo@bettergolf.com | Password: Demo123!
      </p>
    </div>
  )
}
