"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import { MapPin, Shield, Flame, Zap, Droplets, Award, Package } from "lucide-react"

const features = [
  {
    title: "High Color Value",
    description: "ASTA 120-180, premium deep red color",
    icon: Award,
  },
  {
    title: "Low Pungency",
    description: "12,000 SHU, mild heat profile",
    icon: Flame,
  },
  {
    title: "Wrinkled Texture",
    description: "Distinctive wrinkled surface",
    icon: Droplets,
  },
  {
    title: "Thick Skin",
    description: "Robust skin quality",
    icon: Shield,
  },
]

const packageSizes = ["50kg", "25kg", "10kg", "5kg"]

export function ByadagiInfo() {
  return (
    <section className="bg-muted/50 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Byadagi Chilli
          </h2>
          <p className="mx-auto max-w-3xl text-muted-foreground text-lg">
            Famous dried chilli variety known for its vibrant color and mild heat. Primarily grown in Karnataka, Telangana, and Andhra Pradesh regions.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-2 mb-16">
          <Card className="shadow-md border">
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                  <MapPin className="size-5 text-secondary" />
                  Origins
                </h3>
                <p className="text-sm text-muted-foreground">
                  Karnataka, Telangana, Andhra Pradesh
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Zap className="size-5 text-secondary" />
                  Characteristics
                </h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Long and thin shape</li>
                  <li>• Low heat level</li>
                  <li>• Fewer seeds</li>
                  <li>• Distinctive wrinkles</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Spice Level</h3>
                <div className="flex gap-1">
                  <Flame className="size-6 text-destructive fill-current" />
                  <Flame className="size-6 text-muted-foreground" />
                  <Flame className="size-6 text-muted-foreground" />
                  <Flame className="size-6 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Low spiciness</p>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Package className="size-5 text-secondary" />
                  Package Types
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {packageSizes.map((size) => (
                    <div key={size} className="border border-border rounded-lg p-3 text-center bg-card shadow-sm hover:shadow-md transition-shadow">
                      <span className="font-mono font-semibold text-sm">{size}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>12,000</span>
                  <span>17,000</span>
                </div>
                <Progress value={70} className="h-2 [&>div]:bg-destructive" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>150</span>
                  <span>200</span>
                </div>
                <Progress value={75} className="h-2 [&>div]:bg-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-md border overflow-hidden">
            <div className="relative h-[36rem] shadow-lg">
              <Image
                src="/images/chilli-hero.jpg"
                alt="Byadagi Chilli"
                fill
                className="object-cover rounded-xl"
              />
            </div>
          </Card>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border bg-card text-center hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-8 pb-6">
                <div className="mx-auto mb-4 inline-flex rounded-full bg-secondary/10 p-4">
                  <feature.icon className="size-6 text-secondary" />
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
