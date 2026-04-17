import { Card, CardContent } from "@/components/ui/card"
import { Upload, Cpu, BarChart3 } from "lucide-react"

const steps = [
  {
    step: 1,
    title: "Upload chilli image",
    description:
      "Take a clear photo of your Byadgi chilli and upload it to our system",
    icon: Upload,
  },
  {
    step: 2,
    title: "AI analyzes the image",
    description:
      "Our machine learning model examines color, wrinkles, and size characteristics",
    icon: Cpu,
  },
  {
    step: 3,
    title: "System predicts quality grade",
    description:
      "Get instant results with quality grade (A1, A2, B1, B2) and detailed metrics",
    icon: BarChart3,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Three simple steps to grade your Byadgi chillies
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((item) => (
            <Card
              key={item.step}
              className="relative overflow-hidden border-border bg-card transition-shadow hover:shadow-lg"
            >
              <CardContent className="pt-8">
                <div className="absolute -right-4 -top-4 text-8xl font-bold text-muted/30">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <item.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
