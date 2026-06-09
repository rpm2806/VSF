"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { 
  Menu, 
  X, 
  LogOut, 
  User as UserIcon,
  LayoutDashboard, 
  Users, 
  HeartHandshake, 
  Receipt, 
  Settings, 
  Bell, 
  GraduationCap,
  Shield,
  MessageCircle,
  Trash2
} from "lucide-react"

import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Topbar({ user }: { user: any }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const pathname = usePathname()
  const userRole = user?.role || "STUDENT"

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["MASTER_ADMIN", "VOLUNTEER", "STUDENT", "ALUMNI", "OTHER"] },
    { name: "Students & Alumni", href: "/dashboard/students", icon: GraduationCap, roles: ["MASTER_ADMIN", "VOLUNTEER"] },
    { name: "Batches", href: "/dashboard/batches", icon: Users, roles: ["MASTER_ADMIN", "VOLUNTEER"] },
    { name: "Volunteers", href: "/dashboard/volunteers", icon: Shield, roles: ["MASTER_ADMIN"] },
    { name: "Donations", href: "/dashboard/donations", icon: HeartHandshake, roles: ["MASTER_ADMIN", "VOLUNTEER", "STUDENT", "ALUMNI", "OTHER"] },
    { name: "Expenses", href: "/dashboard/expenses", icon: Receipt, roles: ["MASTER_ADMIN", "VOLUNTEER"] },
    { name: "Announcements", href: "/dashboard/announcements", icon: Bell, roles: ["MASTER_ADMIN", "VOLUNTEER", "STUDENT", "ALUMNI", "OTHER"] },
    { name: "Queries", href: "/dashboard/queries", icon: MessageCircle, roles: ["MASTER_ADMIN"] },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["MASTER_ADMIN", "STUDENT", "ALUMNI", "OTHER"] },
    { name: "Recycle Bin", href: "/dashboard/recycle-bin", icon: Trash2, roles: ["MASTER_ADMIN"] },
  ].filter(item => item.roles.includes(userRole))

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          size="icon" 
          className="sm:hidden text-foreground hover:bg-muted/50"
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end">
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="hidden sm:flex flex-col items-end mr-4">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
                {user.role}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/30">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="h-6 w-px bg-border" aria-hidden="true" />
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-destructive transition-colors gap-2"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Body */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card border-r border-border p-4 shadow-xl transition-all duration-300 ease-in-out z-50 animate-in slide-in-from-left duration-300">
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b px-2 mb-4">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="VSF Logo" width={36} height={36} className="object-contain rounded-full flex-shrink-0" />
                <span className="font-bold tracking-tight text-sm leading-tight text-foreground">
                  Vriksh <span className="text-primary font-extrabold">SF</span>
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsDrawerOpen(false)} 
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsDrawerOpen(false)}>
                    <span className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}>
                      <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                      <span className="flex-1">{item.name}</span>
                    </span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-border mt-auto pt-4 space-y-4">
              <div className="flex flex-col items-start px-2">
                <span className="text-sm font-semibold text-foreground">{user.name}</span>
                <span className="text-[10px] text-muted-foreground bg-primary/10 text-primary px-2.5 py-0.5 rounded-full mt-1 font-bold">
                  {user.role}
                </span>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 border border-primary/20 text-center">
                <p className="text-[11px] font-bold text-primary">Vriksh Students Federation</p>
                <p className="text-[9px] text-muted-foreground">Version 1.10.1</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
