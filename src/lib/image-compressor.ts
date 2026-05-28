/**
 * Utility function to compress images on the client side using the Canvas API.
 * Shrinks dimensions to a maximum boundary (default 1200px) and applies JPEG compression.
 * Reduces 3MB-5MB images to ~100KB-200KB instantly.
 */
export async function compressImage(
  file: File, 
  maxWidth: number = 1200, 
  maxHeight: number = 1200, 
  quality: number = 0.75
): Promise<File> {
  return new Promise((resolve) => {
    // Only process standard images
    if (!file.type.startsWith("image/")) {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height

        // Constrain dimensions preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          return resolve(file)
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file)
            }
            // Generate a compressed JPEG file preserving the original name prefix
            const originalNamePrefix = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
            const compressedFile = new File(
              [blob], 
              `${originalNamePrefix}_compressed.jpg`, 
              {
                type: "image/jpeg",
                lastModified: Date.now()
              }
            )
            resolve(compressedFile)
          },
          "image/jpeg",
          quality
        )
      }
      img.onerror = () => resolve(file)
      img.src = event.target?.result as string
    }
    reader.onerror = () => resolve(file)
    reader.readAsDataURL(file)
  })
}
