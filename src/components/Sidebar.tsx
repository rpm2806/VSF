"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
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

import { cn } from "@/lib/utils"
import { ThemeToggle } from "./ThemeToggle"

import Image from "next/image"

export default function Sidebar({ userRole, pendingQueries = 0 }: { userRole: string; pendingQueries?: number }) {
  const pathname = usePathname()

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ["MASTER_ADMIN", "VOLUNTEER", "STUDENT", "ALUMNI", "OTHER"], badge: 0 },
    { name: "Students & Alumni", href: "/dashboard/students", icon: GraduationCap, roles: ["MASTER_ADMIN", "VOLUNTEER"], badge: 0 },
    { name: "Batches", href: "/dashboard/batches", icon: Users, roles: ["MASTER_ADMIN", "VOLUNTEER"], badge: 0 },
    { name: "Volunteers", href: "/dashboard/volunteers", icon: Shield, roles: ["MASTER_ADMIN"], badge: 0 },
    { name: "Donations", href: "/dashboard/donations", icon: HeartHandshake, roles: ["MASTER_ADMIN", "VOLUNTEER", "STUDENT", "ALUMNI", "OTHER"], badge: 0 },
    { name: "Expenses", href: "/dashboard/expenses", icon: Receipt, roles: ["MASTER_ADMIN", "VOLUNTEER"], badge: 0 },
    { name: "Announcements", href: "/dashboard/announcements", icon: Bell, roles: ["MASTER_ADMIN", "VOLUNTEER", "STUDENT", "ALUMNI", "OTHER"], badge: 0 },
    { name: "Queries", href: "/dashboard/queries", icon: MessageCircle, roles: ["MASTER_ADMIN"], badge: pendingQueries },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, roles: ["MASTER_ADMIN", "STUDENT", "ALUMNI", "OTHER"], badge: 0 },
    { name: "Recycle Bin", href: "/dashboard/recycle-bin", icon: Trash2, roles: ["MASTER_ADMIN"], badge: 0 },
  ].filter(item => item.roles.includes(userRole))

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-card shadow-sm sm:flex">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
        <Image src="/logo.png" alt="VSF Logo" width={42} height={42} className="object-contain rounded-full flex-shrink-0" />
        <span className="font-bold tracking-tight text-sm leading-tight">
          Vriksh <span className="text-primary">Students Federation</span>
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.name} href={item.href}>
              <span className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                <span className="flex-1">{item.name}</span>
                {item.badge > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <div className="rounded-xl bg-primary/10 p-4 border border-primary/20 text-center">
          <p className="text-xs font-semibold text-primary mb-1">Vriksh Students Federation Portal</p>
          <p className="text-[10px] text-muted-foreground">Version 1.10.1</p>
        </div>
      </div>
    </aside>
  )
}
