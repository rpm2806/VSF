import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const url = searchParams.get("url")

    if (!url) {
      return new NextResponse("Missing url parameter", { status: 400 })
    }

    // Only proxy cloudinary urls
    if (!url.includes("cloudinary.com")) {
      return NextResponse.redirect(url)
    }

    // Determine if it's a private or public upload based on URL structure
    const isPrivate = url.includes("/private/")
    const type = isPrivate ? "private" : "upload"

    // Extract the public ID from the URL
    // Typical URL: https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/folder/filename.jpg
    const parts = url.split('/')
    const vIndex = parts.findIndex(p => p.startsWith('v') && !isNaN(parseInt(p.substring(1))))
    
    if (vIndex !== -1) {
      const publicIdWithExt = parts.slice(vIndex + 1).join('/')
      // Remove file extension for public_id
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.')) || publicIdWithExt

      // Generate a signed URL for the asset
      const signedUrl = cloudinary.url(publicId, {
        type,
        sign_url: true,
        secure: true
      })

      // Redirect the client to the securely signed URL
      return NextResponse.redirect(signedUrl)
    }

    // Fallback if URL parsing fails
    return NextResponse.redirect(url)
  } catch (error) {
    console.error("[SECURE_IMAGE_PROXY_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
