"use client"

import { Header } from "@/components/header"
import { GradingTool } from "@/components/grading-tool"
import { Footer } from "@/components/footer"

export default function GradingPage() {
  return (
<div className="bg-white">      <Header />
      <main className="pt-8">
        <GradingTool />
      </main>
      <Footer />
    </div>
  )
}
