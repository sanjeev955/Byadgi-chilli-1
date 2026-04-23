"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Camera, Loader2, AlertCircle, RotateCcw, CheckCircle } from 'lucide-react'

interface GradeResult {
  predicted_class: string
  confidence: number
  all_predictions: Record<string, number>
  features?: {
    color: string
    size: string
    wrinkle: string
  }
}

export function GradingTool() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tab, setTab] = useState<'upload' | 'camera'>('upload')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch {
      setMessage("Camera access failed")
    }
  }

  const disableCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraReady(false)
  }

  const snapPhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
          setSelectedFile(file)
          setPreviewUrl(URL.createObjectURL(blob))
          disableCamera()
          setTab('upload')
        }
      })
    }
  }

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setSelectedFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const doAnalyze = async () => {
    if (!selectedFile) return
    setAnalyzing(true)

    const fd = new FormData()
    fd.append('image', selectedFile)

    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      console.log(data) // DEBUG
      setResult(data)
    } catch {
      setMessage("Backend not running")
    }

    setAnalyzing(false)
  }

  const resetAll = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    setResult(null)
    setMessage(null)
    disableCamera()
  }

  useEffect(() => {
    return disableCamera
  }, [])

  return (
    <section className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold">Chilli Grader</h1>
          <p className="text-muted-foreground">DHQ / DLQ / KHQ / KLQ</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* LEFT */}
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent>

              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="camera">Camera</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <div
                    className="border-dashed border-2 p-6 rounded-xl text-center cursor-pointer"
                    onClick={() => document.getElementById('file')?.click()}
                  >
                    <input id="file" type="file" className="hidden" onChange={pickFile} />

                    {previewUrl ? (
                      <img src={previewUrl} className="max-h-60 mx-auto rounded" />
                    ) : (
                      <p>Click to upload</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="camera">
                  <video ref={videoRef} autoPlay className="w-full rounded" />
                  {!cameraReady && <Button onClick={enableCamera}>Open Camera</Button>}
                  {cameraReady && <Button onClick={snapPhoto}>Capture</Button>}
                  <canvas ref={canvasRef} className="hidden" />
                </TabsContent>
              </Tabs>

              {selectedFile && (
                <div className="flex gap-2 mt-4">
                  <Button onClick={doAnalyze} disabled={analyzing} className="flex-1">
                    {analyzing ? <Loader2 className="animate-spin" /> : "Analyze"}
                  </Button>
                  <Button onClick={resetAll} variant="outline">
                    <RotateCcw />
                  </Button>
                </div>
              )}

              {message && (
                <div className="text-red-500 mt-2 flex gap-2">
                  <AlertCircle size={16} /> {message}
                </div>
              )}

            </CardContent>
          </Card>

          {/* RIGHT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle /> Result
              </CardTitle>
            </CardHeader>

            <CardContent>

              {result ? (
                <>
                  {/* Grade */}
                  <div className="p-4 rounded bg-muted mb-4">
                    <p className="text-sm text-muted-foreground">Grade</p>
                    <p className="text-2xl font-bold">{result.predicted_class}</p>
                  </div>

                  {/* Confidence */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm">
                      Confidence
                      <span>{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <Progress value={result.confidence * 100} />
                  </div>

                  {/* 🔥 FEATURES (NEW) */}
                  {result.features && (
                    <div className="border-t pt-4 mb-4">

                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                        Chilli Analysis
                      </h3>

                      <div className="grid grid-cols-3 gap-3">

                        <div className="p-3 rounded bg-muted text-center">
                          <p className="text-xs text-muted-foreground">Color</p>
                          <p className="font-semibold">{result.features.color}</p>
                        </div>

                        <div className="p-3 rounded bg-muted text-center">
                          <p className="text-xs text-muted-foreground">Size</p>
                          <p className="font-semibold">{result.features.size}</p>
                        </div>

                        <div className="p-3 rounded bg-muted text-center">
                          <p className="text-xs text-muted-foreground">Wrinkle</p>
                          <p className="font-semibold">{result.features.wrinkle}</p>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Probabilities */}
                  {Object.entries(result.all_predictions).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm mb-1">
                      <span>{k}</span>
                      <span>{Math.round(v * 100)}%</span>
                    </div>
                  ))}

                </>
              ) : analyzing ? (
                <div className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto mb-2" />
                  Processing...
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  Upload image to analyze
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  )
}