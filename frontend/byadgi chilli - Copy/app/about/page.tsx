"use client"

import { Header } from "@/components/header"
import { AboutSection } from "@/components/about-section"
import { HowItWorks } from "@/components/how-it-works"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-primary py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              About ByadgiGrade
            </h1>
            <p className="mx-auto max-w-2xl text-pretty text-lg text-primary-foreground/90">
              Learn more about our AI-powered Byadgi chilli quality grading system
              and how it helps farmers and traders.
            </p>
          </div>
        </section>
        <AboutSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
