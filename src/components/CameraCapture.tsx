"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, RefreshCw, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface CameraCaptureProps {
  open: boolean
  onClose: () => void
  onCapture: (file: File) => void
  title: string
}

export function CameraCapture({ open, onClose, onCapture, title }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)

  // Start the video stream
  const startCamera = async (mode: "user" | "environment") => {
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      setCameraActive(false)

      if (typeof window === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("UNSUPPORTED_CONTEXT")
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(console.error)
      }
      setCameraActive(true)
    } catch (err: any) {
      console.error("Camera access failed:", err)
      if (err.message === "UNSUPPORTED_CONTEXT") {
        toast.error("Camera access is not supported by your browser or connection. Note that camera access requires a secure connection (HTTPS or localhost).")
      } else {
        toast.error("Unable to access camera. Please ensure permissions are granted.")
      }
      onClose()
    }
  }

  // Stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }

  // Handle switching camera
  const toggleCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user"
    setFacingMode(nextMode)
    if (open) {
      startCamera(nextMode)
    }
  }

  // Capture the photo
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        // Set canvas dimensions matching video feed
        const width = video.videoWidth || 640
        const height = video.videoHeight || 480
        canvas.width = width
        canvas.height = height

        // Draw current video frame onto canvas
        context.drawImage(video, 0, 0, width, height)

        // Generate base64 data URL preview
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
        setCapturedImage(dataUrl)
      }
    }
  }

  // Confirm the captured photo
  const confirmPhoto = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            const fileName = `camera_capture_${Date.now()}.jpg`
            const file = new File([blob], fileName, { type: "image/jpeg" })
            onCapture(file)
            toast.success("Photo captured successfully!")
            handleClose()
          } else {
            toast.error("Failed to process photo.")
          }
        },
        "image/jpeg",
        0.9
      )
    }
  }

  const handleClose = () => {
    stopCamera()
    setCapturedImage(null)
    onClose()
  }

  // Start camera when modal opens
  useEffect(() => {
    if (open) {
      startCamera(facingMode)
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose() }}>
      <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground border rounded-3xl shadow-xl overflow-hidden p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" /> {title}
          </DialogTitle>
          <DialogDescription>
            Position yourself or your document in the frame, then press capture.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Live Video Preview container */}
          <div className="relative w-full aspect-video rounded-2xl bg-black overflow-hidden border border-border shadow-inner flex items-center justify-center">
            {capturedImage ? (
              // Display captured preview
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={capturedImage}
                alt="Captured Snapshot"
                className="w-full h-full object-cover"
              />
            ) : (
              // Display live webcam stream
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${cameraActive ? "opacity-100" : "opacity-0"}`}
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm font-semibold">Starting camera feed...</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls area */}
          <div className="flex items-center justify-center gap-4">
            {capturedImage ? (
              // Options after capturing
              <>
                <Button
                  variant="outline"
                  onClick={() => setCapturedImage(null)}
                  className="rounded-full px-6 gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  <X className="w-4 h-4" /> Retake
                </Button>
                <Button
                  onClick={confirmPhoto}
                  className="rounded-full px-6 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-600/10"
                >
                  <Check className="w-4 h-4" /> Use Photo
                </Button>
              </>
            ) : (
              // Options while camera is live
              <>
                <Button
                  variant="outline"
                  onClick={toggleCamera}
                  className="rounded-full px-4 h-10 border-border"
                  title="Switch Camera (Front/Back)"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Switch Camera
                </Button>
                <Button
                  onClick={capturePhoto}
                  disabled={!cameraActive}
                  className="rounded-full px-8 h-12 gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                  <Camera className="w-5 h-5" /> Capture Photo
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Hidden Canvas for capture rendering */}
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
