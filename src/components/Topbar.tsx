"use client"

import { signOut } from "next-auth/react"
import { Menu, LogOut, User as UserIcon } from "lucide-react"
import { Button } from "./ui/button"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Topbar({ user }: { user: any }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="sm:hidden">
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
  )
}
