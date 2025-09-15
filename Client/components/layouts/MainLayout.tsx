"use client"

import type React from "react"
import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Trophy, Users, MapPin, BarChart3, Settings, Menu, LogOut, User, Target, Shield } from "lucide-react"
import { GolfHoleIcon } from "@/components/icons/GolfHoleIcon"
import { useAuth } from "@/context/AuthContext"
import type { User as AuthUser } from "@/types"
import { NavLink } from "./NavLink"
import { ClientOnly } from "@/components/atoms/ClientOnly"
import { UserNav } from "./UserNav"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Tournaments", href: "/tournaments", icon: Trophy },
  { name: "Players", href: "/players", icon: Users },
  { name: "Courses", href: "/courses", icon: MapPin },
  { name: "Scoring", href: "/scoring", icon: Target },
]

const adminNavigation = { name: "Admin", href: "/admin", icon: Settings };

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, hasRole } = useAuth()
  const router = useRouter()

  const isAdmin = hasRole('Admin');

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => (
        <NavLink
          key={item.name}
          href={item.href}
          icon={item.icon}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
          className={mobile ? "text-base py-3" : ""}
        >
          {item.name}
        </NavLink>
      ))}
      <ClientOnly>
        {isAdmin && (
          <NavLink
            key={adminNavigation.name}
            href={adminNavigation.href}
            icon={adminNavigation.icon}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
            className={mobile ? "text-base py-3" : ""}
          >
            {adminNavigation.name}
          </NavLink>
        )}
      </ClientOnly>
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <GolfHoleIcon size={32} className="rounded-lg" />
              <span className="text-lg font-semibold text-sidebar-foreground">Better Golf</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  <NavItems />
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-sidebar px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-full flex-col bg-sidebar">
              <div className="flex h-16 shrink-0 items-center px-6">
                <div className="flex items-center gap-2">
                  <GolfHoleIcon size={32} className="rounded-lg" />
                  <span className="text-lg font-semibold text-sidebar-foreground">Better Golf</span>
                </div>
              </div>
              <nav className="flex flex-1 flex-col px-6 pb-4">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      <NavItems mobile />
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <GolfHoleIcon size={32} className="rounded-lg" />
          <span className="text-lg font-semibold text-sidebar-foreground">Better Golf</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <ClientOnly>
                <UserNav />
              </ClientOnly>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}