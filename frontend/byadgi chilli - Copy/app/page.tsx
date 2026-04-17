"use client"

import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { InfoSection } from "@/components/info-section"
import { GradingTool } from "@/components/grading-tool"
import { HowItWorks } from "@/components/how-it-works"
import { AboutSection } from "@/components/about-section"
import { Footer } from "@/components/footer"
import { AnimatedWrapper } from "@/components/animated-wrapper"
import { FAQSection } from "@/components/faq-section"

export default function Home() {
  return (
   <div className="bg-white">
      <Header />
   
 <main>

  {/* ✅ FULL WIDTH HERO */}
  <AnimatedWrapper>
    <HeroSection />
  </AnimatedWrapper>

  {/* ✅ FULL WIDTH GRADING TOOL */}
  <AnimatedWrapper>
    <GradingTool />
  </AnimatedWrapper>

  {/* ✅ CONTAINER STARTS ONLY HERE */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

    <AnimatedWrapper>
      <InfoSection />
    </AnimatedWrapper>

    <AnimatedWrapper>
      <HowItWorks />
    </AnimatedWrapper>

    <AnimatedWrapper>
      <FAQSection />
    </AnimatedWrapper>

    <AnimatedWrapper>
      <AboutSection />
    </AnimatedWrapper>

  </div>

</main>
      <Footer />
    </div>
  )
}
