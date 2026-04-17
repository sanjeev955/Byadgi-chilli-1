"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How does Byadgi pungency compare to other Indian varieties?",
    answer:
      "Byadgi is categorized as mild (12,000–17,000 SHU), which is significantly lower than high-heat varieties like Teja S17 (70,000–90,000 SHU).",
  },
  {
    question: "What is the industrial advantage of Byadgi over synthetic dyes?",
    answer:
      'Its high ASTA colour value (100–200+) allows food brands to achieve a "Clean Label" status by replacing synthetic dyes like Red 40 with natural pigments.',
  },
  {
    question: "Does cold storage affect the extraction yield?",
    answer:
      "Yes. Maintaining chillies in cold storage (4–6°C) can increase the amount of extractable oleoresin by 30–40% compared to ambient storage.",
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
<section id="faq" className="py-16 scroll-mt-24">      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-center mb-10">
        Frequently Asked Questions
      </h2>

      <div className="max-w-3xl mx-auto space-y-4">

        {faqs.map((faq, index) => (
          <div
            key={index}
            className="glass p-5 rounded-xl cursor-pointer transition-all"
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          >
            {/* QUESTION */}
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-900">
                {faq.question}
              </p>

              <ChevronDown
                className={`transition-transform duration-300 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* ANSWER */}
            {openIndex === index && (
              <p className="text-gray-600 mt-3 text-sm leading-relaxed">
                {faq.answer}
              </p>
            )}
          </div>
        ))}

      </div>
    </section>
  )
}