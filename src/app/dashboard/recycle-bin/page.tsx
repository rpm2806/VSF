import { auth } from "@/auth"
import { redirect } from "next/navigation"
import RecycleBinClient from "@/components/RecycleBinClient"

export const metadata = { title: "Recycle Bin | VSF Portal" }

export default async function RecycleBinPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")
  if (session.user.role !== "MASTER_ADMIN") redirect("/dashboard")

  return <RecycleBinClient />
}
