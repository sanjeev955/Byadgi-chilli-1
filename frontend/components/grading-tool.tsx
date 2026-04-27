"use client"

import { useState, useRef, useEffect } from 'react'
import { Client } from "@gradio/client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, AlertCircle, RotateCcw, CheckCircle } from 'lucide-react'

interface GradeResult {
  predicted_class: string
  confidence: number
  all_predictions: Record<string, number>
  features: {
    color: string
    size: string
    wrinkle: string
  }
}

/* =========================
   🎨 STYLE HELPERS
========================= */

const getGradeStyle = (grade: string) => {
  switch (grade) {
    case "DHQ":
      return {
        bg: "bg-green-700 shadow-green-500/40",
        text: "text-green-300",
        bar: "bg-green-500"
      }
    case "DLQ":
      return {
        bg: "bg-yellow-600 shadow-yellow-400/40",
        text: "text-yellow-200",
        bar: "bg-yellow-400"
      }
    case "KHQ":
      return {
        bg: "bg-orange-600 shadow-orange-400/40",
        text: "text-orange-200",
        bar: "bg-orange-400"
      }
    case "KLQ":
      return {
        bg: "bg-red-700 shadow-red-500/40",
        text: "text-red-300",
        bar: "bg-red-500"
      }
    default:
      return {
        bg: "bg-slate-900",
        text: "text-white",
        bar: "bg-slate-500"
      }
  }
}

/* =========================
   ✅ FULL FORM MAP (ADDED ONLY THIS)
========================= */

const gradeFullForm: Record<string, string> = {
  DHQ: "Dabbi High Quality",
  DLQ: "Dabbi Low Quality",
  KHQ: "Kaddi High Quality",
  KLQ: "Kaddi Low Quality"
}

export default function GradingTool() {
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

  /* =========================
     CAMERA
  ========================= */
  const enableCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch {
      setMessage("Camera access failed.")
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

    canvas.getContext('2d')?.drawImage(video, 0, 0)

    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(blob))
      disableCamera()
      setTab('upload')
    })
  }

  /* =========================
     FILE
  ========================= */
  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setSelectedFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setResult(null)
  }

  /* =========================
     ANALYZE
  ========================= */
  const doAnalyze = async () => {
    if (!selectedFile) return

    setAnalyzing(true)
    setMessage(null)

    try {
      const app = await Client.connect("01fe23bca294/chilli-grader-final")

      const prediction = await app.predict("/run_model", [
        selectedFile,
      ])

      const data = prediction?.data as any

      if (!data || !data[0]) {
        throw new Error("No data returned")
      }

      setResult(data[0] as GradeResult)

    } catch (err: any) {
      console.error(err)
      setMessage("Connection error. Check backend.")
    } finally {
      setAnalyzing(false)
    }
  }

  const resetAll = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    setResult(null)
    setMessage(null)
    disableCamera()
  }

  useEffect(() => {
    return () => disableCamera()
  }, [])

  /* =========================
     UI
  ========================= */
  const gradeStyle = result ? getGradeStyle(result.predicted_class) : null

  return (
    <section className="min-h-screen py-8 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">

        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold">Chilli Grader</h1>
          <p className="text-slate-500">Neural Network Quality Grading</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* INPUT */}
          <Card>
            <CardHeader><CardTitle>Input</CardTitle></CardHeader>
            <CardContent>

              <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="camera">Camera</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <div
                    className="border-dashed border-2 p-6 rounded-xl text-center cursor-pointer"
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <input id="file-input" type="file" className="hidden" onChange={pickFile} />

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
                  <Button onClick={doAnalyze} disabled={analyzing} className="flex-1 bg-red-700 hover:bg-red-800">
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

          {/* RESULT */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex gap-2 items-center">
                <CheckCircle /> Results
              </CardTitle>
            </CardHeader>

            <CardContent>

              {result ? (
                <>
                  {/* RESULT CARD */}
                  <div className={`p-6 rounded-xl text-white text-center ${gradeStyle?.bg}`}>
                    <p className="text-xs">GRADE</p>
                    <p className="text-4xl font-bold">{result.predicted_class}</p>

                    {/* ✅ FULL FORM ADDED */}
                    <p className={`mt-1 ${gradeStyle?.text}`}>
                      {gradeFullForm[result.predicted_class]}
                    </p>

                    <p className={`mt-2 ${gradeStyle?.text}`}>
                      {(result.confidence * 100).toFixed(1)}% Confidence
                    </p>
                  </div>

                  {/* FEATURES */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {Object.entries(result.features).map(([k, v]) => (
                      <div key={k} className="bg-slate-100 p-3 rounded text-center">
                        <p className="text-xs text-gray-500">{k}</p>
                        <p className="font-semibold">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* PROGRESS BARS */}
                  <div className="mt-4 space-y-2">
                    {Object.entries(result.all_predictions).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between text-sm">
                          <span>
                            {k} — {gradeFullForm[k]}
                          </span>
                          <span>{(v * 100).toFixed(1)}%</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                          <div
                            className={`h-2 ${gradeStyle?.bar} transition-all duration-700`}
                            style={{ width: `${v * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </>
              ) : analyzing ? (
                <div className="text-center py-10">
                  <Loader2 className="animate-spin mx-auto" />
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
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
