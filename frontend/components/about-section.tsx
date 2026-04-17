import { Card, CardContent } from "@/components/ui/card"
import { Database, Brain, Leaf } from "lucide-react"

const features = [
  {
    title: "Image Dataset",
    description:
      "Trained on thousands of high-quality Byadgi chilli images to ensure accurate grading",
    icon: Database,
  },
  {
    title: "Machine Learning Model",
    description:
      "Advanced deep learning algorithms analyze visual features with high precision",
    icon: Brain,
  },
  {
    title: "Agricultural Quality Analysis",
    description:
      "Comprehensive assessment based on industry-standard quality parameters",
    icon: Leaf,
  },
]

export function AboutSection() {
  return (
    <section id="about" className="bg-muted/50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            About the Project
          </h2>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            ByadgiGrade is a machine learning project designed to automatically
            grade Byadgi chillies using computer vision. Our system leverages
            state-of-the-art AI technology to analyze chilli images and provide
            accurate quality assessments, helping farmers and traders make
            informed decisions.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border bg-card text-center"
            >
              <CardContent className="pt-8">
                <div className="mx-auto mb-4 inline-flex rounded-full bg-secondary/10 p-4">
                  <feature.icon className="size-8 text-secondary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
