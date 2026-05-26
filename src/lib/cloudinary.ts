import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadBuffer(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, type: "private", resource_type: "auto" },
      (error, result) => {
        if (error) {
          console.error("[CLOUDINARY_BUFFER_UPLOAD_ERROR]", error)
          return reject(error)
        }
        resolve(result!.secure_url)
      }
    ).end(buffer)
  })
}

export async function uploadBase64(base64Data: string, folder: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      type: "private",
      resource_type: "auto"
    })
    return result.secure_url
  } catch (error) {
    console.error("[CLOUDINARY_BASE64_UPLOAD_ERROR]", error)
    throw error
  }
}
