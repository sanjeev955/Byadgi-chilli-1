"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Camera, Sparkles, Loader2, AlertCircle, RotateCcw, CheckCircle } from 'lucide-react'

const gradeMap: Record<string, string> = {
  DHQ: "Dabbi High Quality",
  DLQ: "Dabbi Low Quality",
  KHQ: "Kaddi High Quality",
  KLQ: "Kaddi Low Quality",
}

interface GradeResult {
  predicted_class: string
  confidence: number
  all_predictions: Record<string, number>
}

export function GradingTool() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tab, setTab] = useState<'upload' | 'camera'>('upload')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)

  const videoEl = useRef<HTMLVideoElement>(null)
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const stream = useRef<MediaStream | null>(null)

  const getGradeStyle = (grade: string) => {
    if (['DHQ', 'KHQ'].includes(grade)) {
      return {
        color: 'text-emerald-600',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        badge: 'bg-emerald-500 text-white'
      }
    }
    if (['DLQ', 'KLQ'].includes(grade)) {
      return {
        color: 'text-red-600',
        bg: 'bg-red-400 hover:bg-red-500/10',
        border: 'border-red-500/20',
        badge: 'bg-red-400 hover:bg-red-500 text-white'
      }
    }
    return {
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      border: 'border-muted',
      badge: 'bg-muted text-foreground'
    }
  }

  const enableCamera = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })

      if (videoEl.current) {
        videoEl.current.srcObject = stream.current
        videoEl.current.oncanplay = () => setCameraReady(true)
        await videoEl.current.play()
      }
    } catch {
      setMessage('Camera access failed')
    }
  }

  const disableCamera = () => {
    stream.current?.getTracks().forEach(t => t.stop())
    stream.current = null
    if (videoEl.current) videoEl.current.srcObject = null
    setCameraReady(false)
  }

  const snapPhoto = () => {
    const video = videoEl.current
    const canvas = canvasEl.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0)
      canvas.toBlob((blob) => {
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
      setResult(data)
    } catch {
      setMessage('Backend not running')
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
    <section className="pt-6 pb-9">
      <div className="max-w-6xl mx-auto px-4">

        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Chilli Grader
          </h1>
          <p className="text-muted-foreground mt-2">
            DHQ / DLQ / KHQ / KLQ Prediction
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* LEFT */}
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles /> Input
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="camera">Camera</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <div
                    className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer"
                    onClick={() => document.getElementById('file')?.click()}
                  >
                    <input id="file" type="file" className="hidden" onChange={pickFile} />
                    {previewUrl ? (
                      <img src={previewUrl} className="max-h-60 mx-auto rounded-lg" />
                    ) : (
                      <p className="text-muted-foreground">Click to upload image</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="camera">
                  <div className="space-y-3">
                    <video ref={videoEl} className="w-full rounded-lg" autoPlay />
                    {!cameraReady && (
                      <Button onClick={enableCamera} className="w-full">Open Camera</Button>
                    )}
                    {cameraReady && (
                      <Button onClick={snapPhoto} className="w-full">Take Photo</Button>
                    )}
                    <canvas ref={canvasEl} className="hidden" />
                  </div>
                </TabsContent>
              </Tabs>

              {selectedFile && (
                <div className="flex gap-2">
                  <Button onClick={doAnalyze} disabled={analyzing} className="flex-1">
                    {analyzing ? <Loader2 className="animate-spin" /> : "Analyze"}
                  </Button>
                  <Button variant="outline" onClick={resetAll}>
                    <RotateCcw />
                  </Button>
                </div>
              )}

              {message && (
                <div className="text-red-400 text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* RIGHT */}
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <CheckCircle /> Result
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              {result ? (
                <>
                  {(() => {
                    const style = getGradeStyle(result.predicted_class)
                    return (
                      <div className={`p-4 rounded-xl border ${style.bg} ${style.border}`}>
                        <p className="text-sm text-muted-foreground">Grade</p>
                        <p className={`text-3xl font-bold ${style.color}`}>
                          {gradeMap[result.predicted_class] || result.predicted_class}
                        </p>

                        <span className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${style.badge}`}>
                          {['DHQ','KHQ'].includes(result.predicted_class) ? 'High Quality' : 'Low Quality'}
                        </span>
                      </div>
                    )
                  })()}

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      Confidence
                      <span>{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <Progress value={result.confidence * 100} />
                  </div>

                  <div className="border-t" />

                  {Object.entries(result.all_predictions).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span>{gradeMap[k] || k}</span>
                      <span>{Math.round(Number(v) * 100)}%</span>
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
                  Upload image to see result
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  )
}