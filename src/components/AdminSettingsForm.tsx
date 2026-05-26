"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminSettingsForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  const [idFormat, setIdFormat] = useState("VSF{YY}{000}")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings")
        if (res.ok) {
          const data = await res.json()
          if (data.federationIdFormat) {
            setIdFormat(data.federationIdFormat)
          }
        }
      } catch (_err) {
        console.error("Failed to load settings")
      } finally {
        setFetching(false)
      }
    }
    fetchSettings()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "federationIdFormat", value: idFormat })
      })

      if (!res.ok) throw new Error("Failed to save settings")
      
      toast.success("Settings saved successfully!")
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="text-sm text-muted-foreground animate-pulse">Loading settings...</div>
  }

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-medium">Federation ID Generator</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the format used to auto-generate Federation IDs for new students.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <div className="space-y-2">
          <Label htmlFor="idFormat">ID Format Template</Label>
          <div className="flex gap-2">
            <Input 
              id="idFormat" 
              required 
              value={idFormat}
              onChange={e => setIdFormat(e.target.value)}
              placeholder="e.g. VSF{YY}{000}"
            />
          </div>
          <div className="text-xs text-muted-foreground bg-slate-50 p-3 rounded-md border">
            <p className="font-semibold mb-1">Available variables:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><code>{`{YY}`}</code> - 2-digit joining year (e.g., 26 for 2026)</li>
              <li><code>{`{YYYY}`}</code> - 4-digit joining year (e.g., 2026)</li>
              <li><code>{`{000}`}</code> - Student number padded with zeros. More zeros = more padding.</li>
            </ul>
            <p className="mt-2 pt-2 border-t text-primary">
              Example preview for 1st student in 2026: <br/>
              <span className="font-mono bg-primary/10 px-1 py-0.5 rounded">
                {idFormat.replace(/{YY}/g, "26").replace(/{YYYY}/g, "2026").replace(/\{0+\}/, "001")}
              </span>
            </p>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="gap-2">
          <Save className="h-4 w-4" /> 
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  )
}
