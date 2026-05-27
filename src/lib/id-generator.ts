import { db } from "@/lib/db"

/**
 * Generates the lowest unused Federation ID for a given joining year.
 * If students were deleted (creating gaps like VSF26001, VSF26003),
 * it will automatically return the gap ID (VSF26002).
 */
export async function generateLowestUnusedFederationId(joiningYear: number): Promise<string> {
  const formatSetting = await db.systemSetting.findUnique({
    where: { key: "federationIdFormat" }
  })
  const formatString = formatSetting?.value || "VSF{YY}{000}"

  const yy = String(joiningYear).slice(-2)
  const yyyy = String(joiningYear)

  const template = formatString.replace(/{YY}/g, yy).replace(/{YYYY}/g, yyyy)

  // Fetch all existing federationId values for students who joined in this year
  // We query all records, including active and soft-deleted (recycled) ones,
  // to prevent reclaiming an ID of an item in the Recycle Bin that might be restored later.
  const existingStudents = await db.student.findMany({
    where: { joiningYear },
    select: { federationId: true }
  })

  const existingIds = new Set(existingStudents.map(s => s.federationId))

  const paddingMatch = template.match(/\{0+\}/)
  const paddingLength = paddingMatch ? paddingMatch[0].length - 2 : 0

  let i = 1
  while (true) {
    let federationId = template
    if (paddingMatch) {
      const countPadded = String(i).padStart(paddingLength, '0')
      federationId = federationId.replace(paddingMatch[0], countPadded)
    } else {
      federationId += String(i)
    }

    if (!existingIds.has(federationId)) {
      return federationId
    }
    i++
  }
}
