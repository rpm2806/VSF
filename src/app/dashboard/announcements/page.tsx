import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AddAnnouncementDialog } from "@/components/AddAnnouncementDialog"
import DeleteAnnouncementButton from "@/components/DeleteAnnouncementButton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Megaphone, Calendar } from "lucide-react"

export default async function AnnouncementsPage() {
  const session = await auth()
  
  if (!session?.user) redirect("/login")
  
  const role = session.user.role as string
  const isMasterAdmin = role === "MASTER_ADMIN"

  const announcements = await db.announcement.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Announcements</h1>
          <p className="text-muted-foreground mt-1">Official broadcasts and updates from the federation.</p>
        </div>
        {isMasterAdmin && (
          <AddAnnouncementDialog />
        )}
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Megaphone className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No announcements yet</h3>
            <p className="text-gray-500 text-sm mt-1">When admins broadcast a message, it will appear here.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="bg-emerald-50/50 pb-4 border-b border-emerald-50 rounded-t-xl">
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-xl text-emerald-900 leading-tight flex-1">
                    {announcement.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center text-xs text-emerald-600 bg-emerald-100/50 px-3 py-1 rounded-full whitespace-nowrap">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(announcement.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    {/* Delete button for master admin only */}
                    {isMasterAdmin && (
                      <DeleteAnnouncementButton id={announcement.id} title={announcement.title} />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
