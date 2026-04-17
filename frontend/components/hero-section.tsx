"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Info } from "lucide-react"

export function HeroSection() {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about")
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="home"
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/chilli-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-foreground/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-background sm:text-5xl lg:text-6xl">
          Automated Byadgi Chilli Quality Grading
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-background/90 sm:text-xl">
          AI-powered system that analyzes Byadgi chilli images and predicts
          quality grade based on color, wrinkles, and size.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2" asChild>
            <Link href="/grading">
              Start Grading
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
  variant="outline"
  onClick={() => {
    const el = document.getElementById("info")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }}
>
  Learn More
</Button>
        </div>
      </div>
    </section>
  )
}
