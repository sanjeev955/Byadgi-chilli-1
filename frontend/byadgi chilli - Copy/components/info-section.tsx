"use client"

import { Parallax } from "@/components/parallax"
export function InfoSection() {
  return (
<section id="info" className="pt-4 pb-12 space-y-4">
  {/* 🔥 ADD TITLE HERE (INSIDE SECTION) */}
  <div className="text-center">
<h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900">      Chilli Info
    </h2>
    <div className="w-12 h-1 bg-red-400 mx-auto mt-2 rounded-full"></div>
  </div>
  <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center">
<div className="space-y-5">
           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-900">
            Byadagi Chilli
          </h1>

          <p className="text-gray-600 text-base leading-relaxed max-w-xl">
            Byadgi chilli is a premium variety of Capsicum annuum cultivated mainly in Karnataka, India. It is highly valued for its deep red color, low pungency (12,000–17,000 SHU), and high oleoresin content, making it ideal for natural color extraction in the food industry. 

This chilli is primarily classified into two commercial types:

Dabbi – Characterized by smaller size, round shape, deep red color, and higher seed content. It is widely used for oleoresin extraction due to its rich pigment concentration.

Kaddi – Identified by its longer size, wrinkled surface, and lower seed content. It is preferred for culinary purposes and export markets because of its superior appearance and quality.

Byadgi chilli plays a significant role in Indian cuisine and is extensively used in spice blends, food processing, and natural coloring applications.
          </p>

          {/* SHU */}
          <div>
            <p>SHU: 12,000</p>
            <div className="w-full bg-gray-200 h-3 rounded mt-2">
              <div className="bg-red-400 hover:bg-red-500 h-3 w-[70%]"></div>
            </div>
          </div>

          {/* ASTA */}
          <div>
            <p>ASTA: 100</p>
            <div className="w-full bg-gray-200 h-3 rounded mt-2">
              <div className="bg-red-400 h-3 w-[60%]"></div>
            </div>
          </div>
        </div>

        <Parallax>
  <img
    src="/images/byadagi-1.png"
    className="rounded-2xl shadow-lg"
  />
</Parallax>
      </div>

      {/* FEATURES */}
      <div className="text-center space-y-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
          <span className="text-red-400">What Makes</span>{" "}
          <span className="text-gray-900">It Unique?</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "High ASTA colour value",
            "Low capsaicin content",
            "Wrinkled skin",
            "Thick pericarp"
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-2xl glass">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      <div className="text-center space-y-10">
        <h2 className="text-3xl font-bold text-gray-900">
          Related Products
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Chilli Seeds", img: "/images/seeds.png" },
            { name: "Chilli Powder", img: "/images/powder.png" },
            { name: "Chilli Flakes", img: "/images/flakes.png" },
          ].map((item, i) => (
            <div key={i} className="space-y-3 glass p-5 rounded-2xl">
              <img
                src={item.img}
                className="rounded-xl mx-auto h-40 object-cover"
              />
              <p>{item.name}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}